import {Grid} from "../helpers/Grid";
import {BattleUnit, IAnimationName} from "./BattleUnit";
import {Inject} from "../InjectDectorator";
import {BattleFieldDrawer} from "./BattleFieldDrawer";
import {HexagonalGraph} from "../helpers/HexagonalGraph";
import {IAction} from "../codeSandbox/CodeSandbox";
import {Astar, IPathItem} from "../helpers/Astar";
import {AsyncSequence} from "../helpers/AsyncSequence";
import {Subject} from "rxjs/internal/Subject";
import {ClientState} from "../client/ClientState";
import {CharacterType} from "../characters/CharactersList";
import {BulletType} from "./BulletDrawer";

const FIELD_WIDTH = 12;
const FIELD_HEIGHT = 9;

export class BattleFieldModel {

    bullet$ = new Subject<[BattleUnit, BattleUnit, BulletType]>();

    @Inject(Astar) private astar: Astar;
    @Inject(ClientState) private clientState: ClientState;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private grid = new Grid<BattleUnit>(FIELD_WIDTH);
    private graph = new HexagonalGraph(FIELD_WIDTH, FIELD_HEIGHT);

    get units(): BattleUnit[] {
        const result = [];

        this.grid.forEach(unit => {
            if (!!unit) {
                result.push(unit);
            }
        });

        return result;
    }

    constructor() {
        this.grid.getRawData().fill(null);
    }

    set(x: number, y: number, unit: BattleUnit) {
        const oldX = unit.x;
        const oldY = unit.y;

        if (oldX !== unit.x || oldY !== unit.y) {
            this.grid.set(oldX, oldY, null);
            this.graph.setWeight(oldX, oldY, 0);
        }

        this.grid.set(x, y, unit);
        this.graph.setWeight(x, y, 1);
    }

    get(x: number, y: number): BattleUnit {
        return this.grid.get(x, y);
    }

    forEach(callback: (unit: BattleUnit, x: number, y: number) => void) {
        this.grid.forEach(callback);
    }

    doAction(unit: BattleUnit, action: IAction): Promise<any> {
        console.log('doAction', action);

        if (action.action === 'goTo') {
            const path = this.getPath(unit.x, unit.y, action.x + unit.x, action.y + unit.y);

            path.length = Math.min(path.length, unit.character.speed);

            return this.animateUnitByPath(unit, path);
        }

        if (action.action === 'goToEnemyAndHit') {
            const enemy = this.getEnemy(action.id, unit);
            const path = this.getPath(unit.x, unit.y, enemy.x, enemy.y).slice(0, -1);
            const canHitEnemy = path.length <= unit.character.speed;

            path.length = Math.min(path.length, unit.character.speed);

            return this.animateUnitByPath(unit, path)
                .then(() => {
                    if (canHitEnemy) {
                        enemy.hitHealth(10, unit);
                    }
                })
        }

        if (action.action === 'say') {
            return unit.sayAction(action.text);
        }

        if (action.action === 'shoot') {
            const enemy = this.getEnemy(action.id, unit);

            return this.makeBulletAction(unit, enemy, 'shoot')
                .then(() => {
                    enemy.hitHealth(10, unit);
                });
        }

        if (action.action === 'spell') {
            const enemy = this.getEnemy(action.id, unit);

            return this.makeBulletAction(unit, enemy, 'spellcast')
                .then(() => {
                    enemy.hitHealth(10, unit);
                });
        }

        if (action.action === 'heal') {
            const enemy = this.getFriend(action.id, unit);

            return this.makeBulletAction(unit, enemy, 'spellcast');
        }


        if (action.action === 'attackRandom') {
            const enemy = this.getRandomEnemy(unit);

            if (unit.character.type === CharacterType.magic) {
                return this.makeBulletAction(unit, enemy, 'spellcast')
                    .then(() => {
                        enemy.hitHealth(10, unit);
                    });
            }

            if (unit.character.type === CharacterType.shooting) {
                return this.makeBulletAction(unit, enemy, 'shoot')
                    .then(() => {
                        enemy.hitHealth(10, unit);
                    });
            }

            const path = this.getPath(unit.x, unit.y, enemy.x, enemy.y).slice(0, -1);
            const canHitEnemy = path.length <= unit.character.speed;

            path.length = Math.min(path.length, unit.character.speed);

            return this.animateUnitByPath(unit, path)
                .then(() => {
                    if (canHitEnemy) {
                        return this.makeHitAction(unit, enemy, 'slash');
                    }

                    return;
                })
        }

        console.log(`unhandled action: ${action.action}`);
    }

    private getPath(x1: number, y1: number, x2: number, y2: number): IPathItem[] {
        const fromNode = this.graph.grid.get(x1, y1);
        const toNode = this.graph.grid.get(x2, y2);
        const pointWeight = this.graph.getWeight(x1, y1);

        this.graph.setWeight(x1, y1, 0);

        const path = this.astar.search(this.graph, fromNode, toNode);

        this.graph.setWeight(x1, y1, pointWeight);

        return path;
    }

    private getEnemy(id: string, toUnit: BattleUnit): BattleUnit {
        return this.units.find(unit => {
           return unit.side !== toUnit.side && unit.id === id;
        });
    }

    private getRandomEnemy(toUnit: BattleUnit): BattleUnit {
        const enemies = this.units.filter(unit => {
           return unit.side !== toUnit.side && unit.health > 0;
        });

        return enemies[Math.floor(Math.random() * enemies.length)];
    }

    private getFriend(id: string, toUnit: BattleUnit): BattleUnit {
        return this.units.find(unit => {
           return unit.side === toUnit.side && unit.id === id;
        });
    }

    private animateUnitByPath(unit: BattleUnit, path: IPathItem[]): Promise<void> {
        if (path.length === 0) {
            return Promise.resolve();
        }

        const lastItem = path[path.length - 1];

        return AsyncSequence.from(path.map(({x, y}) =>
            () => unit.setPositionAction(x, y)
        )).then(() => {
            this.set(lastItem.x, lastItem.y, unit);
        });
    }

    private makeBulletAction(fromUnit: BattleUnit, toUnit: BattleUnit, animation: IAnimationName): Promise<void> {
        const type = fromUnit.character.bulletType;

        fromUnit.setAnimation(animation);

        return new Promise(resolve => {
            setTimeout(() => {
                fromUnit.setAnimation('idle');
                this.bullet$.next([fromUnit, toUnit, type]);

                setTimeout(() => {
                    resolve();
                }, 300);

            }, 700);
        })
    }

    private makeHitAction(fromUnit: BattleUnit, toUnit: BattleUnit, animation: IAnimationName): Promise<void> {
        fromUnit.setAnimation(animation);

        return new Promise(resolve => {
            setTimeout(() => {
                toUnit.hitHealth(10, fromUnit);
                fromUnit.setAnimation('idle');
                resolve();
            }, 500);
        })
    }
}