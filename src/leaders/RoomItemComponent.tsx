import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {Environment} from "../common/Environment";
import {Component, h} from "preact";
import {RoomModel} from '../../server/models/RoomModel';
import {BehaviorSubject} from 'rxjs/index';

interface IComponentState {
    name: string;
}

interface IComponentProps {
    name: string;
    room: RoomModel;
    update$: BehaviorSubject<any>;
}

export class RoomItemComponent extends Component<IComponentProps, IComponentState> {
    @Inject(ApiService) private apiService: ApiService;
    @Inject(Environment) private environment: Environment;

    render(props: IComponentProps, state) {
        // const leftIsAvailable = props.room.state.left.isReady

        return (
            <div class="room-item">
                <div class="title">Имя: {props.name}</div>

                <div class="title">Игроки:</div>

                <div class="players">
                    <div class="players-item left">
                        <div><a href={this.generateLInk('left')} target="_blank">В бой!</a></div>
                    </div>

                    <div class="players-item-versus">vs</div>

                    <div class="players-item right">
                        <div><a href={this.generateLInk('right')} target="_blank">В бой!</a></div>
                    </div>
                </div>

                <div class="title">Зрители:</div>

                <div class="watchers">
                    <div className="watchers-count">10</div>
                    <a href={this.generateLInk('master')} target="_blank">Присоединиться</a>
                </div>

                <button class="sample-button" onClick={this.removeRoom}>Удалить</button>
            </div>
        )
    }

    removeRoom = () => {
        this.apiService.deleteRoom(this.props.name)
            .subscribe(() => {
                this.props.update$.next(this.props.room);
            });
    };

    private generateLInk(role: string): string {
        return `${this.environment.config.baseUrl}/${role}#room=${this.props.name}`;
    }
}