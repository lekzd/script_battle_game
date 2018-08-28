import {BattleSide} from "./BattleSide";
import {color} from "../helpers/color";
import {font} from '../helpers/font';

const MAX_DAMAGE = 500;

export class BattleStatistics {

    private damageText: Phaser.GameObjects.Text;
    private damageLine: Phaser.GameObjects.Graphics;
    private container: any;

    constructor(private scene: Phaser.Scene, side: BattleSide) {

        const left = side === BattleSide.left ? 10 : 390;

        this.container = (this.scene.add as any).container(left, 3);

        this.damageText = this.generateDamageText();
        this.damageLine = this.generateDamageLine();

        if (side === BattleSide.right) {
            this.damageText.setOrigin(1, 0);
            this.damageLine.setX(-345);
        }

        this.container.add(this.damageText);
        this.container.add(this.damageLine);
    }

    setDamage(value: number) {
        this.damageText.setText(value.toString());
        this.updateDamageLine(value);
    }

    private generateDamageText(): Phaser.GameObjects.Text {
        return this.scene.add.text(0, -1, '0', {
            font: font(16),
            fill: '#faff39'
        });
    }

    private generateDamageLine(): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();

        graphics.setX(195);

        return graphics;
    }

    private updateDamageLine(value: number) {
        const width = 150;
        const healthWith = Math.max(0, width - Math.round(width * (value / MAX_DAMAGE)));

        this.damageLine.clear();

        this.damageLine.lineStyle(1, color('#11cc14'), 1);
        this.damageLine.strokeRect(0, 6, width, 2);

        this.damageLine.fillStyle(this.getColor(value), 1);
        this.damageLine.fillRect(0, 6, healthWith, 2);
    }

    private getColor(value: number): number {
        const percent = 100 - ((value / MAX_DAMAGE) * 100);

        if (percent > 75) {
            return color('#00FF00');
        }

        if (percent > 50) {
            return color('#e9ff23');
        }

        if (percent > 25) {
            return color('#ffa133');
        }

        return color('#ff3131');
    }
}