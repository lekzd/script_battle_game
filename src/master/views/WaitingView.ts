import Phaser from 'phaser';

export class WaitingView extends Phaser.Scene {

    constructor() {
        super({
            key: 'waiting'
        });
    }

    create() {
        this.add.text(200, 150, 'Please wait', {
            font: '16px Courier',
            fill: '#00ff00'
        });

        this.input.on('pointerdown', () => {

            this.scene.switch('battle');

        });
    }
}