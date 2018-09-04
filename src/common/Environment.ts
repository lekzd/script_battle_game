
interface IEnvConfig {
    api: string;
    websocket: string;
    staticHost: string;
    baseUrl: string;
}

const localConfig = {
    api: 'http://localhost:1337/api',
    websocket: 'ws://localhost:1337',
    staticHost: 'http://localhost:8080',
    baseUrl: 'http://localhost:8080/public'
};

const prodConfig = {
    api: 'http://142.93.129.144/api',
    websocket: 'ws://142.93.129.144',
    staticHost: 'http://142.93.129.144',
    baseUrl: 'http://142.93.129.144'
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