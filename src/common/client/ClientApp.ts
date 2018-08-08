import {WebsocketConnection} from '../WebsocketConnection';
import {Inject} from '../InjectDectorator';
import {BattleGame, BattleState} from '../battle/BattleGame';
import {EditorComponent} from '../editor/EditorComponent';
import {BattleSide} from '../battle/BattleSide';
import {emptyScheduled} from 'rxjs/internal/observable/empty';

export class ClientApp {

    @Inject(BattleGame) private battleGame: BattleGame;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private editorComponent: EditorComponent;

    constructor(private side: BattleSide) {

        if (side === BattleSide.left) {
            this.connection.registerAsLeftPlayer();
        } else {
            this.connection.registerAsRightPlayer();
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

        this.editorComponent.change$.subscribe(code => {
            if (side === BattleSide.left) {
                this.connection.sendLeftCode(code);
            } else {
                this.connection.sendRightCode(code);
            }
        });

        this.connection.onMessage$.subscribe(message => {
            if (message.type === 'state') {
                this.battleGame.setState(message.data);
            }
        });

        this.connection.onClose$.subscribe(() => {
            this.battleGame.setState(BattleState.connectionClosed);
        });

    }

}