// https://github.com/ajaxorg/ace-builds/issues/129
import Ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/theme-monokai"
import {fromEvent, merge, Observable, Subject} from 'rxjs/index';
import {filter} from "rxjs/operators";

export class EditorComponent {

    runCode$ = new Subject<string>();

    private editor: any;

    get runButtonClick$(): Observable<Event> {
        return fromEvent(document.getElementById('run'), 'click');
    }

    get ctrlEnter$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(document, 'keypress')
            .pipe(
                filter(event => this.isWindowsCtrlEnter(event) || this.isUnixCtrlEnter(event))
            );
    }

    constructor() {
        this.editor = Ace.edit('editor', {
            fontSize: 18,
            theme: 'ace/theme/monokai'
        });

        this.editor.session.setMode('ace/mode/javascript');

        merge(this.runButtonClick$, this.ctrlEnter$)
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
}