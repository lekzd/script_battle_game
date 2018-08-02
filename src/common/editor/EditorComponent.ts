// https://github.com/ajaxorg/ace-builds/issues/129
import * as Ace from "ace-builds";
import {Subject} from 'rxjs/index';

export class EditorComponent {

    runCode$ = new Subject<string>();

    constructor() {
        console.log('Ace', Ace);
    }


}