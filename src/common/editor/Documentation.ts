
import template from './documentation.template.html';
import {fromEvent, merge, Observable} from 'rxjs/index';
import {filter} from 'rxjs/internal/operators';
import "./AccordionSectionComponent";

export class Documentation {

    set opened(value: boolean) {
        this.container.classList.toggle('opened', value);
    }

    get backdropClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'click')
            .pipe(filter(event => event.target === this.container))
    }

    get onEscape$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(filter(event => event.keyCode === 27))
    }

    get onCloseClick(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(this.container.querySelector('#close'), 'click')
    }

    constructor(private container: HTMLElement) {

        this.container.innerHTML = template;

        this.opened = true;

        merge(
            this.onEscape$,
            this.backdropClick$,
            this.onCloseClick
        )
            .subscribe(() => {
                this.opened = false;
            });

    }

}