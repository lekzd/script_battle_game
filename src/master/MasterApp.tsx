import {IMessage, WebsocketConnection} from '../common/WebsocketConnection';
import {Inject, setInject} from '../common/InjectDectorator';
import {LeftArmy} from "../left/LeftArmy";
import {EMPTY_ARMY} from "../common/client/EMPTY_ARMY";
import {RightArmy} from "../right/RightArmy";
import {IState} from '../common/state.model';
import {catchError, filter, first, map, switchMap} from 'rxjs/internal/operators';
import {RoomService} from "../common/RoomService";
import {ApiService} from '../common/ApiService';
import {PromptService} from '../leaders/PromptService';
import {Environment} from '../common/Environment';
import {render, h} from 'preact';
import {MasterScreen} from './MasterScreen';

export class MasterApp {

    @Inject(ApiService) private apiService: ApiService;
    @Inject(Environment) private environment: Environment;
    @Inject(RoomService) private roomService: RoomService;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {
        this.connection.registerAsMaster(this.roomService.roomId);

        setInject(LeftArmy, Object.assign({}, EMPTY_ARMY));
        setInject(RightArmy, Object.assign({}, EMPTY_ARMY));

        this.connection.onMessage$.subscribe(message => {
            this.onMessage(message)
        });

        this.connection.onClose$.subscribe(() => {
            const {roomId} = this.roomService;

            this.apiService.getRoom(roomId)
                .pipe(
                    map(() => false),
                    catchError(() => [true]),
                    filter(response => response),
                    switchMap(() => this.promptService.alert('Ошибка', 'Данная комната больше не существует'))
                )
                .subscribe(() => {
                    location.href = this.environment.config.baseUrl;
                });
        });

        this.connection.onState$<IState>()
            .pipe(first())
            .subscribe(state => {
                render((
                    <MasterScreen state={state} />
                ), document.querySelector('.master'));
            });
    }

    private onMessage(message: IMessage) {
        if (message.type === 'newSession') {
            location.reload();
        }
    }

}