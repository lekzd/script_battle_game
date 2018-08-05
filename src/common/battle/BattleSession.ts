import {UnitsStack} from './UnitsStack';
import {Inject} from '../InjectDectorator';
import {BattleUnit} from "./BattleUnit";
import {BattleFieldModel} from "./BattleFieldModel";

export enum BattleSide {
    left, right
}

export class BattleSession {

    @Inject(UnitsStack) private unitsStack: UnitsStack;
    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;

    private winPromise: Promise<BattleSide>;
    private winResolve: Function;

    private turnResolve: Function;

    start(units: BattleUnit[]) {
        this.winPromise = new Promise<BattleSide>(resolve => {
            this.winResolve = resolve;
        });

        this.unitsStack.init(units);

        this.newTurn();
    }

    private newTurn() {
        new Promise<void>(resolve => {
            this.turnResolve = resolve;
            this.runActiveUnitTasks();
        }).then(() => {
            this.unitsStack.next();
            this.newTurn();
        });
    }

    private runActiveUnitTasks() {
        setTimeout(() => {

            if (this.isLeftSideWins()) {
                this.winResolve(BattleSide.left);

                return;
            }

            if (this.isRightSideWins()) {
                this.winResolve(BattleSide.right);

                return;
            }

            const {activeUnit} = this.unitsStack;
            const action = activeUnit.actions.shift();

            if (action) {
                this.battleFieldModel.doAction(activeUnit, action);
            }

            this.turnResolve();
        }, 1000);
    }

    private isLeftSideWins(): boolean {
        return this.unitsStack.all.some(unit => unit.side === BattleSide.right && unit.health === 0)
    }

    private isRightSideWins(): boolean {
        return this.unitsStack.all.some(unit => unit.side === BattleSide.left && unit.health === 0)
    }
}