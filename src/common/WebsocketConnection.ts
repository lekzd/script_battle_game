import {Observable, Subject} from 'rxjs/index';
import {ISessionResult} from "./battle/BattleSession";
import {Inject} from './InjectDectorator';
import {Environment} from './Environment';
import {IState} from './state.model';
import {filter, pluck} from 'rxjs/internal/operators';

export interface IMessage {
    type: string;
    data: any;
}

export class WebsocketConnection {

    @Inject(Environment) private environment: Environment;

    onMessage$ = new Subject<IMessage>();
    onClose$ = new Subject<IMessage>();
    isMaster = false;

    get onRoomsChanged$() {
        return this.onMessage$
            .pipe(
                filter(message => message.type === 'roomsChanged')
            )
    }

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

    onState$<T>(...path: string[]): Observable<T> {
        return this.onMessage$
            .pipe(
                filter(message => message.type === 'setState'),
                pluck<IMessage, T>('data', ...path),
                filter(data => data !== null && data !== undefined)
            )
    }

    registerAsGuest() {
        this.send(JSON.stringify({
            type: 'registerGuest'
        }));
    }

    registerAsMaster(roomId: string) {
        this.send(JSON.stringify({
            type: 'registerMaster',
            roomId
        }));

        this.isMaster = true;
    }

    registerAsLeftPlayer(roomId: string) {
        this.send(JSON.stringify({
            type: 'registerLeftPlayer',
            roomId
        }));
    }

    registerAsRightPlayer(roomId: string) {
        this.send(JSON.stringify({
            type: 'registerRightPlayer',
            roomId
        }));
    }

    sendWinner(sessionResult: ISessionResult, roomId: string) {
        this.send(JSON.stringify({
            type: 'sendWinner',
            sessionResult,
            roomId
        }));
    }

    sendNewSession(roomId: string) {
        this.send(JSON.stringify({
            type: 'newSession',
            roomId
        }));
    }

    sendState(state: Partial<IState>, roomId: string) {
        this.send(JSON.stringify({
            type: 'state',
            state,
            roomId
        }));
    }

    private send(message: string) {
        this.readyPromise.then(() => {
            this.connection.send(message);
        });
    }
}