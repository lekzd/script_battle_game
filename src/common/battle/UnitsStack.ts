import {BattleUnit} from './BattleUnit';

export class UnitsStack {

    all: BattleUnit[] = [];
    activeUnit: BattleUnit;

    init(units: BattleUnit[]) {
        this.all = units.slice(0);
    }

    next() {
        this.activeUnit = this.all.shift();

        this.activeUnit.hasTurn = false;

        this.all.push(this.activeUnit);

        if (this.isRoundEnd()) {
            this.newRound();
        }
    }

    newRound() {
        this.clearDiedUnits();

        this.all.forEach(unit => {
            unit.hasTurn = true;
        });

        this.next();
    }

    private isRoundEnd(): boolean {
        return !this.all.some(unit => unit.hasTurn);
    }

    private clearDiedUnits() {
        this.all = this.all.filter(unit => unit.health > 0)
    }

}