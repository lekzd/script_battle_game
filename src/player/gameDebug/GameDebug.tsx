import {Component, h} from 'preact';
import {filter, first} from "rxjs/internal/operators";
import {RoomTimer} from "../../common/roomTimer/RoomTimer";
import {WebsocketConnection} from "../../common/WebsocketConnection";
import {Inject} from "../../common/InjectDectorator";
import {ClientDisplay} from "../../common/client/ClientDisplay";
import {BattleSide} from "../../common/battle/BattleSide";
import {BattleGameScreen} from "../../common/battle/BattleGameScreen";
import {BattleConsole} from "../../common/console/BattleConsole";
import {IState} from "../../common/state.model";
import { Observable } from 'rxjs/internal/Observable';
import {Subject} from 'rxjs/index';
import {BattleState} from '../../common/battle/BattleState.model';

interface IComponentState {
    createTime: number
}

interface IProps {
    state: Partial<IState>;
    runCode$: Observable<[string, string]>;
}

export class GameDebug extends Component<IProps, IComponentState> {

    state: IComponentState = {
        createTime: null
    };

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    private setState$ = new Subject<BattleState>();

    componentDidMount() {
        this.connection.onState$<number>('createTime')
            .pipe(
                filter(createTime => !!createTime),
                first()
            )
            .subscribe(createTime => {
                this.setState({createTime});
            });
    }

    render(props: IProps, state: IComponentState) {
        return (
            <div class="rightSide">
                <div class="clients-display">

                    <ClientDisplay side={BattleSide.left} playerState={props.state.left} />
                    <ClientDisplay side={BattleSide.right} playerState={props.state.right} />

                    <RoomTimer startTime={this.props.state.createTime} endTime={null} />
                </div>
                <BattleGameScreen setState$={this.setState$} runCode$={this.props.runCode$} />
                <BattleConsole />
            </div>
        );
    }

}