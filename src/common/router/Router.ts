import {AbstractView} from './AbstractView';

interface IRouterConfig {
    [name: string]: typeof AbstractView;
}

export class Router {
    activeView: AbstractView;

    private routes: IRouterConfig;

    setConfig(routerConfig: IRouterConfig) {
        this.routes = Object.assign({}, routerConfig);
    }

    navigate(stateName: string) {
        this.activeView.end();

        this.activeView = new (this.routes[stateName] as any)();

        this.activeView.start();
    }
}