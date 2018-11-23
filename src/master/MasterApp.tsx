import {IMessage, WebsocketConnection} from '../common/WebsocketConnection';
import {Inject, setInject} from '../common/InjectDectorator';
import {LeftArmy} from "../left/LeftArmy";
import {EMPTY_ARMY} from "../common/client/EMPTY_ARMY";
import {RightArmy} from "../right/RightArmy";
import {IState} from '../common/state.model';
import {catchError, filter, first, map, switchMap} from 'rxjs/internal/operators';
import {RoomService} from "../common/RoomService";
import {ApiService} from '../common/ApiService';
import {PromptService} from '../admin/PromptService';
import {Environment} from '../common/Environment';
import {render, h} from 'preact';
import {MasterScreen} from './MasterScreen';
import {Observable} from 'rxjs/index';

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
            this.checkRoomExistenceAndShowError('Current room is not exists yet');
        });

        this.connection.onState$<IState>()
            .pipe(first())
            .subscribe(state => {
                render((
                    <MasterScreen state={state} />
                ), document.querySelector('.master'));
            });

        this.checkRoomExistenceAndShowError('Current room is not exists yet');
    }

    private onMessage(message: IMessage) {
        if (message.type === 'newSession') {
            location.reload();
        }
    }

    private checkRoomExistenceAndShowError(errorMessage: string) {
        this.checkRoomExistence()
            .pipe(
                filter(response => !response),
                switchMap(() => this.promptService.alert('Error', errorMessage))
            )
            .subscribe(() => {
                location.href = this.environment.config.baseUrl;
            });
    }

    private checkRoomExistence(): Observable<boolean> {
        const {roomId} = this.roomService;

        return this.apiService.getRoom(roomId)
            .pipe(
                map(() => true),
                catchError(() => [false])
            );
    }

}