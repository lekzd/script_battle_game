import {Room} from "../Room";
import {IState} from "../../src/common/state.model";

export class RoomModel {
    title: string;
    state: Partial<IState>;
    watchersCount: number;

    constructor(room: Room) {
        this.title = room.title;
        this.state = room.state;
        this.watchersCount = room.watchersCount;
    }
}