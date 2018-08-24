import {Client} from './Client';

export class Player extends Client {

    code = '';
    state = {};

    _messagesToSend = [];

    constructor(public connection) {
        super();

        this.send({
            type: 'state',
            data: 'battle'
        });
    }

    setConnection(connection) {
        this.connection = connection;

        this._messagesToSend.forEach(message => {
            this.send(message);
        });

        this._messagesToSend = [];
    }

    setCode(code) {
        this.code = code;
    }

    setEnemyState(state) {
        this.send({
            type: 'enemyState',
            data: {state}
        });
    }

    dispatchSessionResult(sessionResult) {
        this.send({
            type: 'endSession',
            data: {sessionResult}
        });
    }
}