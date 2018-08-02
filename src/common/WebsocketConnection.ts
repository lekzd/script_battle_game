import {Subject} from 'rxjs/index';

export interface IMessage {
    type: string;
    data: any;
}

export class WebsocketConnection {

    onMessage$ = new Subject<IMessage>();

    private connection: WebSocket;

    constructor() {
        this.connection = new WebSocket('ws://localhost:1337');

        this.connection.onopen = () => {
            // connection is opened and ready to use
        };

        this.connection.onerror = (error) => {
            // an error occurred when sending/receiving data
        };

        this.connection.onmessage = (message) => {
            // try to decode json (I assume that each message
            // from server is json)
            try {
                this.onMessage$.next(JSON.parse(message.data));
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ',
                    message.data);
                return;
            }
            // handle incoming message
        };
    }

    send(message: string) {
        this.connection.send(message);
    }
}