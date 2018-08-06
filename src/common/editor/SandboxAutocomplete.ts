import * as ace from "brace";
import {getUnitApi} from '../codeSandbox/getUnitApi';

interface IAutocompleteItem {
    name: string;
    value: string;
    score: number;
    meta: string;
}

type AutocompleteCallback = (a: any, words: IAutocompleteItem[]) => void;

export class SandboxAutocomplete {

    private functionsList: IAutocompleteItem[] = [];

    constructor() {
        const functions = getUnitApi.toString().match(/(\w+\((\w+(\,\s?)?)*\))/ig);
        const unitApi = getUnitApi({}, []);

        this.functionsList = functions
            .filter(name => typeof unitApi[name.match(/^\w+/)[0]] === 'function')
            .map(name => {
                return <IAutocompleteItem> {
                    name: name.match(/^\w+/)[0],
                    value: name,
                    meta: 'api',
                    score: 10
                }
            });
    }

    getCompletions(editor: ace.Editor, session: any, pos: number, prefix: string, callback: AutocompleteCallback) {
        if (prefix.length === 0) {
            callback(null, []);

            return;
        }

        callback(null, this.functionsList.filter(item => item.value.startsWith(prefix)));
    }
}