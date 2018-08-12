
export class Master {
    constructor(connection, side) {
        this.connection = connection;
        this.side = side;

        this.connection.send(JSON.stringify({
            type: 'state',
            data: 'wait'
        }))
    }

    dispatchLeftCode(code) {
        this.connection.send(JSON.stringify({
            type: 'leftCode',
            data: {code}
        }))
    }

    dispatchRightCode(code) {
        this.connection.send(JSON.stringify({
            type: 'rightCode',
            data: {code}
        }))
    }

    dispatchLeftState(state) {
        this.connection.send(JSON.stringify({
            type: 'leftState',
            data: {state}
        }))
    }

    dispatchRightState(state) {
        this.connection.send(JSON.stringify({
            type: 'rightState',
            data: {state}
        }))
    }

    pushLeftCode(code) {
        this.connection.send(JSON.stringify({
            type: 'pushLeftCode',
            data: {code}
        }))
    }

    pushRightCode(code) {
        this.connection.send(JSON.stringify({
            type: 'pushRightCode',
            data: {code}
        }))
    }

    dispatchSessionResult(sessionResult) {
        this.connection.send(JSON.stringify({
            type: 'endSession',
            data: {sessionResult}
        }))
    }
}