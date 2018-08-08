// https://github.com/ajaxorg/ace-builds/issues/129
import * as ace from "brace";

import "brace/mode/javascript";
import "brace/theme/monokai"
import "brace/ext/language_tools"

import {fromEvent, merge, Observable, Subject} from 'rxjs/index';
import {auditTime, filter} from "rxjs/operators";
import {SandboxAutocomplete} from './SandboxAutocomplete';
import {Editor} from 'brace';
import {map} from 'rxjs/internal/operators';
import {Toolbar} from "./Toolbar";

export class EditorComponent {

    runCode$ = new Subject<string>();
    change$: Observable<string>;

    toolbar: Toolbar;

    private editor: Editor;

    get ctrlEnter$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                filter(event => this.isWindowsCtrlEnter(event) || this.isUnixCtrlEnter(event))
            );
    }

    constructor() {
        this.initEditor();

        this.toolbar = new Toolbar(document.querySelector('.toolbar'));

        merge(this.toolbar.runButtonClick$, this.ctrlEnter$)
            .subscribe(() => {
                this.runCode$.next(this.editor.getValue());
            });

    }

    private isWindowsCtrlEnter(event: KeyboardEvent): boolean {
        return event.keyCode === 10 && event.ctrlKey;
    }

    private isUnixCtrlEnter(event: KeyboardEvent): boolean {
        return event.keyCode === 13 && (event.ctrlKey || event.metaKey);
    }

    private initEditor() {
        const langTools = ace.acequire("ace/ext/language_tools");
        this.editor = ace.edit('editor');

        this.editor.session.setMode('ace/mode/javascript');
        this.editor.setTheme('ace/theme/monokai');

        this.editor.setOptions({
            fontSize: 18,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });

        this.change$ = fromEvent(this.editor, 'change')
            .pipe(map(() => this.editor.getValue()))
            .pipe(auditTime(300));

        langTools.addCompleter(new SandboxAutocomplete());
    }
}