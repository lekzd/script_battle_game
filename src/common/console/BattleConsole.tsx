import {ConsoleService, IConsoleLine} from "./ConsoleService";
import {Inject} from "../InjectDectorator";
import {Component, h} from 'preact';

interface IConsoleState {
    lines: IConsoleLine[];
}

interface IProps {
}

export class BattleConsole extends Component<IProps, IConsoleState> {

    @Inject(ConsoleService) private consoleService: ConsoleService;

    state: IConsoleState = {
        lines: []
    };

    componentDidMount() {
        this.consoleService
            .subscribe(message => {
                this.setState({
                    lines: [message, ...this.state.lines]
                });
            });
    }

    render(props: IProps, state: IConsoleState) {
        return (
            <div class="battle-console">
                <div class="console-lines">
                    {state.lines.map(line => (
                        <div class={`line ${line.source}`}>
                            <div class="source">{line.source}:</div>
                            <div class="message">{line.text}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

}