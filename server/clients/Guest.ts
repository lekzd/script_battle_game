import {Client} from './Client';
import {NEVER, Observable} from "rxjs";
import {IMessage} from "../../src/common/WebsocketConnection";

export class Guest extends Client {

    get onMessage$(): Observable<IMessage> {
        return NEVER;
    }

    constructor() {
        super();

        this.maxConnections = Infinity;
    }

    dispatchRoomsChanged() {
        this.send({
            type: 'roomsChanged',
            data: null
        })
    }
}