import {IAction} from './CodeSandbox';

export function getUnitApi(unit: any, actions: IAction[]) {
    class UnitApi {

        goTo(x: number, y: number) {
            actions.push({action: 'goTo', x: x, y: y});
        }

        relativeGoTo(x: number, y: number) {
            actions.push({action: 'goTo', x: x + unit.x, y: y + unit.y});
        }

        goToEnemyAndHit(id: string) {
            actions.push({action: 'goToEnemyAndHit', id: id});
        }

        shoot(id: string) {
            actions.push({action: 'shoot', id: id});
        }

        spell(id: string) {
            actions.push({action: 'spell', id: id});
        }

        // heal(id: string) {
        //     actions.push({action: 'heal', id: id});
        // }

        say(text: string) {
            actions.push({action: 'say', text: text});
        }

        attackRandom() {
            actions.push({action: 'attackRandom'});
        }

        isShooter(): boolean {
            return unit.character.type === 'shooting';
        }

        isMagician(): boolean {
            return unit.character.type === 'magic';
        }

        isInfantry(): boolean {
            return unit.character.type === 'melee';
        }

        // isAlive(): boolean {
        //     return unit.health > 0;
        // }

        getHealth(): number {
            return unit.health;
        }

        // getID(): string {
        //     return unit.id;
        // }

        getX(): number {
            return unit.x;
        }

        getY(): number {
            return unit.y;
        }

        is(id: string): boolean {
            return unit.id.toLowerCase() === `${id}`.toLowerCase();
        }
    }

    return new UnitApi();
}