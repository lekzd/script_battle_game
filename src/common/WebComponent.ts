
export abstract class WebComponent<T> extends HTMLElement {
    state: Partial<T> = {};

    setState(newState: Partial<T>) {
        this.state = Object.assign(this.state, newState);

        if (this.shouldChange(this.state)) {
            this.onChanged(this.state);

            if (this.shouldRender(this.state)) {
                this.innerHTML = this.render(this.state);

                this.afterRender(this.state);
            }
        }
    }

    abstract render(state: Partial<T>): string;

    renderList(list: any[], callback: (item: any) => string): string {
        return list.map(item => callback(item)).join('');
    }

    afterRender(state: Partial<T>) {}

    shouldRender(state: Partial<T>): boolean {
        return true;
    }

    shouldChange(state: Partial<T>): boolean {
        return true;
    }

    onChanged(state: Partial<T>) {}
}