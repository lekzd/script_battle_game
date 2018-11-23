import {Component, h} from 'preact';
import {Inject} from "../../common/InjectDectorator";
import {CharactersList, ICharacterConfig} from "../../common/characters/CharactersList";
import {UnitItem} from "./UnitItem";
import {IArmyState} from "../../common/state.model";
import {ClientState} from "../../common/client/ClientState";
import {PromptService} from "../../admin/PromptService";
import {combineLatest, fromEvent, merge, Observable, Subject, timer} from "rxjs";
import {filter, map, tap} from "rxjs/internal/operators";
import {elementHasParent} from "../../common/helpers/elementHasParent";
import { EMPTY_ARMY } from '../../common/client/EMPTY_ARMY';
import {first, switchMap} from "rxjs/internal/operators";
import {WebsocketConnection} from "../../common/WebsocketConnection";
import {takeUntil} from "rxjs/internal/operators";

interface IComponentState {
    opened: boolean;
    selectIndex: string;
    army: IArmyState;
}

interface IProps {
    army: IArmyState;
}

const maxSelectTime = 1000 * 60 * 13;
const maxSelectTimeAlert = 1000 * 60 * 12;

export class SelectWindow extends Component<IProps, IComponentState> {

    state: IComponentState = {
        opened: false,
        selectIndex: null,
        army: this.props.army || EMPTY_ARMY
    };

    @Inject(ClientState) private clientState: ClientState;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private chooseUnitClick$ = new Subject<ICharacterConfig>();

    get onEscape$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(
                filter(() => this.state.opened),
                filter(event => event.keyCode === 27),
                tap(event => {
                    event.preventDefault();
                })
            )
    }

    get outsideSelectorClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(window, 'click')
            .pipe(
                filter(() => this.state.opened),
                filter(event => !elementHasParent((event.target as HTMLElement), this.base)),
                tap(event => {
                    event.preventDefault();
                })
            )
    }

    get stopSelectUnit$() {
        return this.connection.onState$<number>('createTime')
            .pipe(
                first(),
                map(createTime => {
                    const delta = Date.now() - createTime;

                    return maxSelectTime - delta;
                }),
                switchMap(timeout => timer(Math.max(timeout, 0)))
            )
    }

    get selectUnitAlert$() {
        return this.connection.onState$<number>('createTime')
            .pipe(
                first(),
                map(createTime => {
                    const delta = Date.now() - createTime;

                    return maxSelectTimeAlert - delta;
                }),
                filter(timeout => timeout > 0),
                switchMap(timeout => timer(timeout))
            )
    }

    componentDidMount() {
        merge(this.onEscape$, this.outsideSelectorClick$)
            .subscribe(() => {
                this.setState({
                    selectIndex: null,
                    opened: false
                });
            });

        this.chooseUnitClick$
            .pipe(takeUntil(this.stopSelectUnit$))
            .subscribe(characterConfig => {
                this.onChooseUnit(characterConfig);
            });

        combineLatest(this.stopSelectUnit$, this.chooseUnitClick$)
            .pipe(
                tap(() => {
                    this.setState({
                        selectIndex: null,
                        opened: false
                    });
                }),
                switchMap(() =>
                    this.promptService.alert('Too late', 'Time to choose unit is ends')
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
                    this.promptService.alert('Time is almost ends', 'You have at least one minute to complete your army')
                )
            )
            .subscribe();
    }

    render(props: IProps, state: IComponentState) {
        return (
            <div class={`select-window ${state.opened ? 'opened' : ''}`}>
                {Object.keys(state.army).map(index => (
                    <button class={`toolbar-button select-button ${state.selectIndex === index ? 'selected' : ''}`}
                            type="button"
                            onClick={_=> this.onSelectClick(index)}>
                        <div class={`unit-img ${state.army[index]}`} />
                    </button>
                ))}

                <div class="select-view">
                    {this.charactersList.types.slice(1).map(characterConfig =>
                        (
                            <UnitItem characterConfig={characterConfig}
                                      onChoose={()=> this.chooseUnitClick$.next(characterConfig)}/>
                        )
                    )}
                </div>
            </div>
        );
    }

    private onChooseUnit(characterConfig: ICharacterConfig) {
        const army = Object.assign({}, this.clientState.army);

        army[this.state.selectIndex] = characterConfig.key;

        this.clientState.set({army});

        this.setState({
            selectIndex: null,
            army,
            opened: false
        });
    }

    private onSelectClick(index: string) {
        if (index && this.state.selectIndex === index) {
            index = null;
        }

        this.setState({
            selectIndex: index,
            opened: !!index
        });
    }
}