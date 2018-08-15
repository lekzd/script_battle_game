
export class Player {
    constructor(connection, side) {
        this.connection = connection;
        this.side = side;
        this.code = '';
        this.state = {};

        this._messagesToSend = [];

        this._send({
            type: 'state',
            data: 'battle'
        });
    }

    setConnection(connection) {
        this.connection = connection;

        this._messagesToSend.forEach(message => {
            this._send(message);
        });

        this._messagesToSend = [];
    }

    setCode(code) {
        this.code = code;
    }

    setEnemyState(state) {
        this._send({
            type: 'enemyState',
            data: {state}
        });
    }

    dispatchSessionResult(sessionResult) {
        this._send({
            type: 'endSession',
            data: {sessionResult}
        });
    }

    dispatchNewSession() {
        this._messagesToSend = [];
        this.state = {};
        this.code = '';

        this._send({
            type: 'newSession'
        });
    }

    _send(data) {
        if (!this.connection) {
            this._messagesToSend.push(data);

            return;
        }

        this.connection.send(JSON.stringify(data));
    }
}