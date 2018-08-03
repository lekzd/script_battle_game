
type iteratorCallback<T, R> = (item: T, x: number, y: number) => R;

export class Grid<T = any> {
    size = 0;

    private data: T[] = [];
    private byteSize = 0;

    constructor(size: number) {
        this.size = size;
        this.byteSize = Math.ceil(Math.log2(this.size));
    }

    private getKey(x: number, y: number): number {
        return (y << this.byteSize) + x;
    }

    set(x: number, y: number, data: T): Grid {
        let key = this.getKey(x, y);
        if ((key >= 0) && (x < this.size) && (y < this.size)) {
            this.data[key] = data;
        }
        return this;
    }

    get(x: number, y: number): T {
        return this.data[this.getKey(x, y)];
    }

    private iteratee(callback: iteratorCallback<T, void>, item: T, key: number) {
        const y = key >> this.byteSize;
        const x = key - (y << this.byteSize);

        callback(item, x, y);
    }

    forEach(callback: iteratorCallback<T, void>): Grid {
        this.data.forEach(this.iteratee.bind(this, callback));
        return this;
    }

    filter(filterFunction: iteratorCallback<T, boolean>): Grid {
        let result = new Grid(this.size);
        for (let key = 0; key < this.data.length; key++) {
            let y;
            let item = this.data[key];
            if (item === undefined) { continue; }
            let x = key - ((y = key >> this.byteSize) << this.byteSize);
            if (filterFunction(item, x, y)) {
                result.set(x, y, item);
            }
        }
        return result;
    }

    has(x: number, y: number): boolean {
        return this.data[this.getKey(x, y)] !== undefined;
    }

    clear(): Grid {
        this.data.length = 0;
        return this;
    }

    toString(): string {
        let grid = '';
        for (let y = 0, end = this.size, asc = 0 <= end; asc ? y <= end : y >= end; asc ? y++ : y--) {
            let row = '';
            for (let x = 0, end1 = this.size, asc1 = 0 <= end1; asc1 ? x <= end1 : x >= end1; asc1 ? x++ : x--) {
                let num: any = Number(this.get(x, y));
                if (isNaN(num)) { num = '.'; }
                row += num.toString() + ',';
            }
            grid += `\
            [${row}]`;
        }
        return grid;
    }

    getRawData(): T[] {
        return this.data;
    }

    setRawData(data: T[]) {
        this.data = data;
    }
}