import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {BattleGame, BattleState} from '../common/battle/BattleGame';
import {EditorComponent} from '../common/editor/EditorComponent';

export class ClientApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(EditorComponent) private editorComponent: EditorComponent;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {

        console.log('connection', this.connection);

        this.battleGame.setState(BattleState.battle);

        this.editorComponent.runCode$.subscribe(code => {
            this.battleGame.runCode(code);
        })

    }

}