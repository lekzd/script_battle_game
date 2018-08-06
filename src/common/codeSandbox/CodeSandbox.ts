import {BattleUnit} from "../battle/BattleUnit";
import {getUnitApi} from './getUnitApi';

export interface IAction {
    action: string;
    id?: string;
    x?: number;
    y?: number;
    text?: string;
}

const MAX_EVAL_TIMEOUT = 1000;
const BANNED_APIS = [
    'self', 'state', 'fetch', 'postMessage', 'nativePostMessage', 'addEventListener',
    'XMLHttpRequest', 'WebSocket', 'Worker', 'Error'
];

export class CodeSandbox {

    private scope: any = {};

    setGlobal(name: string, value: any) {
        this.scope[name] = value;
    }

    eval(code: string, unit: BattleUnit): Promise<IAction[]> {
        const worker = new Worker(this.getJSBlob(code));

        let resolved = false;

        return new Promise<IAction[]>((resolve, reject) => {
            worker.onmessage = (e) => {
                resolved = true;
                resolve(JSON.parse(e.data));
                worker.terminate();
            };

            setTimeout(() => {
                if (!resolved) {
                    reject(`Max evaluation timeout ${MAX_EVAL_TIMEOUT}ms exceeded`);
                    worker.terminate();
                }
            }, MAX_EVAL_TIMEOUT);

            worker.postMessage(unit.api); // Start the worker.
        });
    }

    private getWorkerCode(codeToInject: string): string {
        return `
            onmessage = (message) => {
                
                const actions = [];
                const unit = message.data;
                
                const unitApi = (${getUnitApi.toString()})(unit, actions);
                
                with (unitApi) {
                    (function(${BANNED_APIS.join(',')}) {
                        try {
                            ${codeToInject};
                        } catch (e) {
                            console.error(e);
                        }
                    }).call({hello: 'how are you?'})
                }
            
                postMessage(JSON.stringify(actions));
            }`;
    }

    private getJSBlob(jsCode: string): any {
        const blob = new Blob([this.getWorkerCode(jsCode)], { type: "text/javascript" });

        return URL.createObjectURL(blob);
    }

}