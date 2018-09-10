import {Component, h} from 'preact';
import {Subject, timer} from 'rxjs/index';
import {takeUntil} from 'rxjs/internal/operators';

interface IComponentState {
    time: number;
}

interface IProps {
    startTime: number;
    endTime: number;
}

export class RoomTimer extends Component<IProps, IComponentState> {

    state: IComponentState = {
        time: 0
    };

    private timer$ = timer(0, 1000);
    private unmount$ = new Subject();

    componentDidMount() {
        this.timer$
            .pipe(takeUntil(this.unmount$))
            .subscribe(() => {
                this.setState({
                    time: this.getEndTime() - this.props.startTime
                });
            });
    }

    componentWillUnmount() {
        this.unmount$.next();
    }

    render(props: IProps, state: IComponentState) {
        let timerClass = 'color-green';

        if (state.time > (1000 * 60 * 12)) {
            timerClass = 'color-yellow';
        }

        if (state.time > (1000 * 60 * 15)) {
            timerClass = 'color-red';
        }

        return (
            <div class={`room-timer ${timerClass}`}>
                {this.formatTime(state.time)}
            </div>
        );
    }

    private formatTime(time: number): string {
        const minutes = Math.floor(time / (1000 * 60));
        const seconds = Math.floor(time / 1000) % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private getEndTime(): number {
        return this.props.endTime || Date.now();
    }
}