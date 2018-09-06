import * as ws from 'ws';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {Observable, fromEvent} from 'rxjs/index';
import {connection} from 'websocket';
import {Inject} from '../src/common/InjectDectorator';
import {LeaderBoard} from './LeaderBoard';
import {ConnectionsStorage} from './ConnectionsStorage';
import {RoomStorage} from "./RoomStorage";

export interface IClientRegisterMessage {
    type: string;
    roomId: string;
}

export class SocketMiddleware {
    connection: connection;

    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;
    @Inject(ConnectionsStorage) private connectionsStorage: ConnectionsStorage;

    get onMessage$(): Observable<any> {
        return fromEvent<MessageEvent>(this.ws, 'message')
            .pipe(
                filter(message => message.type === 'message'),
                map(message => JSON.parse(message.data)),
                tap(message => {
                    const {roomId} = message;
                    const room = this.roomStorage.get(roomId);

                    this.roomStorage.addConnection(this.connection, room);

                    return room.tryRegisterConnection(message, this.connection);
                }),
                catchError(error => {
                    console.log(error);

                    return [];
                })
            )
    }

    get onClose$(): Observable<void> {
        return fromEvent(this.ws, 'close');
    }

    constructor(private ws: ws) {

        this.connection = <any>ws;

        this.onClose$.subscribe(() => {
            const room = this.roomStorage.getRoomByConnection(this.connection);

            if (room) {
                room.onConnectionLost(this.connection);
            }
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

    private tryRegisterConnection(data: IClientRegisterMessage) {
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