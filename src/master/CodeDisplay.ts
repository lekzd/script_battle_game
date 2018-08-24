import * as jsdiff from "diff";
import {EMPTY_ARMY} from '../common/client/EMPTY_ARMY';
import {IPlayerState} from '../common/state.model';

export class CodeDisplay {

    private previous = '';
    private current = '';
    private pre: HTMLPreElement;

    get value(): string {
        return this.current;
    }

    get units(): HTMLElement[] {
        return Array.from(this.container.querySelectorAll('.unit-img'));
    }

    set name(value: string) {
        (this.container.querySelector('.name') as HTMLElement).innerText = value;
    }

    constructor(private container: HTMLElement) {
        this.container.innerHTML = `
            <div class="name">
                --без имени--
            </div>
            <div class="code-container">
                <div class="army-display">
                    <div id="select-1" class="toolbar-button select-button">
                        <div class="unit-img character_null"></div>
                    </div>
                    <div id="select-2" class="toolbar-button select-button">
                        <div class="unit-img character_null"></div>
                    </div>
                    <div id="select-3" class="toolbar-button select-button">
                        <div class="unit-img character_null"></div>
                    </div>
                    <div id="select-4" class="toolbar-button select-button">
                        <div class="unit-img character_null"></div>
                    </div>
                </div>
                <pre></pre>
            </div>
        `;

        this.pre = this.container.querySelector('pre');
    }

    setCode(code: string) {
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

    setState(state: Partial<IPlayerState>) {
        if (state.army) {
            this.units.forEach((unit, index) => {
                const type = state.army[index];

                unit.className = `unit-img ${type}`;
            })
        }

        if (state.name) {
            this.name = state.name;
        }

        if (state.editor) {
            this.pre.scroll(state.editor.scrollX || 0, state.editor.scrollY || 0);
        }
    }

    clear() {
        this.setState({army: EMPTY_ARMY});
        this.setCode('');
    }

}