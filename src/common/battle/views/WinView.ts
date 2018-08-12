import Phaser from 'phaser';

export class WinView extends Phaser.Scene {

    constructor() {
        super({
            key: 'win'
        });
    }

    create() {
        this.add.text(200, 150, 'Победа!', {
            font: '16px Courier',
            fill: '#00ff00'
        });
    }
}