import {IAction} from './CodeSandbox';

export function getUnitApi(unit: any, actions: IAction[]) {
    class UnitApi {
        goTo(x, y) {
            actions.push({action: 'goTo', x: x, y: y});
        }

        goToEnemyAndHit(id) {
            actions.push({action: 'goToEnemyAndHit', id: id});
        }

        shoot(id) {
            actions.push({action: 'shoot', id: id});
        }

        spell(id) {
            actions.push({action: 'spell', id: id});
        }

        heal(id) {
            actions.push({action: 'heal', id: id});
        }

        say(text) {
            actions.push({action: 'say', text: text});
        }

        isShooter() {
            return unit.character.type === 'shooting';
        }

        isMagician() {
            return unit.character.type === 'magic';
        }

        isInfantry() {
            return unit.character.type === 'melee';
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

        is(id) {
            return unit.id === id;
        }
    }

    return new UnitApi();
}