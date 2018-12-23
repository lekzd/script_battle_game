import {Subject} from 'rxjs';
import {debounceTime, first} from 'rxjs/internal/operators';
import {Component, h} from "preact";
import {AceEditor, IPointer} from "./AceEditor";
import {ClientState} from "../../common/client/ClientState";
import {Inject} from "../../common/InjectDectorator";
import {CharactersList} from "../../common/characters/CharactersList";
import {WebsocketConnection} from "../../common/WebsocketConnection";
import {IPlayerState, IEditorState} from "../../common/state.model";
import { Maybe } from '../../common/helpers/Maybe';

interface IComponentState {

}

interface IProps {
    playerState: Partial<IPlayerState>;
    onRunCode: (code: string) => any;
}

export class EditorComponent extends Component<IProps, IComponentState> {

    @Inject(ClientState) private clientState: ClientState;
    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private editor: AceEditor;
    private nameInput$ = new Subject<string>();

    componentDidMount() {
        const code = Maybe(this.props.playerState).pluck('editor.code').get();

        if (code) {
            this.editor.setValue(code);
        }

        this.nameInput$
            .pipe(
                debounceTime(300)
            )
            .subscribe(name => {
                this.clientState.set({name});
            });

        this.connection.onState$<IPlayerState>(this.clientState.side)
            .pipe(first())
            .subscribe(state => {
                if (state.editor && state.editor.code) {
                    this.editor.setValue(state.editor.code);
                }
            })
    }

    render(props: IProps, state: IComponentState) {
        return (
            <div class="editor">
                <div class="name">
                    <label for="nickname">Имя: </label>
                    <input type="text"
                           value={props.playerState.name} 
                           onInput={event => this.nameInput$.next((event.target as HTMLInputElement).value)} 
                           />
                    <button class="sample-button" onClick={_=>this.generateSampleCode()}>
                        Пример кода
                    </button>
                </div>
                <AceEditor ref={ref => this.editor = ref} 
                           onChange={value => this.onChangeCode(value)}
                           onCtrlEnter={() => this.props.onRunCode(this.editor.getValue())}
                           onScroll={data => this.onEditorScroll(data)}
                           />
            </div>
        )
    }

    private onEditorScroll(data: IPointer) {
        this.setEditorState({
            scrollX: data.x,
            scrollY: data.y
        })
    }

    private onChangeCode(value: string) {
        this.setEditorState({
            code: value
        })
    }

    private setEditorState(state: Partial<IEditorState>) {
        const newState = {
            editor: Object.assign({}, state) as IEditorState
        };

        this.clientState.set(newState);
    }

    private generateSampleCode() {
        let sampleCode = ``;

        this.getUniqueIdList()
            .forEach(id => {
                sampleCode += `// проверка юнита по ID\n` +
                              `if (is('${id}')) {\n` +
                              `    // действие\n` +
                              `    say('Привет, я ${id}!')\n` +
                              `}\n`
        });

        if (sampleCode === '') {
            sampleCode = '// выберите хоть одного юнита'
        }

        this.editor.setValue(sampleCode);
    }

    private getUniqueIdList(): Set<string> {
        const ids = Object.keys(this.clientState.army)
            .map(index => this.charactersList.get(this.clientState.army[index]))
            .filter(({id}) => id !== 'NULL')
            .map(({id}) => id);

        return new Set(ids);
    }
}