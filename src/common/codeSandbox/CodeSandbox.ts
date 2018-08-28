import {BattleUnit} from "../battle/BattleUnit";
import {getUnitApi} from './getUnitApi';
import {ConsoleService, MessageType} from "../console/ConsoleService";
import {Inject} from "../InjectDectorator";
import {fromEvent} from "rxjs/internal/observable/fromEvent";
import {timer} from "rxjs/internal/observable/timer";
import {catchError, filter, map, switchMap, takeUntil} from "rxjs/operators";
import {merge} from "rxjs/internal/observable/merge";
import {throwError} from "rxjs/internal/observable/throwError";

export interface IAction {
    action: string;
    id?: any;
    x?: any;
    y?: any;
    text?: any;
}

interface IWorkerResponse {
    type: MessageType;
    data: any;
}

const MAX_EVAL_TIMEOUT = 1000;

export class CodeSandbox {

    @Inject(ConsoleService) private consoleService: ConsoleService;

    eval(code: string, unit: BattleUnit): Promise<IAction[]> {
        const worker = new Worker(this.getJSBlob(code));

        const message$ = fromEvent<MessageEvent>(worker, 'message')
            .pipe(map(e => <IWorkerResponse>JSON.parse(e.data)));

        const successMessage$ = message$
            .pipe(filter(({type}) => type === MessageType.Success));

        const timeoutClose$ = timer(MAX_EVAL_TIMEOUT).pipe(
            takeUntil(successMessage$),
            switchMap(() => throwError(`Скрипт исполнялся более 1 секунды и был остановлен!`))
        );

        return new Promise<IAction[]>((resolve, reject) => {

            message$
                .pipe(
                    takeUntil(successMessage$),
                    takeUntil(timeoutClose$)
                )
                .subscribe(message => {
                   this.consoleService.next({
                       source: message.type,
                       text: message.data.join()
                   })
                });

            merge(timeoutClose$, successMessage$)
                .pipe(
                    map(e => e.data),
                    catchError(message => {
                        this.consoleService.vmLog(message);
                        reject(message);
                        worker.terminate();

                        return [];
                    })
                )
                .subscribe(data => {
                    resolve(data);
                    worker.terminate();
                });

            worker.postMessage(unit.api); // Start the worker.
        });
    }

    private getWorkerCode(codeToInject: string): string {
        return `
            onmessage = (message) => {
                
                const actions = [];
                const unit = message.data;
                
                const unitApi = (${getUnitApi.toString()})(unit, actions);
                const apis = {console, Math, parseInt, parseFloat, Object, JSON};
                const nativePostMessage = this.postMessage;
                
                ['log', 'info', 'warn', 'error'].forEach(patchConsoleMethod);
                
                const sandboxProxy = new Proxy(Object.assign(unitApi, apis), {has, get});
                
                Object.keys(this).forEach(key => {
                    delete this[key];
                });
                
                this.Function = function() { return {'неплохо': 'неплохо =)'} };
                
                with (sandboxProxy) {
                    (function() {
                        try {
                            ${codeToInject};
                        } catch (e) {
                            console.error(e);
                        }
                    }).call({"слишком": 'просто'})
                }
                
                function has (target, key) {
                    return true;
                }
                
                function get (target, key) {
                    if (key === Symbol.unscopables) return undefined;
                    return target[key];
                }
                
                function patchConsoleMethod(name) {
                    const nativeMethod = console[name].bind(console);
                    
                    console[name] = (...attributes) => {
                        attributes = attributes.map(attr => {
                            if (attr instanceof Error) {
                                return attr.constructor.name + ': ' + attr.message;
                            }
                            
                            if (attr instanceof Object) {
                                return JSON.stringify(attr);
                            }
                            
                            return attr;
                        })
                    
                        nativePostMessage(JSON.stringify({type: name, data: attributes}));
                        
                        nativeMethod(...attributes);
                    }
                }
            
                nativePostMessage(JSON.stringify({type: 'success', data: actions}));
            }`;
    }

    private getJSBlob(jsCode: string): any {
        const blob = new Blob([this.getWorkerCode(jsCode)], { type: "text/javascript" });

        return URL.createObjectURL(blob);
    }

}