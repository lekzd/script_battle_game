import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';
import {LeadersGridComponent} from './LeadersGridComponent';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';

export class AdminApp {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {
        this.connection.registerAsGuest();

        render((
            <div>
                <h2 className="color-white mb-20">Администрирование комнат</h2>
                <RoomListComponent isAdmin={true} />
            </div>
        ), document.querySelector('.leaders'));
    }
}