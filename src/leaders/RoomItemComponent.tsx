import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {Environment} from "../common/Environment";
import {Component, h} from "preact";
import {RoomModel} from '../../server/models/RoomModel';
import {BehaviorSubject} from 'rxjs/index';
import {Maybe} from "../common/helpers/Maybe";

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

        return (
            <div class="room-item">
                <div class="title">Имя: {props.name}</div>

                <div class="title">Игроки:</div>

                <div class="players">
                    <div class="players-item left">
                        {this.renderClientStatus(props.room, 'left')}
                    </div>

                    <div class="players-item-versus">vs</div>

                    <div class="players-item right">
                        {this.renderClientStatus(props.room, 'right')}
                    </div>
                </div>

                <div class="title">Зрители:</div>

                <div class="watchers">
                    <div className="watchers-count">{props.room.watchersCount}</div>
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

    private renderClientStatus(room: RoomModel, side: string) {
        const isAvailable = Maybe(room).pluck(`state.${side}.isConnected`).getOrElse(false);

        if (isAvailable) {
            return (
                <div>
                    В бою
                </div>
            );
        }

        return (
            <div>
                <a href={this.generateLInk(side)} target="_blank">В бой!</a>
            </div>
        );
    }
}