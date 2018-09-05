import {Inject} from "../common/InjectDectorator";
import {ApiService} from "../common/ApiService";
import {fromEvent, Subject} from "rxjs";
import {switchMap} from "rxjs/operators";
import {Environment} from "../common/Environment";
import { Component, Prop } from '@stencil/core';
import {WebComponent} from '../common/WebComponent';

interface IComponentState {
    name: string
}

@Component({
    tag: 'room-item'
})
export class RoomItemComponent extends WebComponent<IComponentState> {
    @Inject(ApiService) private apiService: ApiService;
    @Inject(Environment) private environment: Environment;

    removed$ = new Subject();

    get leftLink(): string {
        return `${this.environment.config.baseUrl}/left#room=${this.state.name}`;
    }

    get rightLink(): string {
        return `${this.environment.config.baseUrl}/right#room=${this.state.name}`;
    }

    get masterLink(): string {
        return `${this.environment.config.baseUrl}/master#room=${this.state.name}`;
    }

    constructor() {
        super();

        this.setState({
            name: this.getAttribute('name')
        })
    }

    render() {
        return (
            <div>
                <div>Имя: {this.state.name}</div>

                <div class="link">
                    <a href={this.leftLink} target="_blank">Левый</a>
                </div>
                <div class="link">
                    <a href={this.rightLink} target="_blank">Правый</a>
                </div>
                <div class="link">
                    <a href={this.masterLink} target="_blank">Мастер</a>
                </div>

                <button class="sample-button" id="remove">Удалить</button>
            </div>
        );
    }

    // render(state: Partial<IComponentState>): string {
    //     return `
    //         <div>Имя: ${state.name}</div>
    //         <div class="link"><a href="${this.leftLink}" target="_blank">Левый</a></div>
    //         <div class="link"><a href="${this.rightLink}" target="_blank">Правый</a></div>
    //         <div class="link"><a href="${this.masterLink}" target="_blank">Мастер</a></div>
    //
    //         <button class="sample-button" id="remove">Удалить</button>
    //     `;
    // }

    afterRender() {
        fromEvent(this.querySelector('#remove'), 'click')
            .pipe(
                switchMap(() => this.apiService.deleteRoom(this.state.name))
            )
            .subscribe(() => {
                this.removed$.next();
            });
    }
}

// customElements.define('room-item', RoomItemComponent);