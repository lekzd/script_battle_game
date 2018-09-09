import {IMessage, WebsocketConnection} from '../common/WebsocketConnection';
import {Inject, setInject} from '../common/InjectDectorator';
import {BattleState} from '../common/battle/BattleState.model';
import {combineLatest} from "rxjs/internal/observable/combineLatest";
import {CodeDisplay} from './CodeDisplay';
import {LeftArmy} from "../left/LeftArmy";
import {EMPTY_ARMY} from "../common/client/EMPTY_ARMY";
import {RightArmy} from "../right/RightArmy";
import {Observable, fromEvent, timer} from 'rxjs/index';
import {IPlayerState, IState} from '../common/state.model';
import {catchError, filter, first, map, pluck, switchMap, tap, timeInterval, timeout} from 'rxjs/internal/operators';
import {BattleSide} from '../common/battle/BattleSide';
import {ClientComponent} from '../common/client/ClientComponent';
import {RoomService} from "../common/RoomService";
import {BattleGame} from '../common/battle/BattleGame';
import {ApiService} from '../common/ApiService';
import {PromptService} from '../leaders/PromptService';
import {Environment} from '../common/Environment';

export class MasterApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(ApiService) private apiService: ApiService;
    @Inject(Environment) private environment: Environment;
    @Inject(RoomService) private roomService: RoomService;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private leftCode: CodeDisplay;
    private rightCode: CodeDisplay;

    get container(): HTMLElement {
        return document.querySelector('.master');
    }

    get newSessionClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container.querySelector('#newSession'), 'click')
    }

    constructor() {
        this.battleGame.init();
        this.connection.registerAsMaster(this.roomService.roomId);

        new ClientComponent(this.container.querySelector('#leftClient'), BattleSide.left);
        new ClientComponent(this.container.querySelector('#rightClient'), BattleSide.right);

        setInject(LeftArmy, Object.assign({}, EMPTY_ARMY));
        setInject(RightArmy, Object.assign({}, EMPTY_ARMY));

        this.leftCode = new CodeDisplay(document.querySelector('.leftCode'), BattleSide.left);
        this.rightCode = new CodeDisplay(document.querySelector('.rightCode'), BattleSide.right);

        this.connection.onMessage$.subscribe(message => {
            this.onMessage(message)
        });

        this.connection.onClose$.subscribe(() => {
            this.setState(BattleState.connectionClosed);

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

        this.connection.onMessage$
            .pipe(
                pluck<any, IState>('data'),
                filter(state => state.mode === BattleState.ready || state.mode === BattleState.results),
                first(),
                switchMap(state =>
                    timer(2000).pipe(map(() => state))
                ),
                tap(state => {
                    setInject(LeftArmy, state.left.army);
                    setInject(RightArmy, state.right.army);

                    this.setState(BattleState.battle);
                }),
                switchMap(state =>
                    timer(1000).pipe(map(() => state))
                ),
            )
            .subscribe(state => {
                this.battleGame.runCode(state.left.editor.code, state.right.editor.code);
            });

        this.newSessionClick$.subscribe(() => {
            this.connection.sendNewSession(this.roomService.roomId);
        });

        this.connection.onState$('right')
            .subscribe((state: IPlayerState) => {
                this.rightCode.setState(state);
            });

        this.connection.onState$('left')
            .subscribe((state: IPlayerState) => {
                this.leftCode.setState(state);
            });

        // setTimeout(() => {
        //     this.setState(BattleState.battle);
        // }, 2000);
        //
        // setTimeout(() => {
        //     const mock: ISessionResult = {
        //         winner: WinnerSide.right,
        //         damage: {
        //             left: 250,
        //             right: 500
        //         }
        //     };
        //
        //     this.battleGame.showResults(mock);
        // }, 3000)

    }

    private setState(state: BattleState, stateParams?: any) {
        this.container.className = `master ${state}`;

        this.battleGame.setState(state, stateParams);
    }

    private onMessage(message: IMessage) {
        if (message.type === 'state') {
            this.setState(message.data);
        }

        if (message.type === 'newSession') {
            location.reload();
        }
    }

}