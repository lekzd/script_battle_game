import {IAction} from './CodeSandbox';

export function getUnitApi(unit: any, actions: IAction[]) {
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
            return unit.character.type === 'shooting';
        }

        isMagician() {
            return unit.character.type === 'magic';
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

    return new UnitApi();
}