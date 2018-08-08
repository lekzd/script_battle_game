import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {BattleGame, BattleState} from '../common/battle/BattleGame';

export class MasterApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

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
        });

        this.connection.onClose$.subscribe(() => {
            this.battleGame.setState(BattleState.connectionClosed);
        });

    }

}