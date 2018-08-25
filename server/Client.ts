import {connection} from 'websocket';
import {IMessage} from '../src/common/WebsocketConnection';
import {IState} from '../src/common/state.model';
import {mergeDeep} from '../src/common/helpers/mergeDeep';

export abstract class Client {

    abstract connection: connection;

    private messagesToSend: IMessage[] = [];
    private clientState: Partial<IState> = {};

    setConnection(connection: connection) {
        this.connection = connection;

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

    protected send(data: IMessage) {
        if (!this.connection) {
            this.messagesToSend.push(data);

            return;
        }

        this.connection.send(JSON.stringify(data));
    }

}