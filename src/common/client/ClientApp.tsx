import {WebsocketConnection} from '../WebsocketConnection';
import {Inject, setInject} from '../InjectDectorator';
import {BattleState} from '../battle/BattleState.model';
import {EditorComponent} from '../editor/EditorComponent';
import {BattleSide} from '../battle/BattleSide';
import {ClientState} from "./ClientState";
import {LeftArmy} from "../../left/LeftArmy";
import {EnemyState} from "./EnemyState";
import {RightArmy} from "../../right/RightArmy";
import {IPlayerState, IState} from '../state.model';
import {catchError, distinctUntilChanged, filter, first, map, switchMap, tap} from 'rxjs/internal/operators';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {ClientComponent} from './ClientComponent';
import {Observable} from 'rxjs/index';
import {RoomService} from "../RoomService";
import {BattleGame} from '../battle/BattleGame';
import {PromptService} from '../../leaders/PromptService';
import {ApiService} from '../ApiService';
import {Environment} from '../Environment';
import {render, h} from 'preact';
import {BattleConsole} from '../console/BattleConsole';
import {RoomTimer} from '../roomTimer/RoomTimer';

export class ClientApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(EnemyState) private enemyState: EnemyState;
    @Inject(ApiService) private apiService: ApiService;
    @Inject(ClientState) private clientState: ClientState;
    @Inject(RoomService) private roomService: RoomService;
    @Inject(Environment) private environment: Environment;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    get leftIsReady$(): Observable<boolean> {
        return this.connection.onState$<boolean>('left', 'isReady')
            .pipe(filter(isReady => isReady === true));
    }

    get rightIsReady$(): Observable<boolean> {
        return this.connection.onState$<boolean>('right', 'isReady')
            .pipe(filter(isReady => isReady === true));
    }

    private editorComponent: EditorComponent;

    constructor(private side: BattleSide) {
        this.battleGame.init();

        this.clientState.side = side;

        render((<BattleConsole />), document.querySelector('.rightSide'));

        if (side === BattleSide.left) {
            this.connection.registerAsLeftPlayer(this.roomService.roomId);

            setInject(LeftArmy, this.clientState.army);
            setInject(RightArmy, this.enemyState.army);
        } else {
            this.connection.registerAsRightPlayer(this.roomService.roomId);

            setInject(LeftArmy, this.enemyState.army);
            setInject(RightArmy, this.clientState.army);
        }

        this.battleGame.setState(BattleState.battle);

        this.editorComponent = new EditorComponent();

        this.editorComponent.runCode$.subscribe(code => {
            if (side === BattleSide.left) {
                this.battleGame.runCode(code, '');
            } else {
                this.battleGame.runCode('', code);
            }
        });

        this.editorComponent.pushCode$.subscribe(() => {
            const newState = {
                left: {},
                right: {}
            } as IState;

            if (side === BattleSide.left) {
                newState.left.isReady = true;
            } else {
                newState.right.isReady = true;
            }

            this.connection.sendState(newState, this.roomService.roomId);
        });

        this.editorComponent.change$.subscribe(code => {
            const newState = {
                left: {editor: {}},
                right: {editor: {}}
            } as IState;

            if (side === BattleSide.left) {
                newState.left.editor.code = code;
            } else {
                newState.right.editor.code = code;
            }

            this.connection.sendState(newState, this.roomService.roomId);
        });

        this.editorComponent.editorScroll$.subscribe(pointer => {
            const newState = {
                left: {editor: {}},
                right: {editor: {}}
            } as IState;

            if (side === BattleSide.left) {
                newState.left.editor.scrollX = pointer.x;
                newState.left.editor.scrollY = pointer.y;
            } else {
                newState.right.editor.scrollX = pointer.x;
                newState.right.editor.scrollY = pointer.y;
            }

            this.connection.sendState(newState, this.roomService.roomId);
        });

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
                    switchMap(() => this.promptService.alert('Ошибка', 'Данная комната больше не существует'))
                )
                .subscribe(() => {
                    location.href = this.environment.config.baseUrl;
                });
        });

        const enemySide = side === BattleSide.left ? BattleSide.right : BattleSide.left;

        new ClientComponent(document.querySelector('#enemyClient'), enemySide);
        new ClientComponent(document.querySelector('#myClient'), side);

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

        combineLatest(this.leftIsReady$, this.rightIsReady$)
            .pipe(
                tap(() => this.battleGame.setState(BattleState.attention)),
                switchMap(() => this.promptService.goToMaster())
            )
            .subscribe(() => {
                const {roomId} = this.roomService;
                const {baseUrl} = this.environment.config;

                location.href = `${baseUrl}/master/#room=${roomId}`;
            });

        this.connection.onState$<IState>()
            .pipe(first())
            .subscribe(state => {
                render((<RoomTimer startTime={state.createTime} endTime={null} />), document.querySelector('.clients-display'));
            });


    }

}