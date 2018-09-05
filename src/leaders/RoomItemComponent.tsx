import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {fromEvent, Subject} from "rxjs";
import {switchMap} from "rxjs/operators";
import {Environment} from "../common/Environment";
import {Component, h} from "preact";

interface IComponentState {
    name: string
}

export class RoomItemComponent extends Component<any, IComponentState> {
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
    }

    render(props, state: Partial<IComponentState>) {
        return (
            <div class="room-item">
                <div>Имя: {props.name}</div>
                <div><a href={this.leftLink} target="_blank">Левый</a></div>
                <div><a href={this.rightLink} target="_blank">Правый</a></div>
                <div><a href={this.masterLink} target="_blank">Мастер</a></div>

                <button class="sample-button" onClick={this.removeRoom}>Удалить</button>
            </div>
        )
    }

    removeRoom = () => {
        this.apiService.deleteRoom(this.props.name)
            .subscribe(() => {
                this.props.update$.next();
            });
    }

    // afterRender() {
    //     fromEvent(this.querySelector('#remove'), 'click')
    //         .pipe(
    //             switchMap(() => this.apiService.deleteRoom(this.state.name))
    //         )
    //         .subscribe(() => {
    //             this.removed$.next();
    //         });
    // }
}

customElements.define('room-item', RoomItemComponent);