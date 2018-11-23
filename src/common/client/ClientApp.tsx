import {WebsocketConnection} from '../WebsocketConnection';
import {Inject, setInject} from '../InjectDectorator';
import {BattleState} from '../battle/BattleState.model';
import {BattleSide} from '../battle/BattleSide';
import {ClientState} from "./ClientState";
import {LeftArmy} from "../../left/LeftArmy";
import {EnemyState} from "./EnemyState";
import {RightArmy} from "../../right/RightArmy";
import {IPlayerState, IState} from '../state.model';
import {catchError, distinctUntilChanged, filter, first, map, switchMap} from 'rxjs/internal/operators';
import {RoomService} from "../RoomService";
import {BattleGame} from '../battle/BattleGame';
import {PromptService} from '../../admin/PromptService';
import {ApiService} from '../ApiService';
import {Environment} from '../Environment';
import {render, h} from 'preact';
import {PlayerScreen} from "../../player/PlayerScreen";

export class ClientApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(EnemyState) private enemyState: EnemyState;
    @Inject(ApiService) private apiService: ApiService;
    @Inject(ClientState) private clientState: ClientState;
    @Inject(RoomService) private roomService: RoomService;
    @Inject(Environment) private environment: Environment;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor(private side: BattleSide) {
        this.clientState.side = side;

        if (side === BattleSide.left) {
            this.connection.registerAsLeftPlayer(this.roomService.roomId);

            setInject(LeftArmy, this.clientState.army);
            setInject(RightArmy, this.enemyState.army);
        } else {
            this.connection.registerAsRightPlayer(this.roomService.roomId);

            setInject(LeftArmy, this.enemyState.army);
            setInject(RightArmy, this.clientState.army);
        }

        this.clientState.change$
            .pipe(
                distinctUntilChanged((prev, current) => JSON.stringify(prev) === JSON.stringify(current))
            )
            .subscribe(clientState=> {
                const newState = {
                    left: {},
                    right: {}
                } as IState;

                if (side === BattleSide.left) {
                    Object.assign(newState.left, clientState);
                } else {
                    Object.assign(newState.right, clientState);
                }

                this.connection.sendState(newState, this.roomService.roomId);
            });

        this.connection.onMessage$.subscribe(message => {
            if (message.type === 'state') {
                this.battleGame.setState(message.data);
            }

            if (message.type === 'endSession') {
                const sessionResult = message.data.sessionResult;

                if (sessionResult.winner.toString() === this.clientState.side) {
                    this.battleGame.showWinnerScreen(message.data.sessionResult);
                } else {
                    this.battleGame.showLoseScreen(message.data.sessionResult);
                }
            }

            if (message.type === 'newSession') {
                location.reload();
            }
        });

        this.connection.onClose$.subscribe(() => {
            this.battleGame.setState(BattleState.connectionClosed);

            const {roomId} = this.roomService;

            this.apiService.getRoom(roomId)
                .pipe(
                    map(() => false),
                    catchError(() => [true]),
                    filter(response => response),
                    switchMap(() => this.promptService.alert('Error', 'Current room is no longer exists'))
                )
                .subscribe(() => {
                    location.href = this.environment.config.baseUrl;
                });
        });

        const enemySide = side === BattleSide.left ? BattleSide.right : BattleSide.left;

        this.connection.onState$<IPlayerState>(enemySide).subscribe(state => {
            this.enemyState.set(state);

            if (enemySide === BattleSide.left && state.army) {
                setInject(LeftArmy, state.army)
            }

            if (enemySide === BattleSide.right && state.army) {
                setInject(RightArmy, state.army)
            }
        });

        this.connection.onState$<IPlayerState>(side).subscribe(state => {
            this.clientState.setFromServer(state || {});

            if (side === BattleSide.left && state.army) {
                setInject(LeftArmy, state.army)
            }

            if (side === BattleSide.right && state.army) {
                setInject(RightArmy, state.army)
            }

        });

        this.connection.onState$<IState>()
            .pipe(first())
            .subscribe(state => {
                render((<PlayerScreen state={state} side={side} />), document.querySelector('.player'));
            });

    }
}