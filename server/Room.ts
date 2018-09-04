import {ConnectionsStorage} from "./ConnectionsStorage";
import {IState} from "../src/common/state.model";

export class Room {

    private connectionsStorage = new ConnectionsStorage();

    get state(): Partial<IState> {
        return this.connectionsStorage.state;
    }

    constructor() {

    }
}