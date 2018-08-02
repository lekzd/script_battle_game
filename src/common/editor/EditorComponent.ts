// https://github.com/ajaxorg/ace-builds/issues/129
import Ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/theme-monokai"
import {Subject} from 'rxjs/index';

export class EditorComponent {

    runCode$ = new Subject<string>();

    private editor: any;
    private runButton: HTMLButtonElement;

    constructor() {
        this.editor = Ace.edit('editor', {
            fontSize: 18,
            theme: 'ace/theme/monokai'
        });

        this.editor.session.setMode('ace/mode/javascript');

        this.runButton = <HTMLButtonElement>document.getElementById('run');

        this.runButton.addEventListener('click', () => {
            this.runCode$.next(this.editor.getValue());
        })
    }


}