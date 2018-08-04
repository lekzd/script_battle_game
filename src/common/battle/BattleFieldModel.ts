import {Grid} from "../helpers/Grid";
import {BattleUnit} from "./BattleUnit";
import {Inject} from "../InjectDectorator";
import {BattleFieldDrawer} from "./BattleFieldDrawer";
import {HexagonalGraph} from "../helpers/HexagonalGraph";

const FIELD_WIDTH = 12;
const FIELD_HEIGHT = 9;

export class BattleFieldModel {

    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private grid = new Grid<BattleUnit>(FIELD_WIDTH);
    private graph = new HexagonalGraph(FIELD_WIDTH, FIELD_HEIGHT);

    get units(): BattleUnit[] {
        const result = [];

        this.grid.forEach(unit => {
            if (!!unit) {
                result.push(unit);
            }
        });

        return result;
    }

    constructor() {
        this.grid.getRawData().fill(null);
    }

    set(x: number, y: number, unit: BattleUnit) {
        this.grid.set(x, y, unit);
        this.graph.setWeight(x, y, 1);
    }

    get(x: number, y: number): BattleUnit {
        return this.grid.get(x, y);
    }

    forEach(callback: (unit: BattleUnit, x: number, y: number) => void) {
        this.grid.forEach(callback);
    }

}