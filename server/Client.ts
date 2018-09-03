import {connection} from 'websocket';
import {IMessage} from '../src/common/WebsocketConnection';
import {IState} from '../src/common/state.model';
import {mergeDeep} from '../src/common/helpers/mergeDeep';

export abstract class Client {

    protected maxConnections = 1;

    private connectionsPool = new Set<connection>();
    private messagesToSend: IMessage[] = [];
    private clientState: Partial<IState> = {};

    setConnection(connection: connection) {
        this.connectionsPool.add(connection);

        this.send({
            type: 'setState',
            data: this.clientState
        });

        this.messagesToSend.forEach(message => {
            this.send(message);
        });

        this.messagesToSend = [];
    }

    setState(newState: Partial<IState>) {
        this.clientState = mergeDeep(this.clientState, newState);

        if (this.isEmpty()) {
            return;
        }

        this.send({
            type: 'setState',
            data: this.clientState
        })
    }

    dispatchNewSession() {
        this.messagesToSend = [];
        this.clientState = {};

        this.send({
            type: 'newSession',
            data: null
        });
    }

    canConnect(connection: connection): boolean {
        return this.connectionsPool.size < this.maxConnections
            && !this.connectionsPool.has(connection);
    }

    disconnect(connection: connection) {
        this.connectionsPool.delete(connection);
    }

    protected send(data: IMessage) {
        if (this.isEmpty()) {
            this.messagesToSend.push(data);

            return;
        }

        this.connectionsPool.forEach(connection => {
            connection.send(JSON.stringify(data));
        });
    }

    protected isEmpty(): boolean {
        return this.connectionsPool.size === 0;
    }

}