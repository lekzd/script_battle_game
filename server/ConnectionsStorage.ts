import {Master} from "./Master";
import {Player} from "./Player";
import {IPlayerState, IState} from '../src/common/state.model';
import {mergeDeep} from '../src/common/helpers/mergeDeep';
import {Client} from './Client';
import {connection} from 'websocket';
import {IMessage} from '../src/common/WebsocketConnection';

type Partial<T> = {
    [P in keyof T]?: T[P];
}

export class ConnectionsStorage {

    connections = new Map<connection, string>();
    master = new Master();
    leftPlayer = new Player();
    rightPlayer = new Player();

    state: Partial<IState> = {};

    isRegistered(connection: connection): boolean {
        return this.connections.has(connection);
    }

    registerConnection(data: IMessage, connection: connection): boolean {
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

    tryRegisterEntity(connection: connection, name: string): boolean {
        const client = this.getClient(name);

        if (client.canConnect(connection)) {
            if (name === 'leftPlayer') {
                this.setState({left: <IPlayerState>{isConnected: true}});
            }
            if (name === 'rightPlayer') {
                this.setState({right: <IPlayerState>{isConnected: true}});
            }

            client.setConnection(connection);

            this.connections.set(connection, name);

            console.log(`${name} registered`);

            return true;
        }

        return false;
    }

    onConnectionLost(connection: connection) {
        if (this.isRegistered(connection)) {
            const name = this.connections.get(connection);
            const client = this.getClient(name);

            client.disconnect(connection);
            this.connections.delete(connection);

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

    private getClient(name: string): Client {
        return this[name] as Client;
    }

}