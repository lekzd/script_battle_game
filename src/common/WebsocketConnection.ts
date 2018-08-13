import {Subject} from 'rxjs/index';
import {ISessionResult} from "./battle/BattleSession";
import {Inject} from './InjectDectorator';
import {Environment} from './Environment';

export interface IMessage {
    type: string;
    data: any;
}

export class WebsocketConnection {

    @Inject(Environment) private environment: Environment;

    onMessage$ = new Subject<IMessage>();
    onClose$ = new Subject<IMessage>();
    isMaster = false;

    private connection: WebSocket;
    private readyPromise: Promise<void>;

    constructor() {
        this.connection = new WebSocket(this.environment.config.websocket);

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

        this.isMaster = true;
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

    sendLeftState(state: any) {
        this.send(JSON.stringify({
            type: 'leftState',
            state
        }));
    }

    sendRightState(state: any) {
        this.send(JSON.stringify({
            type: 'rightState',
            state
        }));
    }

    pushLeftCode(code: any) {
        this.send(JSON.stringify({
            type: 'pushLeftCode',
            code
        }));
    }

    pushRightCode(code: any) {
        this.send(JSON.stringify({
            type: 'pushRightCode',
            code
        }));
    }

    sendWinner(sessionResult: ISessionResult) {
        this.send(JSON.stringify({
            type: 'sendWinner',
            sessionResult
        }));
    }
}