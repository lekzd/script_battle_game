import Phaser from 'phaser';

export class LostView extends Phaser.Scene {

    constructor() {
        super({
            key: 'lost'
        });
    }

    create() {
        this.add.text(200, 150, 'Поражение', {
            font: '16px Courier',
            fill: '#911308'
        });
    }
}