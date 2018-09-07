import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';
import {LeadersGridComponent} from './LeadersGridComponent';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';

export class LeadersApp {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {
        this.connection.registerAsGuest();

        render((
            <div>
                <RoomListComponent />
                <LeadersGridComponent />
            </div>
        ), document.querySelector('.leaders'));
    }
}