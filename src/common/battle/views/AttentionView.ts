import Phaser from 'phaser';

export class AttentionView extends Phaser.Scene {

    constructor() {
        super({
            key: 'attention'
        });
    }

    create() {
        const graphics = this.add.graphics();

        graphics.setPosition(0, 0);

        graphics.fillStyle(0x000000);
        graphics.setAlpha(0.6);
        graphics.fillRect(0, 0, 400, 300);

        const text = this.add.text(200, 150, 'Внимание на главный экран!', {
            font: '26px Courier',
            fill: '#ccc349'
        });

        text.setOrigin(.5);
    }
}