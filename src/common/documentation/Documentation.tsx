import {Component, h} from 'preact';
import {AccordionSection} from './AccordionSection';
import {BasicFAQ} from './BasicFAQ';
import {filter} from 'rxjs/internal/operators';
import {fromEvent, merge, Observable, Subject} from 'rxjs/index';
import {BasicJS} from './BasicJS';
import {FirstSteps} from './FirstSteps';
import {UnitApi} from './UnitApi';
import {UsefulTips} from './UsefulTips';
import {HowCodeWorks} from './HowCodeWorks';

interface IComponentState {
}

interface IProps {
    open$: Observable<any>;
}

export class Documentation extends Component<IProps, IComponentState> {

    state: IComponentState = {};

    onCloseClick$ = new Subject();

    get container(): HTMLElement {
        return this.base;
    }

    set opened(value: boolean) {
        this.container.classList.toggle('opened', value);
    }

    get backdropClick$(): Observable<MouseEvent> {
        return fromEvent<MouseEvent>(this.container, 'click')
            .pipe(filter(event => event.target === this.container))
    }

    get onEscape$(): Observable<KeyboardEvent> {
        return fromEvent<KeyboardEvent>(window, 'keydown')
            .pipe(filter(event => event.keyCode === 27))
    }

    componentDidMount() {
        this.opened = true;

        this.props.open$
            .subscribe(() => {
                this.opened = true;
            });

        merge(
            this.onEscape$,
            this.backdropClick$,
            this.onCloseClick$
        )
            .subscribe(() => {
                this.opened = false;
            });
    }

    render(props: IProps, state: IComponentState) {
        return (
            <div class="documentation">
                <div class="container">
                    <AccordionSection header={'FAQ'} opened={true}>
                        <BasicFAQ />
                    </AccordionSection>
                    <AccordionSection header={'First steps'} opened={false}>
                        <FirstSteps />
                    </AccordionSection>
                    <AccordionSection header={'How code works'} opened={false}>
                        <HowCodeWorks />
                    </AccordionSection>
                    <AccordionSection header={'JavaScript basics'} opened={false}>
                        <BasicJS />
                    </AccordionSection>
                    <AccordionSection header={'API'} opened={false}>
                        <UnitApi />
                    </AccordionSection>
                    <AccordionSection header={'Useful tips'} opened={false}>
                        <UsefulTips />
                    </AccordionSection>

                    <div class="container-footer">
                        ⇣ Scroll down to learn more
                        <button class="sample-button" onClick={e => this.onCloseClick$.next()}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

}