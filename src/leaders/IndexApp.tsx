import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';
import {LeadersGridComponent} from './LeadersGridComponent';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';

export class IndexApp {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {
        this.connection.registerAsGuest();

        render((
            <div>
                <h2 class="color-white mb-20">Комнаты</h2>
                <RoomListComponent isAdmin={false} />

                <h2 class="color-white mb-20">Список лидеров</h2>
                <LeadersGridComponent />
            </div>
        ), document.querySelector('.leaders'));
    }
}