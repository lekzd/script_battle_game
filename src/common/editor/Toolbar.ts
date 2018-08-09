import {fromEvent, merge, Observable} from "rxjs/index";
import {CharactersList, ICharacterConfig} from "../characters/CharactersList";
import {Inject} from "../InjectDectorator";
import {filter, map} from 'rxjs/internal/operators';
import {ClientState} from '../client/ClientState';

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

    get unitButtons(): HTMLElement[] {
        return Array.from(document.querySelectorAll('.select-view > .unit'));
    }

    get chooseUnitClick$(): Observable<ICharacterConfig> {
        return merge(
            ...this.unitButtons
                .map(element => fromEvent<MouseEvent>(element, 'click'))
        )
            .pipe(filter(() => this.isSelectorOpen))
            .pipe(map((event: MouseEvent) => {
                const index = this.unitButtons.indexOf(<HTMLElement>event.toElement);

                return this.charactersList.types[index];
            }))
    }

    get selectWindow(): HTMLElement {
        return document.querySelector('.select-window');
    }

    get isSelectorOpen(): boolean {
        return this.selectWindow.classList.contains('opened');
    }

    set isSelectorOpen(value: boolean) {
        if (value) {
            this.selectWindow.classList.add('opened');
        } else {
            this.selectWindow.classList.remove('opened');
        }
    }

    @Inject(ClientState) private clientState: ClientState;
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
                this.isSelectorOpen = false;

                this.selectedItem = null;
            } else {
                this.isSelectorOpen = true;
            }

            this.selectedItem = itemIndex;
        });

        this.chooseUnitClick$
            .subscribe((characterConfig) => {
                const {army} = this.clientState;

                army[this.selectedItem] = characterConfig.key;

                this.clientState.set({army: army});
            });

    }
}