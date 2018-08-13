import {BattleUnit} from './BattleUnit';

export class UnitsStack {

    all: BattleUnit[] = [];
    alive: BattleUnit[] = [];
    activeUnit: BattleUnit;

    init(units: BattleUnit[]) {
        this.all = units.slice(0);
        this.alive = units.slice(0);

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