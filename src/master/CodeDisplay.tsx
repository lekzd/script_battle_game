import {Component, h} from 'preact';
import * as jsdiff from "diff";
import {IEditorState, IPlayerState} from '../common/state.model';
import {Maybe} from '../common/helpers/Maybe';
import {EMPTY_ARMY} from '../common/client/EMPTY_ARMY';

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
    private pre: HTMLPreElement;

    componentDidUpdate() {
        const editorState = Maybe(this.props.playerState).pluck('editor').getOrElse({
            scrollX: 0,
            scrollY: 0,
            code: ''
        }) as IEditorState;

        this.pre.scroll(editorState.scrollX || 0, editorState.scrollY || 0);

        if (editorState.code !== undefined) {
            this.setCode(editorState.code);
        }
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
                    <pre ref={ref => this.pre = ref}/>
                </div>
            </div>
        );
    }

    private setCode(code: string) {
        this.previous = this.current;
        this.current = code;

        const diff = jsdiff.diffChars(this.previous, this.current);
        const fragment = document.createDocumentFragment();

        let span = null;
        let color = '';

        diff.forEach((part) => {
            if (part.removed) {
                return;
            }

            const colorGrey = '#cccccc';
            const colorGreen = '#00cc00';

            color = part.added ? colorGreen : colorGrey;
            span = document.createElement('span');
            span.style.color = color;
            span.appendChild(document.createTextNode(part.value));
            fragment.appendChild(span);
        });

        this.pre.innerText = '';

        this.pre.appendChild(fragment);
    }

}