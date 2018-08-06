
import {Grid} from "./Grid";
import {GraphNode} from "./GraphNode";

export class Graph {
    private dirtyNodes: Set<GraphNode>;
    grid: Grid<GraphNode>;

    constructor(width: number, height: number) {
        this.dirtyNodes = new Set();
        this.grid = new Grid(width);

        let x = width;
        while (x--) {
            let y = height;
            while (y--) {
                let node = new GraphNode(x, y, 1);
                this.cleanNode(node);
                this.grid.set(x, y, node);
            }
        }

        this.dirtyNodes.clear();
    }

    cleanNode(node: GraphNode) {
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.parent = null;
    }

    cleanDirty() {
        this.dirtyNodes.forEach(this.cleanNode);
        this.dirtyNodes.clear();
    }

    markDirty(node: GraphNode) {
        this.dirtyNodes.add(node);
    }

    clearWeight() {
        this.grid.forEach(item => { item.weight = 0 });
    }

    setWeight(x: number, y: number, weight: number) {
        const node = this.grid.get(x, y);

        node.weight = weight;
    }

    getWeight(x: number, y: number): number {
        const node = this.grid.get(x, y);

        return node.weight;
    }

    protected getWest(x: number, y: number): GraphNode {
        return this.grid.get(x - 1, y);
    }

    protected getEast(x: number, y: number): GraphNode {
        return this.grid.get(x + 1, y);
    }

    protected getSouth(x: number, y: number): GraphNode {
        return this.grid.get(x, y - 1);
    }

    protected getNorth(x: number, y: number): GraphNode {
        return this.grid.get(x, y + 1);
    }

    protected getSouthWest(x: number, y: number): GraphNode {
        return this.grid.get(x - 1, y - 1);
    }

    protected getSouthEast(x: number, y: number): GraphNode {
        return this.grid.get(x + 1, y - 1);
    }

    protected getNorthWest(x: number, y: number): GraphNode {
        return this.grid.get(x - 1, y + 1);
    }

    protected getNorthEast(x: number, y: number): GraphNode {
        return this.grid.get(x + 1, y + 1);
    }

    neighbors({x, y}: GraphNode): GraphNode[] {
        let cell;
        const ret = [];

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

        if (cell = this.getSouthWest(x, y)) {
            ret.push(cell);
        }

        if (cell = this.getSouthEast(x, y)) {
            ret.push(cell);
        }

        if (cell = this.getNorthWest(x, y)) {
            ret.push(cell);
        }

        if (cell = this.getNorthEast(x, y)) {
            ret.push(cell);
        }

        return ret;
    }
}
