import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {Observable} from 'rxjs/index';
import {filter, map} from 'rxjs/internal/operators';
import {ApiService} from '../common/ApiService';

export class AdminApp {

    @Inject(ApiService) private apiService: ApiService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    get onAdminToken$(): Observable<string> {
        return this.connection.onMessage$
            .pipe(
                filter(message => message.type === 'adminToken'),
                map(message => message.data)
            )
    }

    constructor() {
        this.connection.registerAsAdmin();

        this.onAdminToken$.subscribe(adminToken => {
            render((
                <div>
                    <h2 className="color-white mb-20 text-center">Администрирование комнат</h2>
                    <RoomListComponent isAdmin={true} adminToken={adminToken} />

                    <div>
                        <button type="button" class="green-button"
                                onClick={_=> this.saveRoomsState(adminToken)}>Сохранить текущее состояние комнат</button>
                    </div>
                </div>
            ), document.querySelector('.leaders'));
        });
    }

    private saveRoomsState(token: string) {
        this.apiService.saveRoomsState(token).subscribe();
    }
}