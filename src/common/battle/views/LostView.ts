import Phaser from 'phaser';

export class LostView extends Phaser.Scene {

    constructor() {
        super({
            key: 'lost'
        });
    }

    create() {
        const text = this.add.text(200, 150, 'Поражение', {
            font: '26px Courier',
            fill: '#cc0000'
        });

        text.setOrigin(.5);
    }
}