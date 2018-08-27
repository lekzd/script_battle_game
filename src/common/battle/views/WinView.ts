import Phaser from 'phaser';
import {font} from '../../helpers/font';

export class WinView extends Phaser.Scene {

    constructor() {
        super({
            key: 'win'
        });
    }

    create() {
        const graphics = this.add.graphics();

        graphics.setPosition(0, 0);

        graphics.fillStyle(0x000000);
        graphics.setAlpha(0.6);
        graphics.fillRect(0, 0, 400, 300);

        const text = this.add.text(200, 150, 'Победа!', {
            font: font(26),
            fill: '#00cc00'
        });

        text.setOrigin(.5);
    }
}