import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {BattleGame, BattleState} from '../common/battle/BattleGame';
import {Subject} from "rxjs/internal/Subject";
import {combineLatest} from "rxjs/internal/observable/combineLatest";
import {CodeDisplay} from './CodeDisplay';

export class MasterApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private leftIsReady = new Subject();
    private finalLeftCode = '';
    private rightIsReady = new Subject();
    private finalRightCode = '';

    private leftCode: CodeDisplay;
    private rightCode: CodeDisplay;

    get container(): HTMLElement {
        return document.querySelector('.master');
    }

    constructor() {
        this.connection.registerAsMaster();

        this.leftCode = new CodeDisplay(document.querySelector('.leftCode'));
        this.rightCode = new CodeDisplay(document.querySelector('.rightCode'));

        this.connection.onMessage$.subscribe(message => {
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
                this.finalLeftCode = message.data.code;

                this.leftCode.setCode(message.data.code);
                this.leftIsReady.next();
            }

            if (message.type === 'pushRightCode') {
                this.finalRightCode = message.data.code;

                this.rightCode.setCode(message.data.code);
                this.rightIsReady.next();
            }

            if (message.type === 'leftState') {
                this.leftCode.setState(message.data.state);
            }

            if (message.type === 'rightState') {
                this.rightCode.setState(message.data.state);
            }
        });

        this.connection.onClose$.subscribe(() => {
            this.battleGame.setState(BattleState.connectionClosed);
        });

        combineLatest(this.leftIsReady.asObservable(), this.rightIsReady.asObservable())
            .subscribe(() => {
                this.setState(BattleState.battle);
                this.battleGame.runCode(this.leftCode.value, this.rightCode.value);
            })

    }

    private setState(state: BattleState) {
        this.container.className = `master ${state}`;

        this.battleGame.setState(state);
    }

}