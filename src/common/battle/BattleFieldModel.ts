import {Grid} from "../helpers/Grid";
import {BattleUnit} from "./BattleUnit";
import {Inject} from "../InjectDectorator";
import {HexagonalGraph} from "../helpers/HexagonalGraph";
import {IAction} from "../codeSandbox/CodeSandbox";
import {Astar, IPathItem} from "../helpers/Astar";
import {AsyncSequence} from "../helpers/AsyncSequence";
import {Subject} from "rxjs/internal/Subject";
import {CharacterType} from "../characters/CharactersList";
import {BulletType} from "./BulletDrawer";
import {ConsoleService} from "../console/ConsoleService";
import {getDistanceFactor} from '../helpers/getDistanceFactor';
import {RoomService} from '../RoomService';
import {random, setRandomSeed} from '../helpers/random';

const FIELD_WIDTH = 12;
const FIELD_HEIGHT = 9;

export class BattleFieldModel {

    bullet$ = new Subject<[BattleUnit, BattleUnit, BulletType]>();

    @Inject(Astar) private astar: Astar;
    @Inject(RoomService) private roomService: RoomService;
    @Inject(ConsoleService) private consoleService: ConsoleService;

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
        if (action.action === 'goTo') {
            const toX = parseInt(action.x, 10);
            const toY = parseInt(action.y, 10);

            if (isNaN(toX)) {
                this.dispatchError('x не может быть приведен к числу');
            }

            if (isNaN(toY)) {
                this.dispatchError('y не может быть приведен к числу');
            }

            const path = this.getPath(unit.x, unit.y, toX, toY);

            path.length = Math.min(path.length, unit.character.speed);

            return this.animateUnitByPath(unit, path);
        }

        if (action.action === 'goToEnemyAndHit') {
            const enemy = this.getEnemy(action.id, unit);

            if (!enemy) {
                return unit.sayAction(`${action.id} не найден`);
            }

            const path = this.getPath(unit.x, unit.y, enemy.x, enemy.y).slice(0, -1);
            const canHitEnemy = path.length <= unit.character.speed;

            path.length = Math.min(path.length, unit.character.speed);

            return this.animateUnitByPath(unit, path)
                .then(() => {
                    if (unit.character.type === CharacterType.magic) {
                        return this.makeSpellAttack(unit, enemy);
                    }

                    if (unit.character.type === CharacterType.shooting) {
                        return this.makeShootingAttack(unit, enemy);
                    }

                    if (canHitEnemy) {
                        return this.makeHitAction(unit, enemy);
                    }

                    return;
                })
        }

        if (action.action === 'say') {
            if (!action.text) {
                this.dispatchError(`say(text) Не задан обязательный параметр text`);
            }

            return unit.sayAction(action.text.toString());
        }

        if (action.action === 'shoot') {
            const enemy = this.getEnemy(action.id, unit);

            if (!enemy) {
                return unit.sayAction(`${action.id} не найден`);
            }

            if (unit.character.type !== CharacterType.shooting) {
                return unit.sayAction('Эй, я не умею стрелять');
            }

            return this.makeShootingAttack(unit, enemy);
        }

        if (action.action === 'spell') {
            const enemy = this.getEnemy(action.id, unit);

            if (!enemy) {
                return unit.sayAction(`${action.id} не найден`);
            }

            if (unit.character.type !== CharacterType.magic) {
                return unit.sayAction('Я не знаю магии!');
            }

            return this.makeSpellAttack(unit, enemy);
        }

        if (action.action === 'heal') {
            const enemy = this.getFriend(action.id, unit);

            if (unit.character.type !== CharacterType.magic) {
                return unit.sayAction('Я не умею лечить!');
            }

            return this.makeBulletAction(unit, enemy);
        }


