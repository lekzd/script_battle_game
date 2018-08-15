import {IMessage, WebsocketConnection} from '../common/WebsocketConnection';
import {Inject, setInject} from '../common/InjectDectorator';
import {BattleGame, BattleState} from '../common/battle/BattleGame';
import {Subject} from "rxjs/internal/Subject";
import {combineLatest} from "rxjs/internal/observable/combineLatest";
import {CodeDisplay} from './CodeDisplay';
import {LeftArmy} from "../left/LeftArmy";
import {EMPTY_ARMY} from "../common/client/EMPTY_ARMY";
import {RightArmy} from "../right/RightArmy";
import {Observable, fromEvent} from 'rxjs/index';

export class MasterApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private leftIsReady$ = new Subject();
    private rightIsReady$ = new Subject();

    private leftCode: CodeDisplay;
    private rightCode: CodeDisplay;

    get container(): HTMLElement {
        return document.querySelector('.master');
    }

    get newSessionClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container.querySelector('#newSession'), 'click')
    }

    constructor() {
        this.connection.registerAsMaster();

        setInject(LeftArmy, Object.assign({}, EMPTY_ARMY));
        setInject(RightArmy, Object.assign({}, EMPTY_ARMY));

        this.leftCode = new CodeDisplay(document.querySelector('.leftCode'));
        this.rightCode = new CodeDisplay(document.querySelector('.rightCode'));

        this.connection.onMessage$.subscribe(message => {
            this.onMessage(message)
        });

        this.connection.onClose$.subscribe(() => {
            this.battleGame.setState(BattleState.connectionClosed);
        });

        combineLatest(this.leftIsReady$.asObservable(), this.rightIsReady$.asObservable())
            .subscribe(() => {
                this.setState(BattleState.battle);
                this.battleGame.runCode(this.leftCode.value, this.rightCode.value);
            });

        this.newSessionClick$.subscribe(() => {
            this.connection.sendNewSession();
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

        if (message.type === 'leftCode') {
            this.leftCode.setCode(message.data.code);
        }

        if (message.type === 'rightCode') {
            this.rightCode.setCode(message.data.code);
        }

        if (message.type === 'runCode') {
            this.battleGame.runCode(message.data.leftCode, message.data.rightCode);
        }

        if (message.type === 'pushLeftCode') {
            this.leftCode.setCode(message.data.code);
            this.leftIsReady$.next();
        }

        if (message.type === 'pushRightCode') {
            this.rightCode.setCode(message.data.code);
            this.rightIsReady$.next();
        }

        if (message.type === 'leftState') {
            const {state} = message.data;

            this.leftCode.setState(state);
            setInject(LeftArmy, state.army);
        }

        if (message.type === 'rightState') {
            const {state} = message.data;

            this.rightCode.setState(state);
            setInject(RightArmy, state.army);
        }

        if (message.type === 'endSession') {
            this.battleGame.showResults(message.data.sessionResult);
        }

        if (message.type === 'newSession') {
            location.reload();
        }
    }

}