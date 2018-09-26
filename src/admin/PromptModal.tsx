import {Component, h} from 'preact';
import {Subject} from 'rxjs/index';

interface IProps {
    title: string;
    template: any;
    onSubmit$: Subject<Object>;
}

interface IComponentState {

}

export class PromptModal extends Component<IProps, IComponentState> {
    private form: any;
    private dialog: any;

    componentDidMount() {
        this.dialog.showModal();
    }

    render(props: IProps) {
        return (
            <dialog class="modal-dialog" ref={ref => this.dialog = ref}>
                <div className="modal-dialog-content">
                    <form onSubmit={this.onSubmit} ref={ref => this.form = ref}>
                        <div class="modal-dialog-row">
                            {props.title}:
                        </div>
                        <div class="modal-dialog-row">
                            {props.template}
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

        const formData = new FormData(this.form);
        const object = {};

        formData.forEach(function(value, key){
            object[key] = value;
        });

        this.props.onSubmit$.next(object);
    }

}