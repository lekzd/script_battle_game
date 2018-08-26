import {IPlayerState} from '../state.model';
import {Inject} from '../InjectDectorator';
import {BattleSide} from '../battle/BattleSide';
import {WebsocketConnection} from '../WebsocketConnection';

const EMPTY_NAME = '--Без имени--';

export class ClientComponent {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor(private container: HTMLElement, private side: BattleSide) {
        this.update({
            isConnected: false,
            isReady: false,
            name: ''
        });

        this.connection.onState$<IPlayerState>(side)
            .subscribe(state => {
                this.update(state);
            })
    }

    render(state: Partial<IPlayerState>): string {
        let status = 'оффлайн';

        if (state.isConnected) {
            status = state.isReady ? 'готов' : 'пишет код';
        }

        return `
            <div class="client ${this.side}">
                <div class="client-connection ${state.isConnected ? 'active' : ''}"></div>
                <div class="client-status ${state.isReady ? 'ready' : 'wait'}">
                    ${status}
                </div>
                <div class="client-name">
                    ${state.name || EMPTY_NAME}
                </div>
            </div>
        `;
    }

    private update(state: Partial<IPlayerState>) {
        this.container.innerHTML = this.render(state);
    }

}