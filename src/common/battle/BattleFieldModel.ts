import {Grid} from "../helpers/Grid";
import {BattleUnit} from "./BattleUnit";
import {Inject} from "../InjectDectorator";
import {BattleFieldDrawer} from "./BattleFieldDrawer";

const FIELD_WIDTH = 12;
const FIELD_HEIGHT = 9;

export class BattleFieldModel {

    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private grid = new Grid<BattleUnit>(FIELD_WIDTH);

    set(x: number, y: number, unit: BattleUnit) {
        this.grid.set(x, y, unit);
    }

    get(x: number, y: number): BattleUnit {
        return this.grid.get(x, y);
    }

    forEach(callback: (unit: BattleUnit, x: number, y: number) => void) {
        this.grid.forEach(callback);
    }

}