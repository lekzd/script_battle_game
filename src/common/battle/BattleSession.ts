import {UnitsStack} from './UnitsStack';
import {Inject} from '../InjectDectorator';
import {BattleUnit} from "./BattleUnit";
import {BattleFieldModel} from "./BattleFieldModel";
import {BattleSide} from "./BattleSide";

export class BattleSession {

    @Inject(UnitsStack) private unitsStack: UnitsStack;
    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;

    private winPromise: Promise<BattleSide>;
    private winResolve: Function;

    start(units: BattleUnit[]) {
        this.winPromise = new Promise<BattleSide>(resolve => {
            this.winResolve = resolve;
        });

        this.unitsStack.init(units);

        this.newTurn();
    }

    private newTurn() {
        this.unitsStack.next();
        this.runActiveUnitTasks()
            .then(() => {
                const winnerSide = this.getWinnerSide();

                if (winnerSide) {
                    this.winResolve(winnerSide);

                    return;
                }

                this.newTurn();
            });
    }

    private runActiveUnitTasks(): Promise<void> {
        const {activeUnit} = this.unitsStack;
        const action = activeUnit.actions.shift();

        if (action) {
            return this.battleFieldModel.doAction(activeUnit, action);
        }

        return Promise.resolve();
    }

    private isLeftSideWins(): boolean {
        return !this.unitsStack.all.some(unit => unit.side === BattleSide.right && unit.health > 0)
    }

    private isRightSideWins(): boolean {
        return !this.unitsStack.all.some(unit => unit.side === BattleSide.left && unit.health > 0)
    }

    private getWinnerSide(): BattleSide {
        if (this.isLeftSideWins()) {
            return BattleSide.left;
        }

        if (this.isRightSideWins()) {
            return BattleSide.right;
        }

        return null;
    }
}