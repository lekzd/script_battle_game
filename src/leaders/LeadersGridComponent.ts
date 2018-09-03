import {Inject} from '../common/InjectDectorator';
import {ApiService} from '../common/ApiService';
import {IState} from '../common/state.model';

interface IGridState {
    items: IState[]
}

export class LeadersGridComponent extends HTMLElement {

    @Inject(ApiService) private apiService: ApiService;

    private state: Partial<IGridState> = {};

    constructor() {
        super();

        this.updateLeaders();
    }

    private updateLeaders() {
        this.apiService.getLeaderBoard()
            .subscribe(items => {
                this.setState({items});
            });
    }

    private setState(newState: Partial<IGridState>) {
        this.state = Object.assign(this.state, newState);

        this.innerHTML = this.render(this.state);

        // this.classList.toggle('opened', this.state.isOpen);
    }

    private render(state: Partial<IGridState>): string {
        return `
            <table class="grid">
                <thead>
                    <tr>
                        <td class="left">left</td>    
                        <td></td>    
                        <td></td>    
                        <td class="right">right</td>    
                    </tr>
                </thead>
                
                <tbody>
                    ${state.items.map(item => {
                        return `
                            <tr>
                                <td>${this.renderUnits(item.left.army)}</td>
                                <td class="left ${item.winner === 'left' ? 'winner' : 'looser'}">
                                    <div>${item.left.name}</div>
                                    <div>${item.damage.left}</div>
                                </td>    
                                <td class="right ${item.winner === 'right' ? 'winner' : 'looser'}">
                                    <div>${item.right.name}</div>
                                    <div>${item.damage.right}</div>
                                </td>
                                <td>${this.renderUnits(item.right.army)}</td>
                            </tr>
                        `    
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    private renderUnits(army: {[key: number]: string}): string {
        return Object.keys(army).map(i => {
            return `
                <div class="unit-img ${army[i]}"></div>
            `
        }).join('')
    }

}

customElements.define('leaders-grid', LeadersGridComponent);