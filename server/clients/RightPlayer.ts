import {Client} from './Client';
import {Observable} from "rxjs";
import {IMessage} from "../../src/common/WebsocketConnection";
import {map, pluck} from "rxjs/operators";

export class RightPlayer extends Client {

    code = '';
    state = {};

    get onMessage$(): Observable<IMessage> {
        return this.onUnsafeMessage$('state')
            .pipe(
                pluck('state', 'right'),
                map(right => (<any>{state: {right}, type: 'state'}))
            )
    }

    constructor() {
        super();

        this.send({
            type: 'state',
            data: 'battle'
        });
    }

    dispatchSessionResult(sessionResult) {
        this.send({
            type: 'endSession',
            data: {sessionResult}
        });
    }
}