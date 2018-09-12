import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {Observable} from 'rxjs/index';
import {filter, map} from 'rxjs/internal/operators';

export class AdminApp {

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
                </div>
            ), document.querySelector('.leaders'));
        });
    }
}