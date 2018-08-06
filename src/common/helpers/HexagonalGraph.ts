import {Graph} from "./Graph";
import {GraphNode} from "./GraphNode";

export class HexagonalGraph extends Graph {
    constructor(width: number, height: number) {
        super(width, height);
    }

    neighborByAngle({x, y}, angle: number) {
        const ODD = y % 2;

        if (angle === 0) {
            if (ODD) {
                return this.getSouthWest(x, y);
            } else {
                return this.getSouth(x, y);
            }
        }

        if (angle === 1) {
            if (ODD) {
                return this.getSouth(x, y);
            } else {
                return this.getSouthEast(x, y);
            }
        }

        if (angle === 2) {
            return this.getEast(x, y);
        }

        if (angle === 3) {
            if (ODD) {
                return this.getNorth(x, y);
            } else {
                return this.getNorthEast(x, y);
            }
        }

        if (angle === 4) {
            if (ODD) {
                return this.getNorthWest(x, y);
            } else {
                return this.getNorth(x, y);
            }
        }

        if (angle === 5) {
            return this.getWest(x, y);
        }
    }

    neighbors({x, y}: GraphNode): GraphNode[] {
        let cell;
        const ret = [];
        const ODD = y % 2;

        if (cell = this.getWest(x, y)) {
            ret.push(cell);
        }

        if (cell = this.getEast(x, y)) {
            ret.push(cell);
        }

        if (cell = this.getSouth(x, y)) {
            ret.push(cell);
        }

        if (cell = this.getNorth(x, y)) {
            ret.push(cell);
        }

        if (ODD) {
            if (cell = this.getSouthWest(x, y)) {
                ret.push(cell);
            }

            if (cell = this.getNorthWest(x, y)) {
                ret.push(cell);
            }

        } else {
            if (cell = this.getSouthEast(x, y)) {
                ret.push(cell);
            }

            if (cell = this.getNorthEast(x, y)) {
                ret.push(cell);
            }
        }

        return ret;
    }
}
