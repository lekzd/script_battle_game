// https://github.com/ajaxorg/ace-builds/issues/129
import * as ace from "brace";

import "brace/mode/javascript";
import "brace/theme/monokai"
import "brace/ext/language_tools"

import {fromEvent, merge, NEVER, Observable, of, Subject} from 'rxjs/index';
import {auditTime, filter} from "rxjs/operators";
import {SandboxAutocomplete} from './SandboxAutocomplete';
import {Editor} from 'brace';
import {debounceTime, first, map, switchMap, tap} from 'rxjs/internal/operators';
import {Toolbar} from "./Toolbar";
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';
import {ClientState} from '../client/ClientState';
import {BattleSide} from '../battle/BattleSide';
import {CharactersList} from '../characters/CharactersList';
import {IPlayerState, IState} from '../state.model';
import {ConsoleService} from "../console/ConsoleService";
import {RoomService} from "../RoomService";

interface IPointer {
    x: number;
    y: number;
}

export class EditorComponent {

    runCode$ = new Subject<string>();
    pushCode$ = new Subject<string>();

    toolbar: Toolbar;

    @Inject(ClientState) private clientState: ClientState;
    @Inject(RoomService) private roomService: RoomService;
    @Inject(ConsoleService) private consoleService: ConsoleService;
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

    get nameInput(): HTMLInputElement {
        return document.querySelector('#nickname');
    }

    get loginInput$(): Observable<string> {
        return fromEvent(this.nameInput, 'input')
            .pipe(
                debounceTime(300),
                switchMap(event => [(event.target as HTMLInputElement).value])
            )
    }

    get sampleClick$(): Observable<Event> {
        return fromEvent(document.querySelector('#sample'), 'click')
    }

    get editorScroll$(): Observable<IPointer> {
        return merge(
            fromEvent(<any>this.editor.session, 'changeScrollLeft'),
            fromEvent(<any>this.editor.session, 'changeScrollTop')
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

    constructor() {
        this.initEditor();

        this.toolbar = new Toolbar(document.querySelector('.toolbar'));

        merge(this.toolbar.runButtonClick$, this.ctrlEnter$)
            .subscribe(() => {
                this.runCode$.next(this.editor.getValue());
            });

        this.toolbar.pushButtonClick$
            .pipe(switchMap(response => {
                if (this.clientState.name) {
                    return of(response);
                }

                this.consoleService.serviceLog('Не забудьте вписать имя!');

                return NEVER;
            }))
            .subscribe(() => {
                this.consoleService.infoLog('Кажется, вы готовы к битве! Но код еще можно редактировать =)');
                this.pushCode$.next(this.editor.getValue());
            });

        this.loginInput$
            .subscribe(value => {
                const newState = <IState>{
                    left: {},
                    right: {}
                };

                if (this.clientState.side === BattleSide.left) {
                    newState.left.name = value;
                } else {
                    newState.right.name = value;
                }

                this.connection.sendState(newState, this.roomService.roomId);
            });

        this.sampleClick$
            .subscribe(() => {
                this.generateSampleCode();
            });

        this.connection.onState$<IPlayerState>(this.clientState.side)
            .pipe(first())
            .subscribe(state => {
                this.nameInput.value = state.name || '';

                if (state.editor && state.editor.code) {
                    this.editor.setValue(state.editor.code);
                }
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

        langTools.addCompleter(new SandboxAutocomplete());
    }

    private generateSampleCode() {
        let sampleCode = ``;

        this.getUniqueIdList()
            .forEach(id => {
                sampleCode += `// проверка юнита по ID\n` +
                              `if (is('${id}')) {\n` +
                              `    // действие\n` +
                              `   say('Привет, я ${id}!')\n` +
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