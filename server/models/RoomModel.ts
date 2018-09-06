import {Room} from "../Room";
import {IState} from "../../src/common/state.model";

export class RoomModel {
    state: Partial<IState>;
    watchersCount: number;

    constructor(room: Room) {
        this.state = room.state;
        this.watchersCount = room.watchersCount;
    }
}