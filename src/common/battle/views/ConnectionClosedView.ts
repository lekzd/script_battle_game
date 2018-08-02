import Phaser from 'phaser';

export class ConnectionClosedView extends Phaser.Scene {

    constructor() {
        super({
            key: 'connectionClosed'
        });
    }

    create() {
        this.add.text(200, 150, 'Connection closed', {
            font: '16px Courier',
            fill: '#cc0000'
        });
    }
}