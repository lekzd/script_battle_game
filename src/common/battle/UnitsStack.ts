import {BattleUnit} from './BattleUnit';

export class UnitsStack {

    activeUnit: BattleUnit;

    private alive: BattleUnit[] = [];

    init(units: BattleUnit[]) {
        this.alive = units.sort((a: BattleUnit, b: BattleUnit) => {
            if (a.character.speed < b.character.speed) {
                return 1;
            }

            return -1;
        });

        this.alive.forEach(unit => {
            unit.hasTurn = true;
        });
    }

    next() {
        this.activeUnit = this.alive.shift();

        this.activeUnit.hasTurn = false;

        this.alive.push(this.activeUnit);

        if (this.isRoundEnd()) {
            this.newRound();
        }
    }

    newRound() {
        this.clearDiedUnits();

        this.alive.forEach(unit => {
            unit.hasTurn = true;
        });
    }

    private isRoundEnd(): boolean {
        return !this.alive.some(unit => unit.hasTurn);
    }

    private clearDiedUnits() {
        this.alive = this.alive.filter(unit => unit.health > 0)
    }

}