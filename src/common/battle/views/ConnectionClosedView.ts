import * as Phaser from 'phaser';
import {font} from '../../helpers/font';

export class ConnectionClosedView extends Phaser.Scene {

    constructor() {
        super({
            key: 'connectionClosed'
        });
    }

    create() {
        const text = this.add.text(200, 150, 'Соединение потеряно', {
            font: font(16),
            fill: '#cc0000'
        });

        text.setOrigin(.5);
    }
}