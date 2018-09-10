import {ConnectionsStorage} from "./ConnectionsStorage";
import {IPlayerState, IState} from "../src/common/state.model";
import {IClientRegisterMessage} from "./SocketMiddleware";
import * as ws from 'ws';
import {merge, Observable, Subject} from 'rxjs/index';
import {filter} from 'rxjs/operators';
import {IMessage} from '../src/common/WebsocketConnection';
import {LeaderBoard} from './LeaderBoard';
import {Inject} from '../src/common/InjectDectorator';
import {Maybe} from "../src/common/helpers/Maybe";
import {BattleState} from '../src/common/battle/BattleState.model';
import {first, pluck, tap} from 'rxjs/internal/operators';
import {mergeDeep} from '../src/common/helpers/mergeDeep';

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
                    mode: BattleState.results,
                    endTime: Date.now()
                });

                this.connectionsStorage.setState(state);
                this.leaderBoard.write(state);
                this.connectionsStorage.endSession(data.sessionResult);
            });

        this.on$('newSession').subscribe(data => {
            this.connectionsStorage.newSession();
        });

        merge(
            this.on$('registerLeftPlayer'),
            this.on$('registerRightPlayer')
        )
            .pipe(first())
            .subscribe(() => {
                this.connectionsStorage.setState({
                    createTime: Date.now()
                });

                this.guestConnectionsStorage.guest.dispatchRoomsChanged();
            });

        this.on$('state').subscribe(data => {
            const isAllReady = this.isAllPlayersReady(data.state);
            let modeIsChanged = false;

            if (isAllReady && (this.state.mode !== BattleState.ready && this.state.mode !== BattleState.results)) {
                data.state.mode = BattleState.ready;

                modeIsChanged = true;
            }

            this.connectionsStorage.setState(data.state);

            const leftUpdated = this.isNeedToUpdateRooms(data.state.left);
            const rightUpdated = this.isNeedToUpdateRooms(data.state.right);

            if (leftUpdated || rightUpdated || modeIsChanged) {
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

    reloadSession() {
        this.connectionsStorage.newSession();
    }

    private on$(event: string): Observable<any> {
        return this.onMessage$
            .pipe(filter(message => message.type === event));
    }

    private isAllPlayersReady(newState: Partial<IState>): boolean {
        const mergedState = mergeDeep({}, this.state, newState);

        const leftIsReady = Maybe(mergedState).pluck('left.isReady').getOrElse(false);
        const rightIsReady = Maybe(mergedState).pluck('right.isReady').getOrElse(false);

        return leftIsReady && rightIsReady;
    }

    private isNeedToUpdateRooms(playerState: Partial<IPlayerState> = {}): boolean {
        const fields = ['name', 'isReady'];

        return fields.some(key => key in playerState);
    }
}