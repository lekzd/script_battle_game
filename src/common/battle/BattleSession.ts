import {UnitsStack} from './UnitsStack';
import {Inject} from '../InjectDectorator';
import {BattleUnit} from "./BattleUnit";
import {BattleFieldModel} from "./BattleFieldModel";
import {BattleSide} from "./BattleSide";

export enum WinnerSide {
    left = 'left',
    right = 'right',
    nobody = 'nobody'
}

export interface ISessionResult {
    winner: WinnerSide;
    damage: {
        left: number;
        right: number;
    }
}

export class BattleSession {

    @Inject(UnitsStack) private unitsStack: UnitsStack;
    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;

    private winPromise: Promise<ISessionResult>;
    private winResolve: (state: ISessionResult) => any;

    start(units: BattleUnit[]): Promise<ISessionResult> {
        this.winPromise = new Promise<ISessionResult>(resolve => {
            this.winResolve = resolve;
        });

        this.unitsStack.init(units);

        this.newTurn();

        return this.winPromise;
    }

    getSideDamage(side: BattleSide): number {
        return this.unitsStack.all.reduce((summ, unit) => {
            return summ + (unit.side === side ? unit.gotDamage : 0);
        }, 0);
    }

    private newTurn() {
        this.unitsStack.next();
        this.runActiveUnitTasks()
            .then(() => {
                const winnerSide = this.getWinnerSide();

                if (winnerSide) {
                    this.winResolve({
                        winner: winnerSide,
                        damage: {
                            left: this.getSideDamage(BattleSide.right),
                            right: this.getSideDamage(BattleSide.left)
                        }
                    });

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

    private hasAbsoluteWin(side: BattleSide): boolean {
        return !this.unitsStack.all.some(unit => unit.side !== side && unit.health > 0)
    }

    private noActionsLeft(): boolean {
        return !this.unitsStack.all.some(unit => unit.actions.length > 0)
    }

    private getWinnerSide(): WinnerSide {
        if (this.hasAbsoluteWin(BattleSide.left)) {
            return WinnerSide.left;
        }

        if (this.hasAbsoluteWin(BattleSide.right)) {
            return WinnerSide.right;
        }

        if (this.noActionsLeft()) {
            const leftDamage = this.getSideDamage(BattleSide.right);
            const rightDamage = this.getSideDamage(BattleSide.left);

            if (leftDamage > rightDamage) {
                return WinnerSide.left;
            }

            if (leftDamage < rightDamage) {
                return WinnerSide.right;
            }

            return WinnerSide.nobody;
        }

        return null;
    }
}