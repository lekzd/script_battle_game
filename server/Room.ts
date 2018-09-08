import {ConnectionsStorage} from "./ConnectionsStorage";
import {IState} from "../src/common/state.model";
import {IClientRegisterMessage} from "./SocketMiddleware";
import * as ws from 'ws';
import {Observable, Subject} from 'rxjs/index';
import {filter} from 'rxjs/operators';
import {IMessage} from '../src/common/WebsocketConnection';
import {LeaderBoard} from './LeaderBoard';
import {Inject} from '../src/common/InjectDectorator';
import {Maybe} from "../src/common/helpers/Maybe";
import {BattleState} from '../src/common/battle/BattleState.model';
import {first} from 'rxjs/internal/operators';

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

    constructor(public title: string) {
        this.connectionsStorage.setState({roomTitle: title});

        this.on$('sendWinner')
            .pipe(first())
            .subscribe(data => {
                const state = Object.assign({}, data.sessionResult, this.state, {
                    mode: BattleState.results
                });

                this.connectionsStorage.setState(state);
                this.leaderBoard.write(state);
                this.connectionsStorage.endSession(data.sessionResult);
            });

        this.on$('newSession').subscribe(data => {
            this.connectionsStorage.newSession();
        });

        this.on$('state').subscribe(data => {
            const leftIsReady = Maybe(data.state).pluck('left.isReady');
            const rightIsReady = Maybe(data.state).pluck('right.isReady');
            let modeIsChanged = false;

            if (leftIsReady && rightIsReady && data.state.mode !== BattleState.ready) {
                data.state.mode = BattleState.ready;

                modeIsChanged = true;
            }

            this.connectionsStorage.setState(data.state);

            const name = Maybe(data.state).pluck('left.name') || Maybe(data.state).pluck('right.name');
            const isReady = leftIsReady || rightIsReady;

            if (name || isReady || modeIsChanged) {
                this.guestConnectionsStorage.guest.dispatchRoomsChanged();
            }
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