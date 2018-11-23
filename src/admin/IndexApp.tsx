import { h, render } from 'preact';
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
                <h2 class="color-white mb-20 text-center">Rooms</h2>
                <RoomListComponent isAdmin={false} />

                <h2 class="color-white mb-20 text-center">Leaders board</h2>
                <LeadersGridComponent />
            </div>
        ), document.querySelector('.leaders'));
    }
}