import {UnitsStack} from './UnitsStack';
import {Inject} from '../../common/InjectDectorator';

export enum BattleSide {
    left, right
}

export class BattleSession {

    @Inject(UnitsStack) private unitsStack: UnitsStack;

    private winPromise: Promise<BattleSide>;
    private winResolve: Function;

    private turnResolve: Function;

    start() {
        this.winPromise = new Promise<BattleSide>(resolve => {
            this.winResolve = resolve;
        });

        const units = [];

        this.unitsStack.init(units);

        this.newTurn();
    }

    private newTurn() {
        new Promise<void>(resolve => {
            this.turnResolve = resolve;
        }).then(() => {
            this.unitsStack.next();
            this.newTurn();
            this.runActiveUnitTasks();
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