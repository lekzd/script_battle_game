import {CharactersList, CharacterType, IAttackTypeConfig, ICharacterConfig} from "../characters/CharactersList";
import {Inject} from "../InjectDectorator";
import {BattleFieldDrawer} from "./BattleFieldDrawer";
import {IAction} from "../codeSandbox/CodeSandbox";
import {getBattleApi} from "./BattleUnitBattleApi";
import {BattleSide} from "./BattleSide";
import {color} from "../helpers/color";
import {Subject} from "rxjs/internal/Subject";

interface IBattleUnitConfig {
    x: number;
    y: number;
    type: string;
    side: BattleSide;
    scene: Phaser.Scene;
}

export type IAnimationName = 'idle' | 'slash' | 'shoot' | 'walk' | 'thrust' | 'spellcast';

const MAX_HEALTH = 100;

export class BattleUnit {
    x: number;
    y: number;
    id: string;

    hasTurn = true;
    health = MAX_HEALTH;
    side: BattleSide;

    character: ICharacterConfig;
    actions: IAction[] = [];
    gotDamage = 0;

    api: any;

    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private rotation: BattleSide;
    private scene: Phaser.Scene;
    private type: string;
    private sprite: Phaser.GameObjects.Sprite;
    private sayText: Phaser.GameObjects.Text;
    private container: any;
    private healthBar: Phaser.GameObjects.Graphics;
    private idText: Phaser.GameObjects.Text;
    private spriteZ: number;

    get renderLeft(): number {
        return this.battleFieldDrawer.getHexagonLeft(this.x, this.y) - 32;
    }

    get renderTop(): number {
        return this.battleFieldDrawer.getHexagonTop(this.x, this.y) + 8;
    }

    constructor(config: IBattleUnitConfig) {
        this.x = config.x;
        this.y = config.y;

        this.side = config.side;
        this.rotation = config.side;
        this.scene = config.scene;
        this.type = config.type;

        this.character = this.charactersList.get(config.type);

        this.id = this.character.id;

        this.initGraphics();

        this.api = getBattleApi(this);

    }

    setActions(actions: IAction[]) {
        this.actions = actions.slice(0);
    }

    setPositionAction(x: number, y: number): Promise<void> {
        this.rotation = this.x < x
            ? BattleSide.left
            : BattleSide.right;

        this.setPosition(x, y);
        this.setAnimation('walk');

        return new Promise(resolve => {
            setTimeout(() => {
                this.setAnimation('idle');
                this.rotation = this.side;
                resolve();
            }, 300);
        });
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.container.setPosition(this.renderLeft, this.renderTop);
    }

    sayAction(text: string): Promise<void> {
        return new Promise(resolve => {
            this.sayText.setText(text);
            this.sayText.setVisible(true);

            setTimeout(() => {

                resolve();
            }, 300);

            setTimeout(() => {
                this.sayText.setVisible(false);
            }, 2000);
        });
    }

    setAnimation(animationName: IAnimationName) {
        const turnKey = this.rotation === BattleSide.right ? 'left' : 'right';
        const phaserAnimationName = `${this.type}_${animationName}_${turnKey}`;

        if (animationName === 'idle') {
            this.container.setZ(this.spriteZ);
        } else {
            this.container.setZ(0);
        }

        this.sprite.play(phaserAnimationName, false, 0);
    }

    hitHealth(absoluteHitValue: number, fromUnit: BattleUnit) {
        let enemyValues: IAttackTypeConfig = null;
        let myValues: IAttackTypeConfig = null;

        if (fromUnit.character.type === CharacterType.magic) {
            enemyValues = fromUnit.character.magic;
            myValues = this.character.magic;
        }
        if (fromUnit.character.type === CharacterType.shooting) {
            enemyValues = fromUnit.character.shoot;
            myValues = this.character.shoot;
        }
        if (fromUnit.character.type === CharacterType.melee) {
            enemyValues = fromUnit.character.mellee;
            myValues = this.character.mellee;
        }

        let hitValue = enemyValues.attack > myValues.defence
            ? enemyValues.attack.max * absoluteHitValue
            : Math.max(enemyValues.attack.max - myValues.defence.max, 1) * absoluteHitValue;

        const newValue = this.health - hitValue;

        this.gotDamage += hitValue;

        this.health = Math.max(Math.min(MAX_HEALTH, newValue), 0);

        if (this.health <= 0) {
            this.makeDeadAnimation();
        } else {
            this.makeHitAnimation(fromUnit);
        }

        this.updateHealthBar();
    }

