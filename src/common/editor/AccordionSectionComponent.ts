
interface ISectionState {
    isOpen: boolean;
    content: string;
}

export class AccordionSectionComponent extends HTMLElement {

    get headerText(): string {
        return this.getAttribute('header');
    }

    get isOpen(): boolean {
        return !!this.getAttribute('opened');
    }

    constructor() {
        super();

        const content = this.innerHTML;

        this.innerHTML = this.render({
            isOpen: this.isOpen,
            content
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
}

customElements.define('accordion-section', AccordionSectionComponent);