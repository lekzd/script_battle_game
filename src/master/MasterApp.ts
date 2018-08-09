import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {BattleGame, BattleState} from '../common/battle/BattleGame';
import {Subject} from "rxjs/internal/Subject";
import {combineLatest} from "rxjs/internal/observable/combineLatest";

export class MasterApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;


    private leftIsReady = new Subject();
    private rightIsReady = new Subject();

    private registered = false;

    constructor() {
        this.connection.registerAsMaster();

        this.battleGame.initCodeDisplay();

        // this.battleGame.setState(BattleState.wait);

        this.connection.onMessage$.subscribe(message => {
            if (message.type === 'state') {
                this.battleGame.setState(message.data);
            }

            if (message.type === 'leftCode') {
                this.battleGame.updateLeftCode(message.data.code);
            }

            if (message.type === 'rightCode') {
                this.battleGame.updateRightCode(message.data.code);
            }

            if (message.type === 'runCode') {
                this.battleGame.runCode(message.data.leftCode, message.data.rightCode);
            }

            if (message.type === 'pushLeftCode') {
                this.battleGame.updateLeftCode(message.data.code);
                this.leftIsReady.next();
            }

            if (message.type === 'pushRightCode') {
                this.battleGame.updateRightCode(message.data.code);
                this.rightIsReady.next();
            }
        });

        this.connection.onClose$.subscribe(() => {
            this.battleGame.setState(BattleState.connectionClosed);
        });

        combineLatest(this.leftIsReady.asObservable(), this.rightIsReady.asObservable())
            .subscribe(() => {
                console.log('both!');
            })

    }

}