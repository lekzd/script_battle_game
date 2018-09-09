import {Component, h, RenderableProps} from 'preact';

interface IComponentState {
    opened: boolean;
}

interface IProps {
    header: string;
    opened: boolean;
}

export class AccordionSection extends Component<IProps, IComponentState> {

    state: IComponentState = {
        opened: this.props.opened
    };

    componentDidMount() {

    }

    render(props: RenderableProps<IProps>, state: IComponentState) {
        return (
            <div class={`accordion-section ${state.opened ? 'opened': ''}`}>
                <h2 class="accordion-header" onClick={e => this.onClick()}>
                    <span>{props.header}</span> <span>↕</span>
                </h2>
                <div class="accordion-content">

                    {props.children}

                </div>
            </div>
        );
    }

    private onClick() {
        this.setState({opened: !this.state.opened});
    }
}