import {Component, h} from 'preact';
import {Documentation} from "../../common/documentation/Documentation";
import {NEVER, of, Subject, timer} from "rxjs";
import {SelectWindow} from "./SelectWindow";
import {IPlayerState} from "../../common/state.model";
import {first, switchMap} from "../../../node_modules/rxjs/internal/operators";
import {Inject} from "../../common/InjectDectorator";
import {WebsocketConnection} from "../../common/WebsocketConnection";

interface IComponentState {
}

interface IProps {
    playerState: Partial<IPlayerState>;
    onSetReady: () => any;
    onRunCode: () => any;
}

export class Toolbar extends Component<IProps, IComponentState> {

    state: IComponentState = {

    };

    private helpButtonClick$ = new Subject();

    componentDidMount() {
    }

    render(props: IProps, state: IComponentState) {
        const isMac = navigator.platform.toUpperCase().includes('MAC');

        return (
            <div class="toolbar">

                <button id="run" class="runButton toolbar-button" type="button" onClick={() => this.props.onRunCode()}>
                    <div class="run-icon" />
                    <small>({isMac ? 'Cmd⌘' : 'Ctrl'} + Enter)</small>
                </button>

                <SelectWindow army={props.playerState.army} />

                <button id="push" class="runButton toolbar-button" type="button" onClick={_=> this.props.onSetReady()}>
                    <div>
                        <img src="/img/push.svg" alt="" height="40" style="margin-bottom: -5px"/>
                    </div>
                    Готово!
                </button>
                <button id="help" class="runButton toolbar-button" type="button" onClick={_=> this.helpButtonClick$.next()}>
                    <div class="help-icon">
                        ?
                    </div>
                    Помощь
                </button>

                <Documentation open$={this.helpButtonClick$} />

            </div>
        );
    }
}