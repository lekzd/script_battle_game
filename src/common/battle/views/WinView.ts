import Phaser from 'phaser';

export class WinView extends Phaser.Scene {

    constructor() {
        super({
            key: 'win'
        });
    }

    create() {
        const text = this.add.text(200, 150, 'Победа!', {
            font: '26px Courier',
            fill: '#00cc00'
        });

        text.setOrigin(.5);
    }
}