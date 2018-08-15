import {BattleSide} from "../battle/BattleSide";
import {Subject} from 'rxjs/index';
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';
import {EMPTY_ARMY} from "./EMPTY_ARMY";

export class EnemyState {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    name = '';
    side: BattleSide;

    army = Object.assign({}, EMPTY_ARMY);

    change$ = new Subject<any>();

    constructor() {
        this.connection.onMessage$.subscribe(message => {
            if (message.type === 'enemyState') {
                Object.assign(this, {}, message.data.state);

                this.change$.next(message.data.state);
            }
        });

    }

    clear() {
        this.army = Object.assign({}, EMPTY_ARMY);
    }
}