import Phaser from 'phaser';

export class ConnectionClosedView extends Phaser.Scene {

    constructor() {
        super({
            key: 'connectionClosed'
        });
    }

    create() {
        const text = this.add.text(200, 150, 'Соединение потеряно', {
            font: '16px Courier',
            fill: '#cc0000'
        });

        text.setOrigin(.5);
    }
}