import Phaser from 'phaser';

export class ResultsView extends Phaser.Scene {

    constructor() {
        super({
            key: 'results'
        });
    }

    create() {
        const text = this.add.text(200, 150, 'Результаты', {
            font: '16px Courier',
            align: 'right',
            fill: '#00ff00'
        });

        text.setOrigin(0.5);
    }
}