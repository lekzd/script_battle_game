import {Component, h} from 'preact';
import {BattleSide} from "../battle/BattleSide";
import {IPlayerState} from "../state.model";

interface IComponentState {
}

interface IProps {
    side: BattleSide;
    playerState: IPlayerState;
}

const EMPTY_NAME = '--Anonymous--';

export class ClientDisplay extends Component<IProps, IComponentState> {

    state: IComponentState = {
    };

    componentDidMount() {
    }

    render(props: IProps, state: IComponentState) {
        const playerState: Partial<IPlayerState> = props.playerState || {};
        let status = 'offline';

        if (playerState.isConnected) {
            status = playerState.isReady ? 'ready' : 'codding';
        }

        return (
            <div class={`client ${props.side}`}>
                <div class={`client-connection ${playerState.isConnected ? 'active' : ''}`} />
                <div class={`client-status ${playerState.isReady ? 'ready' : 'wait'}`}>
                    {status}
                </div>
                <div class="client-name">
                    {playerState.name || EMPTY_NAME}
                </div>
            </div>
        );
    }

}