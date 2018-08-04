
export class GraphNode {
    x: number;
    y: number;
    weight: number;
    parent: GraphNode;
    h: number;
    g: number;
    f: number;

    constructor(x: number, y: number, weight: number) {
        this.x = x;
        this.y = y;
        this.weight = weight;
    }

    getCost(fromNeighbor: GraphNode): number {
        if (fromNeighbor && (fromNeighbor.x !== this.x) && (fromNeighbor.y !== this.y)) {
            return this.weight * 1.41421 * 20;
        }
        return this.weight * 20;
    }

    isWall(): boolean {
        return this.weight === 0;
    }
}