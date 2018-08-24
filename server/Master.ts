import {Client} from './Client';

export class Master extends Client {

    constructor(public connection) {
        super();

        this.send({
            type: 'state',
            data: 'wait'
        });
    }

    dispatchLeftCode(code) {
        this.send({
            type: 'leftCode',
            data: {code}
        })
    }

    dispatchRightCode(code) {
        this.send({
            type: 'rightCode',
            data: {code}
        })
    }

    dispatchLeftState(state) {
        this.send({
            type: 'leftState',
            data: {state}
        })
    }

    dispatchRightState(state) {
        this.send({
            type: 'rightState',
            data: {state}
        })
    }

    pushLeftCode(code) {
        this.send({
            type: 'pushLeftCode',
            data: {code}
        })
    }

    pushRightCode(code) {
        this.send({
            type: 'pushRightCode',
            data: {code}
        })
    }

    dispatchSessionResult(sessionResult) {
        this.send({
            type: 'endSession',
            data: {sessionResult}
        })
    }
}