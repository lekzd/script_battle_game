import {ConnectionsStorage} from "./ConnectionsStorage";
import {IState} from "../src/common/state.model";
import {IClientRegisterMessage} from "./SocketMiddleware";
import {connection} from "websocket";

export class Room {

    private connectionsStorage = new ConnectionsStorage();

    get watchersCount(): number {
        let result = 0;

        this.connectionsStorage.connections.forEach(name => {
            if (name === 'master') {
                result++;
            }
        });

        return result;
    }

    get state(): Partial<IState> {
        return this.connectionsStorage.state;
    }

    constructor() {

    }

    onConnectionLost(connection: connection) {
        this.connectionsStorage.onConnectionLost(connection);
    }

    tryRegisterConnection(data: IClientRegisterMessage, connection: connection) {
        if (!this.connectionsStorage.isRegistered(connection)) {
            this.connectionsStorage.registerConnection(data, connection);

            if (!this.connectionsStorage.isRegistered(connection)) {
                connection.close();

                return;
            }

            return;
        }
    }
}