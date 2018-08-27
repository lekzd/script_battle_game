import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";

export enum MessageSource {
    VM = 'vm',
    Runtime = 'runtime',
    Unexpected = 'unexpected',
    Service = 'service'
}

export interface IConsoleLine {
    source: MessageSource;
    text: string;
}

export class ConsoleService extends BehaviorSubject<IConsoleLine> {

    constructor() {
        super({
            source: MessageSource.Service,
            text: 'hello!'
        })
    }

    vmLog(...attributes) {
        this.next({
            source: MessageSource.VM,
            text: attributes.join()
        })
    }

    runtimeLog(...attributes) {
        this.next({
            source: MessageSource.Runtime,
            text: attributes.join()
        })
    }
}