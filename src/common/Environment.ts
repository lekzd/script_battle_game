const PROD_URL = 'http://142.93.129.144';
const PROD_WS_URL = 'ws://142.93.129.144';

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
    api: `${PROD_URL}/api`,
    websocket: PROD_WS_URL,
    staticHost: PROD_URL,
    baseUrl: PROD_URL
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