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

interface IComponentState {
    items: {[key: string]: RoomModel}
}

interface IProps {
    isAdmin: boolean;
}

export class RoomListComponent extends Component<IProps, IComponentState> {
    update$ = new BehaviorSubject([]);

    @Inject(ApiService) private apiService: ApiService;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private unmount$ = new Subject();

    constructor() {
        super();

        this.setState({
            items: {}
        });

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
        return (
            <div class="rooms-list">
                <div class="rooms">
                    {this.renderRoomsList()}
                </div>

                {this.renderNewRoomButton()}
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

    renderRoomsList() {
        const {items} = this.state;
        const {isAdmin} = this.props;

        return Object.keys(items).map(name => {
            const room = items[name];

            return (<RoomItemComponent {...{name, room, isAdmin, update$: this.update$}} />)
        })
    }

    componentWillUnmount() {
        this.unmount$.next();
    }

    createRoom = () => {
        const id = Math.random().toString(36).substring(3);

        this.promptService.prompt('Введите название комнаты')
            .pipe(switchMap(({title}) => this.apiService.createRoom(id, title)))
            .subscribe(() => {
                this.updateRooms();
            })
    };

    private updateRooms() {
        this.apiService.getAllRooms()
            .subscribe(items => {
                this.setState({items});
            });
    }
}