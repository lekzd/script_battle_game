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
        const items = state.items.sort((a, b) => {
            const first = Math.max(a.damage.left, a.damage.right);
            const second = Math.max(b.damage.left, b.damage.right);

            if (first > second) {
                return -1;
            }

            return 1;
        });

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
                    {items.map(item => (
                        <tr>
                            <td width="64">{this.renderUnits(item.left.army)}</td>
                            <td class={`left ${item.winner === 'left' ? 'winner' : 'looser'}`}>
                                <div class="leaders-main">
                                    <div>{item.left.name}</div>
                                </div>
                                <div class="leaders-points">
                                    <div>{item.damage.left}</div>
                                </div>
                            </td>
                            <td class={`right ${item.winner === 'right' ? 'winner' : 'looser'}`}>
                                <div class="leaders-main">
                                    <div>{item.right.name}</div>
                                </div>
                                <div class="leaders-points">
                                    <div>{item.damage.right}</div>
                                </div>
                            </td>
                            <td width="64">{this.renderUnits(item.right.army)}</td>
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
        return Object.keys(army).map(i => (
            <div class={`unit-img ${army[i]}`} />
        ));
    }

}