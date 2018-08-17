// https://github.com/ajaxorg/ace-builds/issues/129
import * as ace from "brace";

import "brace/mode/javascript";
import "brace/theme/monokai"
import "brace/ext/language_tools"

import {fromEvent, merge, Observable, Subject} from 'rxjs/index';
import {auditTime, filter} from "rxjs/operators";
import {SandboxAutocomplete} from './SandboxAutocomplete';
import {Editor} from 'brace';
import {debounceTime, map, switchMap} from 'rxjs/internal/operators';
import {Toolbar} from "./Toolbar";
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';
import {ClientState} from '../client/ClientState';
import {BattleSide} from '../battle/BattleSide';

export class EditorComponent {

    runCode$ = new Subject<string>();
    pushCode$ = new Subject<string>();
    change$: Observable<string>;

    toolbar: Toolbar;

    @Inject(ClientState) private clientState: ClientState;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;
    private editor: Editor;

    get ctrlEnter$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                filter(event => this.isWindowsCtrlEnter(event) || this.isUnixCtrlEnter(event))
            );
    }

    get loginInput$(): Observable<string> {
        return fromEvent(document.querySelector('#nickname'), 'input')
            .pipe(
                debounceTime(300),
                switchMap(event => [(event.target as HTMLInputElement).value])
            )
    }

    constructor() {
        this.initEditor();

        this.toolbar = new Toolbar(document.querySelector('.toolbar'));

        merge(this.toolbar.runButtonClick$, this.ctrlEnter$)
            .subscribe(() => {
                this.runCode$.next(this.editor.getValue());
            });

        this.toolbar.pushButtonClick$
            .subscribe(() => {
                this.pushCode$.next(this.editor.getValue());
            });

        this.loginInput$
            .subscribe(value => {
                if (this.clientState.side === BattleSide.left) {
                    this.connection.sendLeftState({name: value});
                } else {
                    this.connection.sendRightState({name: value});
                }
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