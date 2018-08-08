
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
}