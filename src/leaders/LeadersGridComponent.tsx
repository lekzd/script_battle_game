import {Inject} from '../common/InjectDectorator';
import {ApiService} from '../common/ApiService';
import {IState} from '../common/state.model';
import {Component, h} from 'preact';

interface IGridState {
    items: IState[]
}

export class LeadersGridComponent extends Component<any, IGridState> {

    @Inject(ApiService) private apiService: ApiService;

    state = {
        items: []
    };

    constructor() {
        super();

        this.updateLeaders();
    }

    render(props, state: Partial<IGridState>) {
        return (
            <div class="leaders-grid">
                <table class="grid">
                    <thead>
                    <tr>
                        <td class="left">left</td>
                        <td />
                        <td />
                        <td class="right">right</td>
                    </tr>
                    </thead>

                    <tbody>
                    {state.items.map(item => (
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
                    ))}
                    </tbody>
                </table>
            </div>
        )
    }

    private updateLeaders() {
        this.apiService.getLeaderBoard()
            .subscribe(items => {
                this.setState({items});
            });
    }

    private renderUnits(army: {[key: number]: string}) {
        return Object.keys(army).map(i => {
            return (
                <div class="unit-img ${army[i]}" />
            )
        })
    }

}