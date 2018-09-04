import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {WebComponent} from "../common/WebComponent";
import {fromEvent, Subject} from "rxjs";
import {switchMap} from "rxjs/operators";
import {Environment} from "../common/Environment";

interface IComponentState {
    name: string
}

export class RoomItemComponent extends WebComponent<IComponentState> {
    @Inject(ApiService) private apiService: ApiService;
    @Inject(Environment) private environment: Environment;

    removed$ = new Subject();

    get leftLink(): string {
        return `${this.environment.config.baseUrl}/left#room=${this.state.name}`;
    }

    get rightLink(): string {
        return `${this.environment.config.baseUrl}/right#room=${this.state.name}`;
    }

    get masterLink(): string {
        return `${this.environment.config.baseUrl}/master#room=${this.state.name}`;
    }

    constructor() {
        super();

        this.setState({
            name: this.getAttribute('name')
        })
    }

    render(state: Partial<IComponentState>): string {
        return `
            <div>Имя: ${state.name}</div>
            <div><a href="${this.leftLink}" target="_blank">Левый</a></div>
            <div><a href="${this.rightLink}" target="_blank">Правый</a></div>
            <div><a href="${this.masterLink}" target="_blank">Мастер</a></div>
                            
            <button class="sample-button" id="remove">Удалить</button>
        `;
    }

    afterRender() {
        fromEvent(this.querySelector('#remove'), 'click')
            .pipe(
                switchMap(() => this.apiService.deleteRoom(this.state.name))
            )
            .subscribe(() => {
                this.removed$.next();
            });
    }
}

customElements.define('room-item', RoomItemComponent);