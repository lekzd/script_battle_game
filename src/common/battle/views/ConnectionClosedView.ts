import Phaser from 'phaser';
import {font} from '../../helpers/font';

export class ConnectionClosedView extends Phaser.Scene {

    constructor() {
        super({
            key: 'connectionClosed'
        });
    }

    create() {
        const text = this.add.text(200, 150, 'Connection lost', {
            font: font(16),
            fill: '#cc0000'
        });

        text.setOrigin(.5);
    }
}