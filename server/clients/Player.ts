import {Client} from './Client';

export class Player extends Client {

    code = '';
    state = {};

    constructor() {
        super();

        this.send({
            type: 'state',
            data: 'battle'
        });
    }

    dispatchSessionResult(sessionResult) {
        this.send({
            type: 'endSession',
            data: {sessionResult}
        });
    }
}