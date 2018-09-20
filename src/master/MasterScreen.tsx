import {Component, h} from 'preact';
import {Inject, setInject} from '../common/InjectDectorator';
import {WebsocketConnection} from '../common/WebsocketConnection';
import {BattleSide} from '../common/battle/BattleSide';
import {Subject, timer} from 'rxjs/index';
import {ClientDisplay} from '../common/client/ClientDisplay';
import {RoomTimer} from '../common/roomTimer/RoomTimer';
import {BattleGameScreen} from '../common/battle/BattleGameScreen';
import {CodeDisplay} from './CodeDisplay';
import {IState} from '../common/state.model';
import {first, map, switchMap, tap} from 'rxjs/internal/operators';
import {LeftArmy} from '../left/LeftArmy';
import {BattleState} from '../common/battle/BattleState.model';
import {Maybe} from '../common/helpers/Maybe';
import {RightArmy} from '../right/RightArmy';

interface IComponentState {
    state: IState;
}

interface IProps {
    state: IState;
}

export class MasterScreen extends Component<IProps, IComponentState> {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    state: IComponentState = {
        state: this.props.state
    };

    private stateIsReady$ = new Subject<IState>();
    private setState$ = new Subject<BattleState>();
    private runCode$ = new Subject<[string, string]>();

    componentDidMount() {
        this.connection.onState$<IState>()
            .subscribe(state => {
                this.setState({state});
            });

        this.stateIsReady$
            .pipe(
                first(),
                switchMap(state =>
                    timer(2000).pipe(map(() => state))
                ),
                tap(state => {
                    setInject(LeftArmy, state.left.army);
                    setInject(RightArmy, state.right.army);

                    this.setState$.next(BattleState.battle);
                }),
                switchMap(state =>
                    timer(1000).pipe(map(() => state))
                ),
            )
            .subscribe(state => {
                const leftCode = Maybe(state).pluck('left.editor.code').getOrElse('');
                const rightCode = Maybe(state).pluck('right.editor.code').getOrElse('');

                this.runCode$.next([leftCode, rightCode]);
            });

        this.connection.onClose$.subscribe(() => {
            this.setState$.next(BattleState.connectionClosed);
        });

        this.onRoomStateChange(this.state.state);
    }

    componentWillUpdate(props: IProps, {state}: IComponentState) {
        this.onRoomStateChange(state);
    }

    render(props: IProps, {state}: IComponentState) {
        return (
            <div class="master">
                <div class="clients-display">
                    <ClientDisplay playerState={state.left} side={BattleSide.left}/>
                    <ClientDisplay playerState={state.right} side={BattleSide.right}/>
                    <RoomTimer startTime={state.createTime} endTime={state.endTime} />
                </div>
                <BattleGameScreen setState$={this.setState$} runCode$={this.runCode$}/>

                <CodeDisplay playerState={state.left} class="leftCode" />
                <CodeDisplay playerState={state.right} class="rightCode" />
            </div>
        );
    }

    private onRoomStateChange(state: IState) {
        if (state.mode) {
            this.base.className = `master ${state.mode}`;
        }

        if (state.mode === BattleState.ready || state.mode === BattleState.results) {
            this.stateIsReady$.next(state);
        }
    }
}