import {Component, h} from 'preact';

interface IProps {
    place: number;
}

export class Wreath extends Component<IProps> {

    render(props: IProps) {
        return (
            <div class={`wreath ${this.getPlaceClass(props.place)}`}>
                <div class="wreath-content">
                    {props.place}
                </div>
                <div class="wreath-bg" />
            </div>
        )
    }

    private getPlaceClass(place: number): string {
        switch (place) {
            case 1:
                return 'wreath-gold';
            case 2:
                return 'wreath-silver';
            case 3:
                return 'wreath-bronze';
            default:
                return 'wreath-other';
        }
    }

}