import {Client} from './Client';

export class Guest extends Client {

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