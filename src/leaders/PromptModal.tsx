import {Component, h} from 'preact';
import {Subject} from 'rxjs/index';

interface IProps {
    title: string;
    onSubmit$: Subject<string>;
}

interface IComponentState {

}

export class PromptModal extends Component<IProps, IComponentState> {
    private input: any;
    private dialog: any;

    componentDidMount() {
        this.dialog.showModal();
    }

    render(props: IProps) {
        return (
            <dialog class="modal-dialog" ref={ref => this.dialog = ref}>
                <div className="modal-dialog-content">
                    <form onSubmit={this.onSubmit}>
                        <div class="modal-dialog-row">
                            {props.title}:
                        </div>
                        <div class="modal-dialog-row">
                            <input type="text" ref={ref => this.input = ref} required/>
                        </div>
                        <div class="modal-dialog-row">
                            <button class="sample-button">Ок</button>
                        </div>
                    </form>
                </div>
            </dialog>
        )
    }

    onSubmit = (event) => {
        event.preventDefault();

        this.dialog.close();

        this.props.onSubmit$.next(this.input.value);
    }

}