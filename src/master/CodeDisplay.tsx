import {Component, h} from 'preact';
import {IEditorState, IPlayerState} from '../common/state.model';
import {Maybe} from '../common/helpers/Maybe';
import {EMPTY_ARMY} from '../common/client/EMPTY_ARMY';
import {AceEditor} from "../player/editor/AceEditor";

interface IComponentState {
}

interface IProps {
    class: string;
    playerState: IPlayerState;
}

export class CodeDisplay extends Component<IProps, IComponentState> {

    state: IComponentState = {};

    private previous = '';
    private current = '';
    private editor: AceEditor;

    componentDidMount() {
        this.onStateChanged(this.props.playerState);
    }

    componentDidUpdate() {
        this.onStateChanged(this.props.playerState);
    }

    render(props: IProps, state: IComponentState) {
        const army = Maybe(props.playerState).pluck('army').getOrElse(EMPTY_ARMY);

        return (
            <div class={`codeDisplay ${props.class}`}>
                <div class="code-container">
                    <div class="army-display">
                        {Object.keys(army).map(index => {
                            const key = army[index];

                            return (
                                <div class="toolbar-button select-button">
                                    <div class={`unit-img ${key}`} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="codeDisplay-editor">
                        <AceEditor ref={ref => this.editor = ref}
                                   onChange={() => null}
                                   onCtrlEnter={() => null}
                                   onScroll={() => null}
                                   readonly={true}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private setCode(code: string) {
        this.previous = this.current;
        this.current = code;

        this.editor.setValue(code);
    }

    private onStateChanged(playerState: IPlayerState) {
        const editorState = Maybe(playerState).pluck('editor').getOrElse({
            scrollX: 0,
            scrollY: 0,
            code: ''
        }) as IEditorState;

        this.editor.scroll(editorState.scrollX || 0, editorState.scrollY || 0);

        if (editorState.code !== undefined) {
            this.setCode(editorState.code);
        }
    }
}