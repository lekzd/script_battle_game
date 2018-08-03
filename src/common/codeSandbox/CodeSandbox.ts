
export interface IAction {
    type: string;
    [key: string]: string;
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

    eval(code: string): Promise<IAction[]> {
        const worker = new Worker(this.getJSBlob(code));

        let resolved = false;

        return new Promise<IAction[]>((resolve, reject) => {
            worker.onmessage = (e) => {
                const actions = <IAction[]>JSON.parse(e.data);

                resolved = true;
                resolve(actions);
                worker.terminate();
            };

            setTimeout(() => {
                if (!resolved) {
                    reject(`Max evaluation timeout ${MAX_EVAL_TIMEOUT}ms exceeded`);
                    worker.terminate();
                }
            }, MAX_EVAL_TIMEOUT);

            worker.postMessage("hello"); // Start the worker.
        });
    }

    private getWorkerCode(codeToInject: string): string {
        return `
            onmessage = () => {
                const state = [];
                
                function goTo(x, y) {
                    state.push({action: 'goTo', x: x, y: y});
                }
                
                function goToEnemyAndHit() {
                    state.push({action: 'goToEnemyAndHit'});
                }
                
                function shoot(id) {
                    state.push({action: 'shoot', id: id});
                }
                
                function spell(id) {
                    state.push({action: 'spell', id: id});
                }
                
                function say(text) {
                    state.push({action: 'say', text: text});
                }
                
                function isShooter() {
                    return true;
                }
                
                function isMagician() {
                    return true;
                }
                
                function isAlive() {
                    return true;
                }
                
                function getHealth() {
                    return 100;
                }
                
                function getID() {
                    return '1';
                }
                
                const nativePostMessage = this.postMessage;
                
                Object.keys(this).forEach(key => {
                    delete this[key];
                });
                
                (function(${BANNED_APIS.join(',')}) {
                    try {
                        ${codeToInject};
                    } catch (e) {}
                }).call({hello: 'how are you?'})
            
                nativePostMessage(JSON.stringify(state))
            }`;
    }

    private getJSBlob(jsCode: string): any {
        const blob = new Blob([this.getWorkerCode(jsCode)], { type: "text/javascript" });

        return URL.createObjectURL(blob);
    }

}