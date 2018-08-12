import {BattleSide} from "./BattleSide";

export class BattleStatistics {

    private damageText: Phaser.GameObjects.Text;
    private container: any;

    constructor(private scene: Phaser.Scene, side: BattleSide) {

        const left = side === BattleSide.left ? 0 : 350;

        this.container = (this.scene.add as any).container(left, 0);

        this.damageText = this.generateDamageText();

        this.container.add(this.damageText);
    }

    setDamage(value: number) {
        this.damageText.setText(value.toString());
    }

    private generateDamageText(): Phaser.GameObjects.Text {
        return this.scene.add.text(0, 0, '0', {
            font: '16px Courier',
            fill: '#faff39'
        });
    }
}