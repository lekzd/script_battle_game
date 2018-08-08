import {fromEvent, merge, Observable} from "rxjs/index";
import {CharactersList} from "../characters/CharactersList";
import {Inject} from "../InjectDectorator";

export class Toolbar {

    get buttons(): HTMLButtonElement[] {
        return Array.from(document.querySelectorAll('.select-button'));
    }

    get runButtonClick$(): Observable<Event> {
        return fromEvent(document.getElementById('run'), 'click');
    }

    get selectClick$(): Observable<MouseEvent> {
        return merge(
            ...this.buttons
                .map(element => fromEvent<MouseEvent>(element, 'click'))
        );
    }

    get selectWindow(): HTMLElement {
        return document.querySelector('.select-window');
    }

    @Inject(CharactersList) private charactersList: CharactersList;

    private selectedItem: number;

    constructor(private container: HTMLElement) {

        this.container.innerHTML = `
            <button id="run" class="runButton toolbar-button" type="button">Run</button>
            <div class="select-window">
                <button id="select-1" class="toolbar-button select-button" type="button"></button>
                <button id="select-2" class="toolbar-button select-button" type="button"></button>
                <button id="select-3" class="toolbar-button select-button" type="button"></button>
                <button id="select-4" class="toolbar-button select-button" type="button"></button>
                
                <div class="select-view">
                    ${this.charactersList.types.map(characterConfig => {
                        return `
                            <section class="unit">
                                <div class="unit-img ${characterConfig.key}"></div>
                                <div class="unit-name">${characterConfig.id}</div>
                            </section>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.selectClick$.subscribe(event => {
            const itemIndex = this.buttons.indexOf(<HTMLButtonElement>event.target);

            if (itemIndex === this.selectedItem) {
                this.selectWindow.classList.remove('opened');

                this.selectedItem = null;
            } else {
                this.selectWindow.classList.add('opened');
            }

            this.selectedItem = itemIndex;
        })

    }
}