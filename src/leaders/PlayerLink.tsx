import {Component, h} from 'preact';

interface IComponentState {
}

interface IProps {
    link: string;
}

export class PlayerLink extends Component<IProps, IComponentState> {

    state: IComponentState = {};

    private input: HTMLInputElement;

    render(props: IProps, state: IComponentState) {
        return (
            <div>
                <div class="mb-10">Ссылка:</div>
                <div>
                    <input type="text" class="input" readOnly={true}
                           ref={input => this.input = input}
                           onFocus={_ => this.onFocus()}
                           value={props.link}
                    />
                </div>
            </div>
        );
    }

    private onFocus() {
        this.input.select();
    }
}