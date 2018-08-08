import {Master} from "./Master";
import {Player} from "./Player";

const typesMap = {
    'master': Master,
    'leftPlayer': Player,
    'rightPlayer': Player,
};

export class ConnectionsStorage {

    constructor() {
        this.connections = new Map();

        this.master = null;
        this.leftPlayer = null;
        this.rightPlayer = null;
    }

    isRegistered(connection) {
        return this.connections.has(connection);
    }

    registerConnection(data, connection) {
        switch (data.type) {
            case 'registerMaster':
                return this.tryRegisterEntity(connection, 'master');
            case 'registerLeftPlayer':
                return this.tryRegisterEntity(connection, 'leftPlayer');
            case 'registerRightPlayer':
                return this.tryRegisterEntity(connection, 'rightPlayer');
        }

        return false;
    }

    tryRegisterEntity(connection, name) {
        if (this[name] === null) {
            const Constructor = typesMap[name];

            this[name] = new Constructor(connection, name);

            this.connections.set(connection, name);

            console.log(`${name} registered`);

            return true;
        }

        if (this[name] !== null) {
            console.warn(`${name} already registered!`);
        }

        return false;
    }

    onConnectionLost(connection) {
        if (this.isRegistered(connection)) {
            const role = this.connections.get(connection);

            this.connections.delete(connection);

            this[role] = null;

            console.log(`connection with ${role} lost`);
        }
    }

    setLeftCode(code) {
        this.leftPlayer.setCode(code);
        this.master.dispatchLeftCode(code);
    }

    setRightCode(code) {
        this.rightPlayer.setCode(code);
        this.master.dispatchRightCode(code);
    }

}