        if (action.action === 'attackRandom') {
            const enemy = this.getRandomUnit(unit);

            if (!enemy) {
                return unit.sayAction('себе подобных не трогаю!')
            }

            if (unit.character.type === CharacterType.magic) {
                return this.makeSpellAttack(unit, enemy);
            }

            if (unit.character.type === CharacterType.shooting) {
                return this.makeShootingAttack(unit, enemy);
            }

            const path = this.getPath(unit.x, unit.y, enemy.x, enemy.y).slice(0, -1);
            const canHitEnemy = path.length <= unit.character.speed;

            path.length = Math.min(path.length, unit.character.speed);

            return this.animateUnitByPath(unit, path)
                .then(() => {
                    if (canHitEnemy) {
                        return this.makeHitAction(unit, enemy);
                    }

                    return;
                })
        }

        console.log(`unhandled action: ${action.action}`);
    }

    private getPath(x1: number, y1: number, x2: number, y2: number): IPathItem[] {
        x2 = Math.min(Math.max(x2, 0), FIELD_WIDTH - 1);
        y2 = Math.min(Math.max(y2, 0), FIELD_HEIGHT - 1);

        const fromNode = this.graph.grid.get(x1, y1);
        const toNode = this.graph.grid.get(x2, y2);

        return this.astar.search(this.graph, fromNode, toNode);
    }

    private getEnemy(id: string, toUnit: BattleUnit): BattleUnit {
        if (!id) {
            this.dispatchError(`Не задан обязательный параметр id`);
        }

        const units = this.units.filter(unit => {
            return unit.side !== toUnit.side
                && unit.id.toLowerCase() === id.toString().toLowerCase()
                && unit.health > 0
        });

        if (!units.length) {
            return null;
        }

        const randomIndex = Math.floor(this.getRandom(toUnit) * units.length);

        return units[randomIndex];
    }

    private getRandomUnit(toUnit: BattleUnit): BattleUnit {
        const enemies = this.units.filter(unit => {
           return unit.health > 0 && unit.id !== toUnit.id
        });

        if (!enemies.length) {
            return null;
        }

        return enemies[Math.floor(this.getRandom(toUnit) * enemies.length)];
    }

    private getFriend(id: string, toUnit: BattleUnit): BattleUnit {
        if (!id) {
            this.dispatchError(`Не задан обязательный параметр id`);
        }

        const unit = this.units.find(unit => {
           return unit.side === toUnit.side && unit.id === id;
        });

        if (!unit) {
            this.dispatchError(`Союзник с ID "${id}" не найден`);
        }

        return unit;
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

    private makeBulletAction(fromUnit: BattleUnit, toUnit: BattleUnit): Promise<void> {
        const type = fromUnit.character.bulletType;
        const animation = fromUnit.character.attackAnimation;

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

    private makeHitAction(fromUnit: BattleUnit, toUnit: BattleUnit): Promise<void> {
        const animation = fromUnit.character.attackAnimation;

        fromUnit.setAnimation(animation);

        return new Promise(resolve => {
            setTimeout(() => {
                toUnit.hitHealth(10, fromUnit);
                fromUnit.setAnimation('idle');
                resolve();
            }, 500);
        })
    }

    private makeSpellAttack(unit: BattleUnit, enemy: BattleUnit): Promise<void> {
        const distanceFactor = getDistanceFactor(unit.x, unit.y, enemy.x, enemy.y);
        const hitPower = Math.round(10 * distanceFactor);

        return this.makeBulletAction(unit, enemy)
            .then(() => {
                enemy.hitHealth(hitPower, unit);
            });
    }

    private makeShootingAttack(unit: BattleUnit, enemy: BattleUnit): Promise<void> {
        const distanceFactor = 1.5 - getDistanceFactor(unit.x, unit.y, enemy.x, enemy.y);
        const hitPower = Math.round(10 * distanceFactor);

        return this.makeBulletAction(unit, enemy)
            .then(() => {
                enemy.hitHealth(hitPower, unit);
            });
    }

    private dispatchError(errorText: string) {

        this.consoleService.runtimeLog(errorText);

        throw new Error(errorText);
    }

    private getRandom(toUnit: BattleUnit): number {
        const seedSource = JSON.stringify(toUnit.actions);

        setRandomSeed(seedSource);

        return random();
    }
}