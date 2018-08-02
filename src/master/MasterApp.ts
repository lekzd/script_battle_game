import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {BattleGame, BattleState} from '../common/battle/BattleGame';

export class MasterApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {
        console.log('connection', this.connection);

        this.battleGame.setState(BattleState.battle);

        this.connection.onMessage$.subscribe(message => {
            console.log('connection.onMessage$', message);
        })

    }

}