import {WebsocketConnection} from '../WebsocketConnection';
import {Inject, setInject} from '../InjectDectorator';
import {BattleGame, BattleState} from '../battle/BattleGame';
import {EditorComponent} from '../editor/EditorComponent';
import {BattleSide} from '../battle/BattleSide';
import {ClientState} from "./ClientState";
import {LeftArmy} from "../../left/LeftArmy";
import {EnemyState} from "./EnemyState";
import {RightArmy} from "../../right/RightArmy";
import {ISessionResult} from "../battle/BattleSession";
import {IPlayerState, IState} from '../state.model';
import {distinctUntilChanged, filter} from 'rxjs/internal/operators';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {ClientComponent} from './ClientComponent';
import {Observable} from 'rxjs/index';
import "../console/BattleConsole";

export class ClientApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(EnemyState) private enemyState: EnemyState;
    @Inject(ClientState) private clientState: ClientState;
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

        this.clientState.side = side;

        if (side === BattleSide.left) {
            this.connection.registerAsLeftPlayer();

            setInject(LeftArmy, this.clientState.army);
            setInject(RightArmy, this.enemyState.army);
        } else {
            this.connection.registerAsRightPlayer();

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
            const newState = <IState>{
                left: {},
                right: {}
            };

            if (side === BattleSide.left) {
                newState.left.isReady = true;
            } else {
                newState.right.isReady = true;
            }

            this.connection.sendState(newState);
        });

        this.editorComponent.change$.subscribe(code => {
            const newState = <IState>{
                left: {editor: {}},
                right: {editor: {}}
            };

            if (side === BattleSide.left) {
                newState.left.editor.code = code;
            } else {
                newState.right.editor.code = code;
            }

            this.connection.sendState(newState);
        });

        this.editorComponent.editorScroll$.subscribe(pointer => {
            const newState = <IState>{
                left: {editor: {}},
                right: {editor: {}}
            };

            if (side === BattleSide.left) {
                newState.left.editor.scrollX = pointer.x;
                newState.left.editor.scrollY = pointer.y;
            } else {
                newState.right.editor.scrollX = pointer.x;
                newState.right.editor.scrollY = pointer.y;
            }

            this.connection.sendState(newState);
        });

        this.clientState.change$
            .pipe(
                distinctUntilChanged((prev, current) => JSON.stringify(prev) === JSON.stringify(current))
            )
            .subscribe(clientState=> {
                const newState = <IState>{
                    left: {},
                    right: {}
                };

                if (side === BattleSide.left) {
                    Object.assign(newState.left, clientState);
                } else {
                    Object.assign(newState.right, clientState);
                }

                this.connection.sendState(newState);
            });

        this.connection.onMessage$.subscribe(message => {
            if (message.type === 'state') {
                this.battleGame.setState(message.data);
            }

            if (message.type === 'endSession') {
                const sessionResult = <ISessionResult>message.data.sessionResult;

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
            .subscribe(() => {
                this.battleGame.setState(BattleState.attention);
            });

    }

}