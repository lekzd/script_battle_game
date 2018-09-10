import {combineLatest, fromEvent, merge, NEVER, Observable, of, timer} from "rxjs/index";
import {CharactersList, CharacterType, ICharacterConfig} from "../characters/CharactersList";
import {Inject} from "../InjectDectorator";
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/internal/operators';
import {ClientState} from '../client/ClientState';
import {elementHasParent} from '../helpers/elementHasParent';
import {WebsocketConnection} from "../WebsocketConnection";
import {render, h} from 'preact';
import {Documentation} from '../documentation/Documentation';
import {PromptService} from '../../leaders/PromptService';

const maxSelectTime = 1000 * 60 * 12;
const maxSelectTimeAlert = 1000 * 60 * 11;

export class Toolbar {

    get buttons(): HTMLButtonElement[] {
        return Array.from(document.querySelectorAll('.select-button'));
    }

    get runButtonClick$(): Observable<Event> {
        return fromEvent(document.getElementById('run'), 'click');
    }

    get pushButtonClick$(): Observable<Event> {
        return fromEvent(document.getElementById('push'), 'click');
    }

    get helpButtonClick$(): Observable<Event> {
        return fromEvent(document.getElementById('help'), 'click');
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
                const index = this.unitButtons.indexOf(event.currentTarget as HTMLElement);

                return this.charactersList.types[index + 1];
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
            this.selectedItem = null;
        }
    }

    get selectedItem(): number {
        return this._selectedItem;
    }

    set selectedItem(value: number) {
        this.buttons.forEach((button, index) => {
            button.classList.toggle('selected', index === value);
        });

        this._selectedItem = value;
    }

    get onEscape$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(
                filter(() => this.isSelectorOpen),
                filter(event => event.keyCode === 27),
                tap(event => {
                    event.preventDefault();
                })
            )
    }

    get outsideSelectorClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(window, 'click')
            .pipe(
                filter(() => this.isSelectorOpen),
                filter(event => !elementHasParent((event.target as HTMLElement), this.selectWindow)),
                tap(event => {
                    event.preventDefault();
                })
            )
    }

    get stopSelectUnit$() {
        return this.connection.onState$<number>('createTime')
            .pipe(switchMap(createTime => {
                const delta = Date.now() - createTime;
                const timeout = maxSelectTime - delta;

                if (timeout <= 0) {
                    return of(null);
                }

                return timer(timeout);
            }))
    }

    get selectUnitAlert$() {
        return this.connection.onState$<number>('createTime')
            .pipe(switchMap(createTime => {
                const delta = Date.now() - createTime;
                const timeout = maxSelectTimeAlert - delta;

                if (timeout <= 0) {
                    return NEVER;
                }

                return timer(timeout);
            }))
    }

    @Inject(ClientState) private clientState: ClientState;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private _selectedItem: number;

    constructor(private container: HTMLElement) {

        const isMac = navigator.platform.toUpperCase().includes('MAC');

        this.container.innerHTML = `
            <button id="run" class="runButton toolbar-button" type="button">
              <div class="run-icon"></div>
              <small>(${isMac ? 'Cmd⌘' : 'Ctrl'} + Enter)</small>
            </button>
            <div class="select-window">
                <button id="select-1" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                <button id="select-2" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                <button id="select-3" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                <button id="select-4" class="toolbar-button select-button" type="button">
                    <div class="unit-img character_null"></div>
                </button>
                
                <div class="select-view">
                    ${this.charactersList.types.slice(1).map(characterConfig => {
                        return `
                            <section class="unit">
                                <div class="unit-img ${characterConfig.key}"></div>
                                <div class="unit-description">
                                    <div class="unit-id">
                                        ${characterConfig.id}
                                        <span class="unit-type ${characterConfig.type}">${this.getCharacterType(characterConfig)}</span>
                                        <br>
                                        <span class="unit-grey">${characterConfig.title}</span>
                                    </div>
                                    <div class="unit-values">
                                        <div class="unit-grey">атака / защита</div>
                                        <div class="unit-mellee"><span class="unit-grey">ближний</span> ${characterConfig.mellee.attack.max} / ${characterConfig.mellee.defence.max}</div>
                                        <div class="unit-shooting"><span class="unit-grey">стрельба</span> ${characterConfig.shoot.attack.max} / ${characterConfig.shoot.defence.max}</div>
                                        <div class="unit-magic"><span class="unit-grey">магия</span> ${characterConfig.magic.attack.max} / ${characterConfig.magic.defence.max}</div>
                                        <div class="unit-speed"><span class="unit-grey">скорость</span> ${characterConfig.speed}</div>
                                    </div>
                                  
                                </div>
                            </section>
                        `;
                    }).join('')}
                </div>
            </div>
            <button id="push" class="runButton toolbar-button" type="button">
              <div>
                <img src="/img/push.svg" alt="" height="40" style="margin-bottom: -5px">
              </div>
              Готово!
            </button>
            <button id="help" class="runButton toolbar-button" type="button">
              <div class="help-icon">
                ?
              </div>
              Помощь
            </button>
            
            <div id="documentation" class="documentation"></div>
        `;

        this.selectClick$
            .subscribe(event => {
                const itemIndex = this.buttons.indexOf(event.currentTarget as HTMLButtonElement);

                if (itemIndex === this.selectedItem) {
                    this.isSelectorOpen = false;
                } else {
                    this.isSelectorOpen = true;

                    this.selectedItem = itemIndex;
                }
            });

        this.chooseUnitClick$
            .pipe(takeUntil(this.stopSelectUnit$))
            .subscribe((characterConfig) => {
                const {army} = this.clientState;

                army[this.selectedItem] = characterConfig.key;

                this.clientState.set({army: army});

                this.isSelectorOpen = false;
            });

        combineLatest(this.stopSelectUnit$, this.chooseUnitClick$)
            .pipe(
                tap(() => {
                    this.isSelectorOpen = false;
                }),
                switchMap(() =>
                    this.promptService.alert('Время вышло', 'Время на выбор юнитов закончилось')
                )
            )
            .subscribe();

        this.selectUnitAlert$
            .pipe(
                filter(() => {
                    const {army} = this.clientState;
                    const keys = Object.keys(army);

                    return keys.some(key => army[key] === 'character_null');
                }),
                switchMap(() =>
                    this.promptService.alert('Время почти вышло', 'Осталась ровно минута до отключения возможности выбирать юнитов')
                )
            )
            .subscribe();


        merge(
            this.onEscape$,
            this.outsideSelectorClick$
        )
            .subscribe(() => {
                this.isSelectorOpen = false;
            });

        merge(
            this.connection.onState$(this.clientState.side),
            this.clientState.change$
        )
            .pipe(filter(state => state.army))
            .subscribe(state => {
                this.buttons.forEach((button, index) => {
                    const type = state.army[index];
                    const icon = button.querySelector('.unit-img');

                    icon.className = `unit-img ${type}`;
                })
            });

        render((<Documentation open$={this.helpButtonClick$} />), this.container.querySelector('#documentation'));

    }

    private getCharacterType(config: ICharacterConfig): string {
        switch (config.type) {
            case CharacterType.magic:
                return 'Маг';
            case CharacterType.shooting:
                return 'Стрелок';
            case CharacterType.melee:
                return 'Пехотинец';
        }
    }
}