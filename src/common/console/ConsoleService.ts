import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";

export enum MessageType {
    VM = 'vm',
    Runtime = 'runtime',
    Unexpected = 'unexpected',
    Service = '😸',
    Log = 'log',
    Info = '👍',
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
            text: 'Hi! It`s a console, you can see any useful of debug info here'
        })
    }

    vmLog(...attributes) {
        this.next({
            source: MessageType.VM,
            text: attributes.join()
        })
    }

    serviceLog(...attributes) {
        this.next({
            source: MessageType.Service,
            text: attributes.join()
        })
    }

    infoLog(...attributes) {
        this.next({
            source: MessageType.Info,
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