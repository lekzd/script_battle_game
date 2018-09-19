import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';
import {LeadersGridComponent} from './LeadersGridComponent';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject} from '../common/InjectDectorator';
import {PromptService} from "./PromptService";

export class IndexApp {
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {
        this.connection.registerAsGuest();

        render((
            <div>
                <h2 class="color-white mb-20 text-center">Комнаты</h2>
                <RoomListComponent isAdmin={false} />

                <h2 class="color-white mb-20 text-center">Список лидеров</h2>
                <LeadersGridComponent />

                <button class="sample-button" onClick={() => this.loginWindow()}>Login</button>
            </div>
        ), document.querySelector('.leaders'));
    }

    loginWindow(): any {
        this.promptService.loginModal().subscribe(data => {
            console.log(data);
        });
    }
}