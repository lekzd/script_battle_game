import {Master} from "./Master";
import {Player} from "./Player";
import {IPlayerState, IState} from '../src/common/state.model';
import {mergeDeep} from '../src/common/helpers/mergeDeep';

type Partial<T> = {
    [P in keyof T]?: T[P];
}

export class ConnectionsStorage {

    connections = new Map();
    master = new Master(null);
    leftPlayer = new Player(null);
    rightPlayer = new Player(null);

    state: Partial<IState> = {};

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
        if (this[name].connection === null) {
            if (name === 'leftPlayer') {
                this.setState({left: <IPlayerState>{isConnected: true}});
            }
            if (name === 'rightPlayer') {
                this.setState({right: <IPlayerState>{isConnected: true}});
            }

            this[name].setConnection(connection);

            this.connections.set(connection, name);

            console.log(`${name} registered`);

            return true;
        }

        if (this[name].connection !== null) {
            console.warn(`${name} already registered!`);
        }

        return false;
    }

    onConnectionLost(connection) {
        if (this.isRegistered(connection)) {
            const name = this.connections.get(connection);

            this.connections.delete(connection);

            this[name].connection = null;

            if (name === 'leftPlayer') {
                this.setState({left: <IPlayerState>{isConnected: false}});
            }
            if (name === 'rightPlayer') {
                this.setState({right: <IPlayerState>{isConnected: false}});
            }

            console.log(`connection with ${name} lost`);
        }
    }

    endSession(sessionResult) {
        this.master.dispatchSessionResult(sessionResult);
        this.leftPlayer.dispatchSessionResult(sessionResult);
        this.rightPlayer.dispatchSessionResult(sessionResult);
    }

    newSession() {
        this.state = {};

        this.master.dispatchNewSession();
        this.leftPlayer.dispatchNewSession();
        this.rightPlayer.dispatchNewSession();
    }

    setState(newState: Partial<IState>) {
        this.state = mergeDeep(this.state, newState);

        this.master.setState(this.state);
        this.leftPlayer.setState(this.state);
        this.rightPlayer.setState(this.state);
    }

}