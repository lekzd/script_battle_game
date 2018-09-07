import {Observable, Subject} from 'rxjs/index';
import {render, h} from 'preact';
import {PromptModal} from './PromptModal';

export class PromptService {

    show(title: string): Observable<string> {
        const onSubmit$ = new Subject<string>();
        const modalContainer = document.querySelector('.modals');

        modalContainer.innerHTML = '';

        render((
            <div>
                <PromptModal {...{title, onSubmit$}} />
            </div>
        ), modalContainer);

        return onSubmit$.asObservable();
    }

}