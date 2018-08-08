import {Subject} from 'rxjs/index';

export interface IMessage {
    type: string;
    data: any;
}

export class WebsocketConnection {

    onMessage$ = new Subject<IMessage>();
    onClose$ = new Subject<IMessage>();

    private connection: WebSocket;
    private readyPromise: Promise<void>;

    constructor() {
        this.connection = new WebSocket('ws://localhost:1337');

        this.readyPromise = new Promise<void>((resolve, reject) => {
            this.connection.onopen = () => {
                resolve();
            };

            this.connection.onerror = (error) => {
                reject();
                this.onClose$.next();
            };
        });

        this.connection.onclose = () => {
            this.onClose$.next();
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
        this.readyPromise.then(() => {
            this.connection.send(message);
        });
    }

    registerAsMaster() {
        this.send(JSON.stringify({
            type: 'registerMaster'
        }));
    }

    registerAsLeftPlayer() {
        this.send(JSON.stringify({
            type: 'registerLeftPlayer'
        }));
    }

    registerAsRightPlayer() {
        this.send(JSON.stringify({
            type: 'registerRightPlayer'
        }));
    }

    sendLeftCode(code: string) {
        this.send(JSON.stringify({
            type: 'leftCode',
            code
        }));
    }

    sendRightCode(code: string) {
        this.send(JSON.stringify({
            type: 'rightCode',
            code
        }));
    }
}