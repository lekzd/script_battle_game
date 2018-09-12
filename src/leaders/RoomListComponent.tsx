import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {BehaviorSubject, merge, Subject} from "rxjs";
import "./RoomItemComponent";
import {RoomItemComponent} from "./RoomItemComponent";
import {RoomModel} from "../../server/models/RoomModel";
import {Component, h} from "preact";
import {debounceTime, switchMap, takeUntil} from 'rxjs/internal/operators';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {PromptService} from './PromptService';
import {BattleState} from '../common/battle/BattleState.model';

interface IComponentState {
    items: {[key: string]: RoomModel}
}

interface IProps {
    isAdmin: boolean;
    adminToken?: string;
}

interface IRoomItem {
    id: string;
    room: RoomModel;
}

export class RoomListComponent extends Component<IProps, IComponentState> {
    update$ = new BehaviorSubject([]);

    state = {
        items: {}
    };

    @Inject(ApiService) private apiService: ApiService;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private unmount$ = new Subject();

    componentDidMount() {
        merge(
            this.update$,
            this.connection.onRoomsChanged$
                .pipe(debounceTime(100))
        )
            .pipe(takeUntil(this.unmount$))
            .subscribe(() => {
                this.updateRooms();
            });
    }

    render(props: IProps, state: IComponentState) {
        const rooms = Object.keys(state.items)
            .map(id => ({id, room: state.items[id]}))
            .sort((a, b) =>
                a.room.state.createTime < b.room.state.createTime ? 1 : -1
            );

        const current = rooms.filter(({room}) => room.state.mode !== BattleState.results);
        const past = rooms.filter(({room}) => room.state.mode === BattleState.results);

        return (
            <div class="rooms-list">
                {this.renderNewRoomButton()}

                {this.renderRoomsWithHeader(current, 'Текущие бои:')}

                {this.renderRoomsWithHeader(past, 'Прошедшие бои:')}
            </div>
        )
    }

    renderNewRoomButton() {
        if (this.props.isAdmin === false) {
            return;
        }

        return (
            <button class="sample-button" onClick={this.createRoom}>Новая комната</button>
        )
    }

    renderRoomsWithHeader(items: IRoomItem[], title: string) {
        if (items.length === 0) {
            return;
        }

        return (
            <div>
                <h2 class="color-white mb-20">{title}</h2>
                <div class="rooms">
                    {this.renderRoomsList(items)}
                </div>
            </div>
        )
    }

    renderRoomsList(items: IRoomItem[]) {
        const {isAdmin, adminToken} = this.props;

        return items.map(({id, room}) => {
            return (<RoomItemComponent {...{name: id, room, isAdmin, adminToken, update$: this.update$}} />)
        })
    }

    componentWillUnmount() {
        this.unmount$.next();
    }

    createRoom = () => {
        const id = Math.random().toString(36).substring(3);

        this.promptService.prompt('Введите название комнаты')
            .pipe(switchMap(({title}) => this.apiService.createRoom(id, title, this.props.adminToken)))
            .subscribe(() => {
                this.updateRooms();
            })
    };

    private updateRooms() {
        this.apiService.getAllRooms(this.props.isAdmin)
            .subscribe(items => {
                this.setState({items});
            });
    }
}