    setType(type: CharacterType) {
        this.type = type;
        this.character = this.charactersList.get(type);
        this.id = this.character.id;
        this.api = getBattleApi(this);

        this.idText.setText(this.character.id);
        this.sprite.setTexture(type);
        this.setAnimation('idle');
    }

    clear() {
        this.health = MAX_HEALTH;
        this.gotDamage = 0;
        this.updateHealthBar();

        this.sprite.setAlpha(1);
        this.sprite.setAngle(0);
        this.sprite.setPosition(0, -20);

        this.healthBar.setVisible(true);
        this.idText.setVisible(true);
    }

    private initGraphics() {
        this.container = (this.scene.add as any).container(this.renderLeft, this.renderTop);
        this.sprite = this.generateSprite();
        this.idText = this.generateIdText();
        this.sayText = this.generateSayText();
        this.healthBar = this.generateHealthBar();

        this.updateHealthBar();

        this.container.add(this.sprite);
        this.container.add(this.sayText);
        this.container.add(this.idText);
        this.container.add(this.healthBar);

        this.spriteZ = this.sprite.z;

        this.setAnimation('idle');
    }

    private generateSprite(): Phaser.GameObjects.Sprite {
        return this.scene.add.sprite(0, -20, this.type);
    }

    private generateIdText(): Phaser.GameObjects.Text {
        const isLeft = this.rotation === BattleSide.left;
        const left = isLeft ? 10 : -10;

        const idText = this.scene.add.text(left, 4, this.id, {
            font: '9px monospace',
            color: '#11cc14',
            backgroundColor: '#42176c'
        });

        if (isLeft) {
            idText.setOrigin(0, 0.5);
        } else {
            idText.setOrigin(1, 0.5);
        }

        idText.setPadding(2, 1, 2, 0);

        return idText;
    }

    private generateSayText(): Phaser.GameObjects.Text {
        const isLeft = this.rotation === BattleSide.left;
        const left = isLeft ? 10 : -10;

        const textElement = this.scene.add.text(left, -32, '', {
            font: '9px monospace',
            color: '#111111',
            backgroundColor: '#faffac'
        });

        if (isLeft) {
            textElement.setOrigin(0, 1);
        } else {
            textElement.setOrigin(1, 1);
        }

        textElement.setPadding(2, 1, 2, 0);
        textElement.setVisible(false);

        return textElement;
    }

    private generateHealthBar(): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();

        return graphics;
    }

    private updateHealthBar() {
        const width = 40;
        const healthWith = Math.round(width * (this.health / MAX_HEALTH));

        this.healthBar.clear();

        this.healthBar.fillStyle(this.getHeathColor(this.health), 1);
        this.healthBar.fillRect(-(width / 2), 12, healthWith, 2);

        this.healthBar.lineStyle(1, color('#11cc14'), 1);
        this.healthBar.strokeRect(-(width / 2), 12, width, 2);
    }

    private getHeathColor(health: number): number {
        if (health > 75) {
            return color('#00FF00');
        }

        if (health > 50) {
            return color('#e9ff23');
        }

        if (health > 25) {
            return color('#ffa133');
        }

        return color('#ff3131');
    }

    private makeHitAnimation(fromUnit: BattleUnit) {
        const offset = this.renderLeft < fromUnit.renderLeft
            ? '-=5'
            : '+=5';

        this.setAnimation('spellcast');

        setTimeout(() => {
            this.setAnimation('idle');
        }, 500);

        this.scene.tweens.add({
            targets: this.sprite,
            x: offset,
            duration: 100,
            repeat: 0,
            yoyo: true
        });
    }

    private makeDeadAnimation() {
        const angle = this.side === BattleSide.right
            ? 90
            : -90;

        const offset = this.side === BattleSide.right
            ? '+=30'
            : '-=30';

        this.scene.tweens.add({
            targets: this.sprite,
            y: '+=26',
            x: offset,
            duration: 100,
            repeat: 0
        });

        this.scene.tweens.add({
            targets: this.sprite,
            angle,
            duration: 100,
            repeat: 0,
            onComplete: () => {
                this.sprite.setAlpha(0.5);
                this.healthBar.setVisible(false);
                this.idText.setVisible(false);
            }
        });
    }
}