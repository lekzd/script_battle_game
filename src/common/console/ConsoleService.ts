import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";

export enum MessageType {
    VM = 'vm',
    Runtime = 'runtime',
    Unexpected = 'unexpected',
    Service = 'service',
    Log = 'log',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
    Success = 'success'
}

export interface IConsoleLine {
    source: MessageType;
    text: string;
}

export class ConsoleService extends BehaviorSubject<IConsoleLine> {

    constructor() {
        super({
            source: MessageType.Service,
            text: 'hello!'
        })
    }

    vmLog(...attributes) {
        this.next({
            source: MessageType.VM,
            text: attributes.join()
        })
    }

    runtimeLog(...attributes) {
        this.next({
            source: MessageType.Runtime,
            text: attributes.join()
        })
    }
}