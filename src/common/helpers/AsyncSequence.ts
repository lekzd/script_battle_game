

export class AsyncSequence {
    private all: Function[];
    private counter: number;
    private globalResolve: Function;
    promise: Promise<any>;

    constructor(all) {
        this.all = all;
        this.counter = this.all.filter(item => typeof item === "function").length;
        this.promise = new Promise(globalResolve => {
            this.globalResolve = globalResolve;
            this.promise = <Promise<any>>this.all.reduce(this.runCallback.bind(this), Promise.resolve(true));
        });
    }

    private onPromise(promise: Promise<any>, callback: Function): Promise<any> {
        promise = callback();

        this.counter--;

        if (this.counter === 0) {
            this.globalResolve(true);
        }

        return promise;
    }

    private runCallback(promise: Promise<any>, item: Function | Array<Function>): Promise<any> {
        const callback = Array.isArray(item)
            ? AsyncSequence.from.bind(this, item)
            : item;

        return promise.then(this.onPromise.bind(this, promise, callback));
    }

    static from(list: any[]): Promise<any> {
        return (new AsyncSequence(list)).promise;
    }
}