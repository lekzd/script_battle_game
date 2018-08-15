
export class Master {
    constructor(connection, side) {
        this.connection = connection;
        this.side = side;

        this._messagesToSend = [];

        this._send({
            type: 'state',
            data: 'wait'
        })
    }

    setConnection(connection) {
        this.connection = connection;

        this._messagesToSend.forEach(message => {
            this._send(message);
        });

        this._messagesToSend = [];
    }

    dispatchLeftCode(code) {
        this._send({
            type: 'leftCode',
            data: {code}
        })
    }

    dispatchRightCode(code) {
        this._send({
            type: 'rightCode',
            data: {code}
        })
    }

    dispatchLeftState(state) {
        this._send({
            type: 'leftState',
            data: {state}
        })
    }

    dispatchRightState(state) {
        this._send({
            type: 'rightState',
            data: {state}
        })
    }

    pushLeftCode(code) {
        this._send({
            type: 'pushLeftCode',
            data: {code}
        })
    }

    pushRightCode(code) {
        this._send({
            type: 'pushRightCode',
            data: {code}
        })
    }

    dispatchSessionResult(sessionResult) {
        this._send({
            type: 'endSession',
            data: {sessionResult}
        })
    }

    dispatchNewSession() {
        this._messagesToSend = [];

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