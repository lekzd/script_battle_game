import {Client} from './Client';

export class Master extends Client {

    constructor() {
        super();

        this.maxConnections = 2;

        this.send({
            type: 'state',
            data: 'wait'
        });
    }

    dispatchSessionResult(sessionResult) {
        this.send({
            type: 'endSession',
            data: {sessionResult}
        })
    }
}