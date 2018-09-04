import * as ws from 'ws';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {Observable, fromEvent} from 'rxjs/index';
import {connection} from 'websocket';
import {Inject} from '../src/common/InjectDectorator';
import {LeaderBoard} from './LeaderBoard';
import {ConnectionsStorage} from './ConnectionsStorage';
import {IMessage} from '../src/common/WebsocketConnection';

export class SocketMiddleware {
    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(ConnectionsStorage) private connectionsStorage: ConnectionsStorage;

    get onMessage$(): Observable<any> {
        return fromEvent<MessageEvent>(this.ws, 'message')
            .pipe(
                filter(message => message.type === 'message'),
                map(message => JSON.parse(message.data)),
                tap(message => this.tryRegisterConnection(message)),
                catchError(error => {
                    console.log(error);

                    return [];
                })
            )
    }

    get onClose$(): Observable<void> {
        return fromEvent(this.ws, 'close');
    }

    connection: connection;

    constructor(private ws: ws) {

        this.connection = <any>ws;

        this.onClose$.subscribe(() => {
            this.connectionsStorage.onConnectionLost(this.connection);
        });

        this.on$('sendWinner').subscribe(data => {
            const state = Object.assign({}, data.sessionResult, this.connectionsStorage.state);

            this.leaderBoard.write(state);
            this.connectionsStorage.endSession(data.sessionResult);
        });

        this.on$('newSession').subscribe(data => {
            this.connectionsStorage.newSession();
        });

        this.on$('state').subscribe(data => {
            this.connectionsStorage.setState(data.state);
        });

    }

    private on$(event: string): Observable<any> {
        return this.onMessage$
            .pipe(filter(message => message.type === event));
    }

    private tryRegisterConnection(data: IMessage) {
        if (!this.connectionsStorage.isRegistered(this.connection)) {
            this.connectionsStorage.registerConnection(data, this.connection);

            if (!this.connectionsStorage.isRegistered(this.connection)) {
                this.connection.close();

                return;
            }

            return;
        }
    }

}