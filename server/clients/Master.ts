import {Client} from './Client';
import {Observable} from "rxjs";
import {IMessage} from "../../src/common/WebsocketConnection";
import {first} from "rxjs/operators";
import {map, pluck} from 'rxjs/internal/operators';

export class Master extends Client {

    get onMessage$(): Observable<IMessage> {
        return this.onUnsafeMessage$('sendWinner')
            .pipe(
                pluck('sessionResult'),
                map(sessionResult => ({sessionResult, type: 'sendWinner'}))
            );
    }

    constructor() {
        super();

        this.maxConnections = Infinity;

        this.send({
            type: 'state',
            data: 'wait'
        });
    }

    dispatchSessionResult(sessionResult) {
        this.send({
            type: 'endSession',
            data: {sessionResult}
        })
    }
}