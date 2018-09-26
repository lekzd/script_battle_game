import { h, render } from 'preact';
import {RoomListComponent} from './RoomListComponent';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {Observable} from 'rxjs/index';
import {catchError, filter, map, share, switchMap} from 'rxjs/internal/operators';
import {ApiService} from '../common/ApiService';
import {PromptService} from './PromptService';

export class AdminApp {

    @Inject(ApiService) private apiService: ApiService;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    get onAdminToken$(): Observable<string> {
        return this.connection.onMessage$
            .pipe(
                filter(message => message.type === 'adminToken'),
                map(message => message.data)
            )
    }

    get isAdmin$(): Observable<boolean> {
        return this.apiService.getAuthData()
            .pipe(
                map(user => user.isAdmin),
                catchError(() => [false])
            );
    }

    constructor() {
        this.tryLoginAsAdmin();
    }

    private saveRoomsState(token: string) {
        this.apiService.saveRoomsState(token).subscribe();
    }

    private initScreen() {
        this.connection.registerAsAdmin();

        this.onAdminToken$.subscribe(adminToken => {
            render((
                <div>
                    <h2 className="color-white mb-20 text-center">Администрирование комнат</h2>
                    <div class="flex-row">
                        <div class="admin-sidebar flex-column">
                            <button class="sample-button mb-20" onClick={() => this.createRoom(adminToken)}>+ Новая комната</button>
                            <button type="button" class="green-button mb-20"
                                    onClick={_=> this.saveRoomsState(adminToken)}>Сохранить комнаты</button>
                            <button class="red-button mb-20" onClick={() => this.logout()}>⎋ Выход</button>
                        </div>

                        <div class="flex-grow">
                            <RoomListComponent isAdmin={true} adminToken={adminToken} />
                        </div>
                    </div>
                </div>
            ), document.querySelector('.admin'));
        });
    }

    private tryLoginAsAdmin() {
        const request$ = this.isAdmin$.pipe(share());

        request$
            .pipe(filter(isAdmin => isAdmin))
            .subscribe(() => {
                this.initScreen();
            });

        request$
            .pipe(
                filter(isAdmin => !isAdmin),
                switchMap(() => this.promptService.loginModal()),
                catchError(() => [false])
            )
            .subscribe(() => {
                this.tryLoginAsAdmin();
            });
    }

    private logout() {
        this.apiService.logout().subscribe(() => {
            location.reload();
        });
    }

    private createRoom(adminToken: string) {
        const id = Math.random().toString(36).substring(3);

        this.promptService.prompt('Введите название комнаты')
            .pipe(switchMap(({title}) => this.apiService.createRoom(id, title, adminToken)))
            .subscribe();
    }
}