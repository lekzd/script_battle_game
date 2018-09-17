import {BattleSide} from "../battle/BattleSide";
import {Subject} from 'rxjs';
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';
import {EMPTY_ARMY} from "./EMPTY_ARMY";
import {IEditorState, IPlayerState} from '../state.model';

export class ClientState implements IPlayerState{

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    createTime: number;
    roomId: string;
    roomTitle: string;

    editor: IEditorState;

    name = '';
    side: BattleSide;
    isReady = false;
    isConnected = true;

    army = Object.assign({}, EMPTY_ARMY);

    change$ = new Subject<any>();

    setFromServer(newState: Partial<IPlayerState>) {
        Object.assign(this, {}, newState);
    }

    set(newState: Partial<IPlayerState>) {
        Object.assign(this, {}, newState);

        this.change$.next(newState);
    }

    clear() {
        this.army = Object.assign({}, EMPTY_ARMY);
    }
}