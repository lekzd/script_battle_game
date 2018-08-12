import {BattleSide} from "../battle/BattleSide";
import {Subject} from 'rxjs/index';
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';
import {EMPTY_ARMY} from "./EMPTY_ARMY";

export class ClientState {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    name = '';
    side: BattleSide;

    army = Object.assign({}, EMPTY_ARMY);

    change$ = new Subject<any>();

    set(newState: any) {
        Object.assign(this, {}, newState);

        this.change$.next(newState);

        if (this.side === BattleSide.left) {
            this.connection.sendLeftState(newState);
        }

        if (this.side === BattleSide.right) {
            this.connection.sendRightState(newState);
        }
    }
}