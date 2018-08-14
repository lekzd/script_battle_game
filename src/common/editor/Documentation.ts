
import template from './documentation.template.html';
import {fromEvent, Observable} from 'rxjs/index';
import {filter} from 'rxjs/internal/operators';

export class Documentation {

    set opened(value: boolean) {
        this.container.classList.toggle('opened', value);
    }

    get backdropClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'click')
            .pipe(filter(event => event.target === this.container))
    }

    constructor(private container: HTMLElement) {

        this.container.innerHTML = template;

        this.opened = true;

        this.backdropClick$
            .subscribe(() => {
                this.opened = false;
            })

    }

}