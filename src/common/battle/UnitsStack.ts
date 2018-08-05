import {BattleUnit} from './BattleUnit';

export class UnitsStack {

    all: BattleUnit[] = [];
    activeUnit: BattleUnit;

    init(units: BattleUnit[]) {
        this.all = units.slice(0);
        this.newRound();
    }

    next() {
        this.activeUnit = this.all.pop();

        this.activeUnit.hasTurn = false;

        this.all.unshift(this.activeUnit);

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