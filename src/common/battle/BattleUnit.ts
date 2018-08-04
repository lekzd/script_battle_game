import {BattleSide} from './BattleSession';
import {CharactersList, ICharacterConfig} from "../characters/CharactersList";
import {Inject} from "../InjectDectorator";
import {BattleFieldDrawer} from "./BattleFieldDrawer";
import {IAction} from "../codeSandbox/CodeSandbox";

interface IBattleUnitConfig {
    x: number;
    y: number;
    type: string,
    side: BattleSide,
    scene: Phaser.Scene;
}

type IAnimationName = 'idle' | 'slash' | 'shoot' | 'walk' | 'thrust' | 'spellcast';

export class BattleUnit {
    x: number;
    y: number;

    hasTurn = true;
    health = 100;
    side: BattleSide;

    character: ICharacterConfig;

    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private scene: Phaser.Scene;
    private type: string;
    private sprite: Phaser.GameObjects.Sprite;
    private actions: IAction[] = [];

    get renderLeft(): number {
        return this.battleFieldDrawer.getHexagonLeft(this.x, this.y);
    }

    get renderTop(): number {
        return this.battleFieldDrawer.getHexagonTop(this.x, this.y);
    }

    constructor(config: IBattleUnitConfig) {
        this.x = config.x;
        this.y = config.y;

        this.side = config.side;
        this.scene = config.scene;
        this.type = config.type;

        this.character = this.charactersList.get(config.type);

        this.sprite = this.scene.add.sprite(this.renderLeft, this.renderTop, this.type);

        this.setAnimation('idle');
    }

    setActions(actions: IAction[]) {
        this.actions = actions.slice(0);
    }

    private setAnimation(animationName: IAnimationName) {
        const turnKey = this.side === BattleSide.right ? 'left' : 'right';
        const phaserAnimationName = `${this.type}_${animationName}_${turnKey}`;

        this.sprite.play(phaserAnimationName, false, 0);
    }
}