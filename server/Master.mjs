
export class Master {
    constructor(connection, side) {
        this.connection = connection;
        this.side = side;

        this.connection.send(JSON.stringify({
            type: 'state',
            data: 'battle'
        }))
    }
}