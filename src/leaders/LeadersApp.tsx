import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';
import {LeadersGridComponent} from './LeadersGridComponent';

export class LeadersApp {

    constructor() {
        render((
            <div>
                <RoomListComponent />
                <LeadersGridComponent />
            </div>
        ), document.querySelector('.leaders'));
    }
}