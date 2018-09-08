import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {Environment} from "../common/Environment";
import {Component, h} from "preact";
import {RoomModel} from '../../server/models/RoomModel';
import {BehaviorSubject} from 'rxjs/index';
import {Maybe} from "../common/helpers/Maybe";
import {BattleState} from '../common/battle/BattleState.model';

interface IComponentState {
}

interface IComponentProps {
    isAdmin: boolean;
    name: string;
    room: RoomModel;
    update$: BehaviorSubject<any>;
}

export class RoomItemComponent extends Component<IComponentProps, IComponentState> {
    @Inject(ApiService) private apiService: ApiService;
    @Inject(Environment) private environment: Environment;

    render(props: IComponentProps, state: IComponentState) {

        const modeTitles = {
            [BattleState.results]: 'Бой окончен',
            [BattleState.ready]: 'Идет бой',
            [BattleState.wait]: 'Ожидание'
        };

        const modeTitle = modeTitles[props.room.state.mode];

        return (
            <div class={`room-item flex-column room-item-${props.room.state.mode}`}>
                <div className="flex-row mb-20">
                    <div className="room-item-status">
                        <div className="room-item-status-title mb-20">
                            {modeTitle}
                        </div>

                        <div class="title">Зрители:</div>

                        <div class="mb-20">
                            <div className="watchers-count">{props.room.watchersCount}</div>
                        </div>

                        <div class="watchers">
                            <a class="green-button" href={this.generateLInk('master')} target="_blank">Зайти</a>
                        </div>
                    </div>

                    <div className="room-item-data">
                        <div class="room-item-name">{props.room.title}</div>

                        <div class="players">
                            <div class="players-item left">
                                {this.renderClientStatus(props.room, 'left')}
                            </div>

                            <div class="players-item-versus">vs</div>

                            <div class="players-item right">
                                {this.renderClientStatus(props.room, 'right')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-auto">{this.renderRemoveRoom()}</div>
            </div>
        )
    }

    renderRemoveRoom() {
        if (!this.props.isAdmin) {
            return;
        }

        return (
            <button class="red-button" onClick={this.removeRoom}>Удалить комнату</button>
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
        const userName = Maybe(room).pluck(`state.${side}.name`).getOrElse('--Без имени--');
        const isReady = Maybe(room).pluck(`state.${side}.isReady`).getOrElse(false);
        const canJoin = Maybe(room).pluck(`state.mode`).getOrElse(null) === BattleState.wait;

        let status = 'оффлайн';
        let statusClass = 'offline';

        if (isAvailable) {
            status = 'пишет код';
            statusClass = 'wait';
        }

        if (isReady && isAvailable) {
            status = 'готов';
            statusClass = 'ready';
        }

        if (isAvailable) {
            return (
                <div class="room-item-client">
                    <div class="client-name mb-10 leaders-main">
                        {userName}
                    </div>
                    <div class={`client ${side}`}>
                        <div class="client-connection active" />
                        <div class={`client-status ${statusClass}`}>
                            {status}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div class="room-item-client">
                <div class="client-name mb-10 leaders-main">
                    {userName}
                </div>
                <div class={`client mb-20 ${side}`}>
                    <div class="client-connection " />
                    <div class={`client-status ${statusClass}`}>
                        {status}
                    </div>
                </div>
                <div>
                    {this.renderJoinButton(canJoin, side)}
                </div>
            </div>
        );
    }

    private renderJoinButton(canDisplay: boolean, side: string) {
        if (!canDisplay) {
            return;
        }

        return (
            <a class="sample-button" href={this.generateLInk(side)} target="_blank">В бой!</a>
        )
    }
}