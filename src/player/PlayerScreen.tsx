import {Component, h} from 'preact';
import {EditorComponent} from "./editor/EditorComponent";
import {Toolbar} from "./toolbar/Toolbar";
import {GameDebug} from "./gameDebug/GameDebug";
import {IPlayerState, IState} from "../common/state.model";
import {BattleSide} from "../common/battle/BattleSide";
import {Inject} from "../common/InjectDectorator";
import {WebsocketConnection} from "../common/WebsocketConnection";
import {Observable, Subject} from 'rxjs';
import {ClientState} from '../common/client/ClientState';
import {PromptService} from '../admin/PromptService';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {ConsoleService} from '../common/console/ConsoleService';
import {BattleState} from "../common/battle/BattleState.model";
import {RoomService} from "../common/RoomService";
import {Environment} from "../common/Environment";

interface IComponentState {
    playerState: Partial<IPlayerState>;
    state: Partial<IState>;
}

interface IProps {
    state: IState;
    side: BattleSide;
}

export class PlayerScreen extends Component<IProps, IComponentState> {

    @Inject(ClientState) private clientState: ClientState;
    @Inject(RoomService) private roomService: RoomService;
    @Inject(Environment) private environment: Environment;
    @Inject(PromptService) private promptService: PromptService;
    @Inject(ConsoleService) private consoleService: ConsoleService;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    runCode$ = new Subject<[string, string]>();
    pushCode$ = new Subject<string>();

    state: IComponentState = {
        playerState: this.props.state[this.props.side] || {},
        state: this.props.state
    };

    get bothIsReady$(): Observable<boolean> {
        return this.connection.onState$<BattleState>('mode')
            .pipe(
                map(mode => mode === BattleState.ready || mode === BattleState.results),
                filter(result => result)
            );
    }

    componentDidMount() {
        this.connection.onState$<IState>()
            .subscribe(state => {
                const playerState = state[this.props.side];

                this.setState({
                    playerState,
                    state
                });
            });

        this.pushCode$
            .pipe(
                filter(() => !this.clientState.name),
                switchMap(() => this.promptService.prompt('Впишите свое имя')),
                tap(({title}) => this.clientState.set({name: title}))
            ).subscribe();
        
        this.pushCode$
            .pipe(
                filter(() => !!this.clientState.name)
            )
            .subscribe(() => {
                this.consoleService.infoLog('Кажется, вы готовы к битве! Но код еще можно редактировать =)');
                
                this.clientState.set({isReady: true});
            });

        this.bothIsReady$
            .pipe(
                switchMap(() => this.promptService.goToMaster())
            )
            .subscribe(() => {
                const {roomId} = this.roomService;
                const {baseUrl} = this.environment.config;

                // location.href = `${baseUrl}/master/#room=${roomId}`;
            });
    }

    render(props: IProps, state: IComponentState) {
        return (
            <div class={`player ${this.props.side}`}>
                <EditorComponent playerState={state.playerState} 
                                 onRunCode={code => this.onRunCode(code)} 
                                 />
                <Toolbar playerState={state.playerState}
                         onRunCode={() => this.onRunCode(this.clientState.editor.code)}
                         onSetReady={() => this.pushCode$.next()} />
                <GameDebug state={state.state} runCode$={this.runCode$} />
            </div>
        );
    }

    onRunCode(code: string) {
        if (this.props.side === BattleSide.left) {
            this.runCode$.next([code, ''])
        } else {
            this.runCode$.next(['', code])
        }
    }

}