import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {fromEvent, merge, Subject} from "rxjs";
import {switchMap} from "rxjs/operators";
import "./RoomItemComponent";
import {RoomItemComponent} from "./RoomItemComponent";
import {RoomModel} from "../../server/models/RoomModel";
import {Component, h} from "preact";

interface IComponentState {
    items: {[key: string]: RoomModel}
}

export class RoomListComponent extends Component<any, IComponentState> {
    @Inject(ApiService) private apiService: ApiService;

    update$ = new Subject();

    constructor() {
        super();

        this.setState({
            items: {}
        });

        this.updateRooms();

        this.update$.subscribe(() => {
            this.updateRooms();
        });
    }

    render(props, state: IComponentState) {
        return (
            <div class="rooms-list">
                <div class="header">Комнаты:</div>

                <div class="rooms">
                    {
                        Object.keys(state.items).map(name => {
                            const room = state.items[name];

                            return (<RoomItemComponent {...{name, room, update$: this.update$}} />)
                        })
                    }
                </div>

                <button class="sample-button" onClick={this.createRoom}>Новая комната</button>
            </div>
        )
    }

    createRoom = () => {
        this.apiService.createRoom(Math.random().toString(36).substring(3))
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

// customElements.define('rooms-list', RoomListComponent);