import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {WebComponent} from "../common/WebComponent";
import {fromEvent, merge} from "rxjs";
import {switchMap} from "rxjs/operators";
import "./RoomItemComponent";
import {RoomItemComponent} from "./RoomItemComponent";
import {RoomModel} from "../../server/models/RoomModel";

interface IComponentState {
    items: {[key: string]: RoomModel}
}

class RoomListComponent extends WebComponent<IComponentState> {
    @Inject(ApiService) private apiService: ApiService;

    constructor() {
        super();

        this.updateRooms();
    }

    render(state: Partial<IComponentState>): string {
        return `
            <div class="header">Комнаты:</div>
            
            <div class="rooms">
                ${this.renderList(Object.keys(state.items), name => {
                    const room = state.items[name];
                    
                    return `
                        <room-item name="${name}"></room-item>
                    `;
                })}
            </div>
            
            <button class="sample-button" id="addRoom">Новая комната</button>
        `;
    }

    afterRender() {
        fromEvent(this.querySelector('#addRoom'), 'click')
            .pipe(
                switchMap(() => this.apiService.createRoom(Math.random().toString(36).substring(3)))
            )
            .subscribe(() => {
                this.updateRooms();
            });

        const rooms = Array.from(this.querySelectorAll<RoomItemComponent>('room-item'));

        merge(...rooms.map(item => item.removed$))
            .subscribe(() => {
                this.updateRooms();
            });
    }

    private updateRooms() {
        this.apiService.getAllRooms()
            .subscribe(items => {
                this.setState({items});
            });
    }
}

customElements.define('rooms-list', RoomListComponent);