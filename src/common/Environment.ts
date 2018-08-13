
interface IEnvConfig {
    websocket: string;
    staticHost: string;
}

const localConfig = {
    websocket: 'ws://localhost:1337',
    staticHost: 'http://localhost:8080'
};

const prodConfig = {
    websocket: 'ws://142.93.129.144:1337',
    staticHost: 'http://142.93.129.144'
};

export class Environment {
    config: IEnvConfig;

    constructor() {
        if (location.hostname === 'localhost') {
            this.config = localConfig;
        } else {
            this.config = prodConfig;
        }
    }

}