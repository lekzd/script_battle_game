import {ConnectionsStorage} from "./ConnectionsStorage";
import {IState} from "../src/common/state.model";
import {IClientRegisterMessage} from "./SocketMiddleware";
import * as ws from 'ws';
import {Observable, Subject} from 'rxjs/index';
import {filter} from 'rxjs/operators';
import {IMessage} from '../src/common/WebsocketConnection';
import {LeaderBoard} from './LeaderBoard';
import {Inject} from '../src/common/InjectDectorator';

export class Room {

    onMessage$ = new Subject<IMessage>();

    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

    private connectionsStorage = new ConnectionsStorage();

    get watchersCount(): number {
        let result = 0;

        this.connectionsStorage.connections.forEach(name => {
            if (name === 'master') {
                result++;
            }
        });

        return result;
    }

    get state(): Partial<IState> {
        return this.connectionsStorage.state;
    }

    constructor() {
        this.on$('sendWinner').subscribe(data => {
            const state = Object.assign({}, data.sessionResult, this.state);

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

    closeConnections() {
        this.connectionsStorage.close();
    }

    onConnectionLost(connection: ws) {
        this.connectionsStorage.onConnectionLost(connection);
    }

    tryRegisterConnection(data: IClientRegisterMessage, connection: ws) {
        if (!this.connectionsStorage.isRegistered(connection)) {
            this.connectionsStorage.registerConnection(data, connection);

            if (!this.connectionsStorage.isRegistered(connection)) {
                connection.close();

                return;
            }

            this.guestConnectionsStorage.guest.dispatchRoomsChanged();

            return;
        }
    }

    private on$(event: string): Observable<any> {
        return this.onMessage$
            .pipe(filter(message => message.type === event));
    }
}