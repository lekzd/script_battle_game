import {Observable, Subject} from 'rxjs';
import {render, h} from 'preact';
import {PromptModal} from './PromptModal';
import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {switchMap} from "rxjs/operators";

export class PromptService {

    @Inject(ApiService) private apiService: ApiService;

    prompt(title: string): Observable<{title: string}> {
        const onSubmit$ = new Subject<{title: string}>();
        const modalContainer = document.querySelector('.modals');
        const template = (<input class="input" name="title" type="text" required/>);

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
        // const template = 'Нажмите Ок, чтобы перейти к бою';
        const template = 'Через 3 секунды начнется бой!';

        modalContainer.innerHTML = '';

        render((
            <div>
                <PromptModal {...{title, template, onSubmit$}} />
            </div>
        ), modalContainer);

        return onSubmit$.asObservable();
    }

    loginModal(): Observable<boolean> {
        const onSubmit$ = new Subject<{username: string, password: string}>();
        const modalContainer = document.querySelector('.modals');
        const title = 'Требуется авторизация';
        const template = (
            <div class="login">
                <div className="mb-20 flex-row">
                    <label class="login-label" for="username">Логин</label>
                    <input class="input login-field" autocomplete="off" type="text" name="username" id="username" required/>
                </div>
                <div className="mb-20 flex-row">
                    <label class="login-label" for="password">Пароль</label>
                    <input class="input login-field" type="password" name="password" id="password" required/>
                </div>
            </div>
        );

        modalContainer.innerHTML = '';

        render((
            <div>
                <PromptModal {...{title, template, onSubmit$}} />
            </div>
        ), modalContainer);

        return onSubmit$.asObservable()
            .pipe(switchMap(({username, password}) => this.apiService.login(username, password)))
    }

}