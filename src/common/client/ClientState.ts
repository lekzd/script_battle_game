import {BattleSide} from "../battle/BattleSide";

export class ClientState {
    name = '';
    side: BattleSide;

    army: {
        0: '',
        1: '',
        2: '',
        3: ''
    }
}