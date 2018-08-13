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

export class CodeSandbox {

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
                
                const sandboxProxy = new Proxy(Object.assign(unitApi, {console}), {has, get});
                
                with (sandboxProxy) {
                    (function() {
                        try {
                            ${codeToInject};
                        } catch (e) {
                            console.error(e);
                        }
                    }).call({hello: 'how are you?'})
                }
                
                function has (target, key) {
                    return true;
                }
                
                function get (target, key) {
                    if (key === Symbol.unscopables) return undefined;
                    return target[key];
                }
            
                postMessage(JSON.stringify(actions));
            }`;
    }

    private getJSBlob(jsCode: string): any {
        const blob = new Blob([this.getWorkerCode(jsCode)], { type: "text/javascript" });

        return URL.createObjectURL(blob);
    }

}