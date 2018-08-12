
export class Player {
    constructor(connection, side) {
        this.connection = connection;
        this.side = side;
        this.code = '';

        this.connection.send(JSON.stringify({
            type: 'state',
            data: 'battle'
        }))
    }

    setCode(code) {
        this.code = code;
    }

    setEnemyState(state) {
        this.connection.send(JSON.stringify({
            type: 'enemyState',
            data: {state}
        }))
    }
}