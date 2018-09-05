import { h, render } from 'preact';
import './LeadersGridComponent';
import {RoomListComponent} from './RoomListComponent';

export class LeadersApp {

    constructor() {
        render(<RoomListComponent />, document.querySelector('.leaders'));
    }
}