import {Observable} from "rxjs/internal/Observable";
import {fromEvent} from "rxjs/internal/observable/fromEvent";

interface ISectionState {
    isOpen: boolean;
    content: string;
}

export class AccordionSectionComponent extends HTMLElement {

    private state = <ISectionState>{};

    get headerText(): string {
        return this.getAttribute('header');
    }

    get isOpen(): boolean {
        return !!this.getAttribute('opened');
    }

    get headerClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.querySelector('.accordion-header'), 'click');
    }

    constructor() {
        super();

        const content = this.innerHTML;

        this.state = {
            isOpen: this.isOpen,
            content
        };

        this.innerHTML = this.render(this.state);

        this.headerClick$.subscribe(() => {
            this.setState({isOpen: !this.state.isOpen});
        });
    }

    render(state: ISectionState): string {
        this.classList.toggle('opened', state.isOpen);

        return `
            <h2 class="accordion-header">${this.headerText}</h2>
            <div class="accordion-content">
                
                ${state.content}
                
            </div>
        `;
    }

    setState(newState: Partial<ISectionState>) {
        this.state = Object.assign(this.state, newState);

        this.classList.toggle('opened', this.state.isOpen);
    }
}

customElements.define('accordion-section', AccordionSectionComponent);