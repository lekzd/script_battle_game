
class MaybeMonad {

    private value: any = null;

    constructor(any: any) {
        if (any instanceof MaybeMonad) {
            this.value = any.value;
        } else if (typeof any === 'function') {
            throw Error('function clone');
        } else {
            this.value = any;
        }
    }

    isEmpty(): boolean {
        return (this.value === null) || (this.value === undefined);
    }

    get(): any {
        return this.value;
    }

    getOrElse(elseVal): any {
        if (this.isEmpty()) {
            return elseVal;
        } else {
            return this.value;
        }
    }

    toInt(): MaybeMonad {
        this.value = parseInt(this.value);
        if (isNaN(this.value)) {
            this.value = null;
        }
        return this;
    }

    toString(): MaybeMonad {
        this.value = String(this.value);
        return this;
    }

    toBoolean(): MaybeMonad {
        if (this.value) {
            this.value = !~['false', '0'].indexOf(String(this.value).toLowerCase());
        } else {
            this.value = false;
        }
        return this;
    }

    evaluate(...params): MaybeMonad {
        this.value = (this.value instanceof Function)
            ? this.value.call(...params)
            : this.value;
        return this;
    }

    pluck(path: string): MaybeMonad {
        try {
            this.value = path.split('.').reduce(((result, key) => result && result[key]), this.value);
        } catch (error) {
            console.error('Maybe.pluck', error);
        }
        return this;
    }

    map(fn: (value: any) => any): MaybeMonad {
        try {
            if (Array.isArray(this.value)) {
                this.value.map(fn);
            } else {
                this.value = fn(this.value);
            }
        } catch (error) {
            console.error('Maybe.map', error);
        }
        return this;
    }
}

export const Maybe = any => new MaybeMonad(any);