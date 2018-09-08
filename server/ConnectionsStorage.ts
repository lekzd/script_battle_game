import {Master} from "./clients/Master";
import {Player} from "./clients/Player";
import {IPlayerState, IState} from '../src/common/state.model';
import {mergeDeep} from '../src/common/helpers/mergeDeep';
import {Client} from './clients/Client';
import {IClientRegisterMessage} from "./SocketMiddleware";
import * as ws from 'ws';
import {Guest} from './clients/Guest';
import {BattleState} from '../src/common/battle/BattleState.model';

type Partial<T> = {
    [P in keyof T]?: T[P];
}

export class ConnectionsStorage {
    connections = new Map<ws, string>();
    guest = new Guest();
    master = new Master();
    leftPlayer = new Player();
    rightPlayer = new Player();

    state: Partial<IState> = {
        mode: BattleState.wait
    };

    isRegistered(connection: ws): boolean {
        return this.connections.has(connection);
    }

    registerConnection(data: IClientRegisterMessage, connection: ws): boolean {
        switch (data.type) {
            case 'registerGuest':
                return this.tryRegisterEntity(connection, 'guest');
            case 'registerMaster':
                return this.tryRegisterEntity(connection, 'master');
            case 'registerLeftPlayer':
                return this.tryRegisterEntity(connection, 'leftPlayer');
            case 'registerRightPlayer':
                return this.tryRegisterEntity(connection, 'rightPlayer');
        }

        return false;
    }

    tryRegisterEntity(connection: ws, name: string): boolean {
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

    onConnectionLost(connection: ws) {
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

    close() {
        this.connections.forEach((name, connection) => {
            if (connection.readyState === ws.OPEN) {
                connection.close();
            }
        });
    }

    private getClient(name: string): Client {
        return this[name] as Client;
    }

}