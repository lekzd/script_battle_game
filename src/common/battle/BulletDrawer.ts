export enum BulletType {
    arrow, snow, fire, stone
}

export class BulletDrawer {

    private drawers = new Map<BulletType, Function>();

    constructor(private scene: Phaser.Scene) {

        this.drawers.set(BulletType.arrow, this.getArrowGraphics);
        this.drawers.set(BulletType.snow, this.getSnowGraphics);
        this.drawers.set(BulletType.fire, this.getFireGraphics);
        this.drawers.set(BulletType.stone, this.getStoneGraphics);

    }

    get(key: BulletType): Phaser.GameObjects.Image {
        return this.drawers.get(key).call(this);
    }

    getArrowGraphics(): Phaser.GameObjects.Image {
        const graphics = this.scene.add.image(0, 0, 'arrow');

        return graphics;
    }

    getSnowGraphics(): Phaser.GameObjects.Image {
        const image = this.scene.add.image(0, 0, 'snow');

        this.scene.tweens.add({
            targets: image,
            angle: 1800,
            delay: 50,
            repeat: 3
        });

        image.setBlendMode(Phaser.BlendModes.ADD);

        return <any>image;
    }

    getFireGraphics(): Phaser.GameObjects.Image {
        const graphics = this.scene.add.image(0, 0, 'fire');

        this.scene.tweens.add({
            targets: graphics,
            angle: 1800,
            delay: 50,
            repeat: 3
        });

        return <any>graphics;
    }

    getStoneGraphics(): Phaser.GameObjects.Image {
        const graphics = this.scene.add.image(0, 0, 'stone');

        this.scene.tweens.add({
            targets: graphics,
            angle: 1400,
            delay: 50,
            repeat: 3
        });

        return <any>graphics;
    }

}