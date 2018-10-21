import {IMessage} from '../../src/common/WebsocketConnection';
import {IState} from '../../src/common/state.model';
import {mergeDeep} from '../../src/common/helpers/mergeDeep';
import * as ws from 'ws';
import {fromEvent, Observable, Subject} from "rxjs";
import {catchError, filter, map} from "rxjs/operators";

export abstract class Client {

    registered$ = new Subject();

    abstract onMessage$: Observable<IMessage>;

    protected maxConnections = 1;

    private connectionsPool = new Set<ws>();
    private messagesToSend: IMessage[] = [];
    private clientState: Partial<IState> = {};
    private mainConnection: ws;
    private unsafeMessage$ = new Subject<IMessage>();

    setConnection(connection: ws) {
        this.connectionsPool.add(connection);

        if (this.connectionsPool.size === 1) {
            this.mainConnection = connection;
        }

        this.registered$.next();

        fromEvent<MessageEvent>(connection, 'message')
            .pipe(
                filter(message => message.type === 'message'),
                map(message => JSON.parse(message.data)),
                catchError(error => {
                    console.error(error);

                    return [];
                })
            )
            .subscribe(message => {
                this.unsafeMessage$.next(message);
            });

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

    canConnect(connection: ws): boolean {
        return this.connectionsPool.size < this.maxConnections
            && !this.connectionsPool.has(connection);
    }

    disconnect(connection: ws) {
        this.connectionsPool.delete(connection);

        if (this.isMain(connection) && this.connectionsPool.size > 0) {
            const [firstConnection] = [...this.connectionsPool.values()];

            this.mainConnection = firstConnection;
        }
    }

    isMain(connection: ws): boolean {
        return connection === this.mainConnection;
    }

    protected onUnsafeMessage$(type: string): Observable<IMessage> {
        return this.unsafeMessage$
            .pipe(filter(message => message.type === type))
    }

    protected send(data: IMessage) {
        if (this.isEmpty()) {
            this.messagesToSend.push(data);

            return;
        }

        this.connectionsPool.forEach(connection => {
            if (connection.readyState === ws.OPEN) {
                connection.send(JSON.stringify(data));
            }
        });
    }

    protected isEmpty(): boolean {
        return this.connectionsPool.size === 0;
    }

}