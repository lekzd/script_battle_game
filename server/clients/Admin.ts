import {Client} from './Client';
import * as ws from 'ws';
import {NEVER, Observable} from "rxjs";
import {IMessage} from "../../src/common/WebsocketConnection";

export class Admin extends Client {

    get onMessage$(): Observable<IMessage> {
        return NEVER;
    }

    private adminToken = Math.random().toString(36).substr(2);

    constructor() {
        super();

        this.maxConnections = Infinity;
    }

    setConnection(connection: ws) {
        super.setConnection(connection);

        this.send({
            type: 'adminToken',
            data: this.adminToken
        })
    }

    checkToken(token: string): boolean {
        return this.adminToken === token;
    }

    dispatchRoomsChanged() {
        this.send({
            type: 'roomsChanged',
            data: null
        })
    }
}