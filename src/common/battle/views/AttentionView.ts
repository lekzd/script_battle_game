import Phaser from 'phaser';
import {interval, Observable} from 'rxjs/index';
import {map, take} from 'rxjs/internal/operators';
import {font} from '../../helpers/font';

export class AttentionView extends Phaser.Scene {

    constructor() {
        super({
            key: 'attention'
        });
    }

    get timer$(): Observable<number> {
        let time = 3;

        return interval(1000)
            .pipe(
                take(4),
                map(() => time--)
            )
    }

    create() {
        const graphics = this.add.graphics();

        graphics.setPosition(0, 0);

        graphics.fillStyle(0x000000);
        graphics.setAlpha(0.6);
        graphics.fillRect(0, 0, 400, 300);

        this.add.text(200, 110, 'Внимание на главный экран!', {
            font: font(16),
            fill: '#ccc349'
        }).setOrigin(.5);

        const timeText = this.add.text(200, 160, '3', {
            font: font(26),
            fill: '#ccc349'
        });

        timeText.setOrigin(.5);

        this.timer$.subscribe(seconds => {
            timeText.setText(seconds.toString());
        })
    }
}