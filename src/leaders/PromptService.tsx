import {Observable, Subject} from 'rxjs/index';
import {render, h} from 'preact';
import {PromptModal} from './PromptModal';

export class PromptService {

    prompt(title: string): Observable<{title: string}> {
        const onSubmit$ = new Subject<{title: string}>();
        const modalContainer = document.querySelector('.modals');
        const template = (<input name="title" type="text" required/>);

        modalContainer.innerHTML = '';

        render((
            <div>
                <PromptModal {...{title, template, onSubmit$}} />
            </div>
        ), modalContainer);

        return onSubmit$.asObservable();
    }

    alert(title: string, text: string): Observable<{}> {
        const onSubmit$ = new Subject<{title: string}>();
        const modalContainer = document.querySelector('.modals');
        const template = (<div>{text}</div>);

        modalContainer.innerHTML = '';

        render((
            <div>
                <PromptModal {...{title, template, onSubmit$}} />
            </div>
        ), modalContainer);

        return onSubmit$.asObservable();
    }

    goToMaster(): Observable<{}> {
        const onSubmit$ = new Subject<{title: string}>();
        const modalContainer = document.querySelector('.modals');
        const title = 'Понеслась!';
        const template = 'Кажмите Ок, чтобы перейти к бою';

        modalContainer.innerHTML = '';

        render((
            <div>
                <PromptModal {...{title, template, onSubmit$}} />
            </div>
        ), modalContainer);

        return onSubmit$.asObservable();
    }

}