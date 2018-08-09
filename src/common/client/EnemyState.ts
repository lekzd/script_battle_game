import {BattleSide} from "../battle/BattleSide";
import {Subject} from 'rxjs/index';
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';

export class EnemyState {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    name = '';
    side: BattleSide;

    army = {
        0: 'character_null',
        1: 'character_null',
        2: 'character_null',
        3: 'character_null'
    };

    change$ = new Subject<any>();

    constructor() {
        this.connection.onMessage$.subscribe(message => {
            if (message.type === 'enemyState') {
                Object.assign(this, {}, message.data.state);

                this.change$.next(message.data.state);
            }
        });

    }
}