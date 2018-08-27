import {ConsoleService, IConsoleLine} from "./ConsoleService";
import {Inject} from "../InjectDectorator";

interface IConsoleState {
    lines: IConsoleLine[];
}

export class BattleConsole extends HTMLElement {

    @Inject(ConsoleService) private consoleService: ConsoleService;

    private state: IConsoleState = {
        lines: []
    };

    constructor() {
        super();

        this.consoleService
            .subscribe(message => {
                this.state.lines.unshift(message);

                this.innerHTML = this.render(this.state);
            });
    }

    private render(state: IConsoleState): string {
        return `
            <div class="console-lines">
                ${state.lines.map(line => `
                    <div class="line ${line.source}">
                        <div class="source">${line.source}:</div>
                        <div class="message">${line.text}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

}

customElements.define('battle-console', BattleConsole);