import {BattleUnit} from "../battle/BattleUnit";

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
                
                class UnitApi {
                    goTo(x, y) {
                        actions.push({action: 'goTo', x: x, y: y});
                    }
            
                    goToEnemyAndHit() {
                        actions.push({action: 'goToEnemyAndHit'});
                    }
            
                    shoot(id) {
                        actions.push({action: 'shoot', id: id});
                    }
            
                    spell(id) {
                        actions.push({action: 'spell', id: id});
                    }
            
                    say(text) {
                        actions.push({action: 'say', text: text});
                    }
            
                    isShooter() {
                        return unit.character.type === CharacterType.shooting;
                    }
            
                    isMagician() {
                        return unit.character.type === CharacterType.magic;
                    }
            
                    isAlive() {
                        return unit.health > 0;
                    }
            
                    getHealth() {
                        return unit.health;
                    }
            
                    getID() {
                        return unit.id;
                    }
                }
                
                const unitApi = new UnitApi();
                
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