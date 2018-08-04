
export class BinaryHeap {

    private content = [];

    constructor(private scoreFunction) {
    }

    push(element: any) {
        this.content.push(element);
        return this.sinkDown(this.content.length - 1);
    }

    pop() {
        let result = this.content[0];
        let end = this.content.pop();
        if (this.content.length) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    }

    remove(node: any) {
        let i = this.content.indexOf(node);
        let end = this.content.pop();
        if (i !== (this.content.length - 1)) {
            this.content[i] = end;
            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                return this.sinkDown(i);
            } else {
                return this.bubbleUp(i);
            }
        }
    }

    size(): number {
        return this.content.length;
    }

    rescoreElement(node: any) {
        this.sinkDown(this.content.indexOf(node));
    }

    sinkDown(n) {
        let element = this.content[n];
        while (n > 0) {
            let parentN = ((n + 1) >> 1) - 1;
            let parent = this.content[parentN];

            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                n = parentN;
            } else {
                break;
            }
        }
    }

    bubbleUp(n: number) {
        let { length } = this.content;
        let element = this.content[n];
        let elemScore = this.scoreFunction(element);

        while (true) {
            let child1Score;
            let child2N = (n + 1) << 1;
            let child1N = child2N - 1;
            let swap = null;

            if (child1N < length) {
                let child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            if (child2N < length) {
                let child2 = this.content[child2N];
                let child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            } else {
                break;
            }
        }
    }
};
