
import {BinaryHeap} from "./BinaryHeap";
import {GraphNode} from "./GraphNode";
import {Graph} from "./Graph";

export interface IPathItem {
    x: number,
    y: number
}

let pathTo = function(node: GraphNode): IPathItem[] {
    let curr = node;
    const path: IPathItem[] = [];

    while (curr.parent) {
        path.unshift({x: curr.x, y: curr.y});
        curr = curr.parent;
    }

    return path;
};

export class Astar {

    heuristics = {
        manhattan(pos0, pos1): number {
            let d1 = Math.abs(pos1.x - pos0.x);
            let d2 = Math.abs(pos1.y - pos0.y);
            return d1 + d2;
        },
        diagonal(pos0, pos1): number {
            let D = 1;
            let D2 = Math.sqrt(2);
            let d1 = Math.abs(pos1.x - pos0.x);
            let d2 = Math.abs(pos1.y - pos0.y);
            return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
        }
    };

    //
    // graph: Graph
    // start: graph.grid.get(x, y)
    // end: graph.grid.get(x, y)
    //
    search(graph: Graph, start: GraphNode, end: GraphNode): IPathItem[] {
        graph.cleanDirty();

        const heuristic = this.heuristics.diagonal;
        const openHeap = new BinaryHeap(node => node.f);
        const closedNodes = new WeakSet();
        const visitedNodes = new WeakSet();
        let pathEnd = null;

        start.h = heuristic(start, end);
        graph.markDirty(start);

        openHeap.push(start);

        while (openHeap.size() > 0) {
            let currentNode = openHeap.pop();

            if (currentNode === end) {
                let path = pathTo(currentNode);
                if (pathEnd) {
                    path.push(pathEnd);
                }
                return path;
            }

            closedNodes.add(currentNode);

            const neighbors = graph.neighbors(currentNode);

            for (let neighbor of neighbors) {
                if (closedNodes.has(neighbor) || neighbor.isWall()) {
                    continue;
                }

                let gScore = currentNode.g + neighbor.getCost(currentNode);
                let beenVisited = visitedNodes.has(neighbor);

                if (!beenVisited || (gScore < neighbor.g)) {
                    visitedNodes.add(neighbor);
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    graph.markDirty(neighbor);

                    if (!beenVisited) {
                        openHeap.push(neighbor);
                    } else {
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        return [];
    }
}

