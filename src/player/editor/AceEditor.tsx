// https://github.com/ajaxorg/ace-builds/issues/129
import * as ace from "brace";

import "brace/mode/javascript";
import "brace/theme/monokai"
import "brace/ext/language_tools"

import {Component, h} from "preact";
import {SandboxAutocomplete} from "./SandboxAutocomplete";
import {Editor} from "brace";
import {fromEvent, merge, Observable} from "rxjs";
import {auditTime, filter} from "rxjs/operators";
import {map, tap} from "rxjs/internal/operators";

export interface IPointer {
    x: number;
    y: number;
}

interface IComponentState {
}

interface IProps {
    onScroll: (pointer: IPointer) => any;
    onChange: (value: string) => any;
    onCtrlEnter: () => any;
}

export class AceEditor extends Component<IProps, IComponentState> {

    get ctrlEnter$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                filter(e => this.isWindowsCtrlEnter(e) || this.isUnixCtrlEnter(e) || this.isCtrlS(e)),
                tap(e => e.preventDefault())
            );
    }

    get editorScroll$(): Observable<IPointer> {
        return merge(
            fromEvent(this.editor.session as any, 'changeScrollLeft'),
            fromEvent(this.editor.session as any, 'changeScrollTop')
        )
            .pipe(map(() => ({
                x: this.editor.session.getScrollLeft(),
                y: this.editor.session.getScrollTop()
            })))
            .pipe(auditTime(300));
    }

    get change$(): Observable<string> {
        return fromEvent(this.editor, 'change')
            .pipe(map(() => this.editor.getValue()))
            .pipe(auditTime(300));
    }

    private editor: Editor;

    componentDidMount() {
        this.change$.subscribe(value => {
            this.props.onChange(value);
        });
    
        this.editorScroll$.subscribe(value => {
            this.props.onScroll(value);
        });
    
        this.ctrlEnter$.subscribe(() => {
            this.props.onCtrlEnter();
        });
    }

    getValue(): string {
        return this.editor.getValue();
    }

    setValue(value: string) {
        this.editor.setValue(value);
    }

    shouldComponentUpdate(): boolean {
        return false;
    }

    render(props: IProps, state: IComponentState) {
        return (
            <div id="editor" ref={ref => this.initEditor(ref)} />
        )
    }

    private initEditor(container: HTMLElement) {
        const langTools = ace.acequire("ace/ext/language_tools");
        this.editor = ace.edit(container);

        this.editor.session.setMode('ace/mode/javascript');
        this.editor.setTheme('ace/theme/monokai');

        this.editor.setOptions({
            fontSize: 18,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });

        langTools.addCompleter(new SandboxAutocomplete());
    }

    private isWindowsCtrlEnter(event: KeyboardEvent): boolean {
        return event.keyCode === 10 && event.ctrlKey;
    }

    private isUnixCtrlEnter(event: KeyboardEvent): boolean {
        return event.keyCode === 13 && (event.ctrlKey || event.metaKey);
    }

    private isCtrlS(event: KeyboardEvent): boolean {
        return event.keyCode === 83 && (event.ctrlKey || event.metaKey);
    }

}