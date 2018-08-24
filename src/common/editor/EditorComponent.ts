// https://github.com/ajaxorg/ace-builds/issues/129
import * as ace from "brace";

import "brace/mode/javascript";
import "brace/theme/monokai"
import "brace/ext/language_tools"

import {fromEvent, merge, Observable, Subject} from 'rxjs/index';
import {auditTime, filter} from "rxjs/operators";
import {SandboxAutocomplete} from './SandboxAutocomplete';
import {Editor} from 'brace';
import {debounceTime, map, sample, switchMap, tap} from 'rxjs/internal/operators';
import {Toolbar} from "./Toolbar";
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';
import {ClientState} from '../client/ClientState';
import {BattleSide} from '../battle/BattleSide';
import {CharactersList} from '../characters/CharactersList';

export class EditorComponent {

    runCode$ = new Subject<string>();
    pushCode$ = new Subject<string>();
    change$: Observable<string>;

    toolbar: Toolbar;

    @Inject(ClientState) private clientState: ClientState;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;
    @Inject(CharactersList) private charactersList: CharactersList;

    private editor: Editor;

    get ctrlEnter$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(document, 'keydown')
            .pipe(
                filter(e => this.isWindowsCtrlEnter(e) || this.isUnixCtrlEnter(e) || this.isCtrlS(e)),
                tap(e => e.preventDefault())
            );
    }

    get loginInput$(): Observable<string> {
        return fromEvent(document.querySelector('#nickname'), 'input')
            .pipe(
                debounceTime(300),
                switchMap(event => [(event.target as HTMLInputElement).value])
            )
    }

    get sampleClick$(): Observable<Event> {
        return fromEvent(document.querySelector('#sample'), 'click')
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

        this.sampleClick$
            .subscribe(() => {
                this.generateSampleCode();
            })

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

    private generateSampleCode() {
        let sampleCode = ``;

        this.getUniqueIdList()
            .forEach(id => {
                sampleCode += `// проверка юнита по ID\r` +
                              `if (is('${id}')) {\r` +
                              `    // действие\r` +
                              `   say('Привет, я ${id}!')\r` +
                              `}\r`
        });

        if (sampleCode === '') {
            sampleCode = '// выберите хоть одного юнита'
        }

        this.editor.setValue(sampleCode);
    }

    getUniqueIdList(): Set<string> {
        const ids = Object.keys(this.clientState.army)
            .map(index => this.charactersList.get(this.clientState.army[index]))
            .filter(({id}) => id !== 'NULL')
            .map(({id}) => id);

        return new Set(ids);
    }
}