import Phaser from 'phaser';
import {Inject} from "../../common/InjectDectorator";
import {CharactersList} from "../../common/characters/CharactersList";
import {BattleFieldDrawer} from "../battle/BattleFieldDrawer";

export class BattleView extends Phaser.Scene {

    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    constructor() {
        super({
            key: 'battle'
        });
    }

    preload () {
        this.load.setBaseURL('http://localhost:8080');

        this.charactersList.load(this.load);
    }

    create() {
        this.charactersList.prepareAnimations(this.anims);

        const fieldTexture = this.textures.createCanvas('hexagons', 400, 300);

        this.battleFieldDrawer.draw((fieldTexture as any).context);

        (fieldTexture as any).refresh();

        this.add.image(200, 190, 'hexagons');

        for (let i = 0; i <= 4; i++) {
            this.charactersList.drawRandomCharacter(this.add, i, true);
        }

        for (let i = 0; i <= 4; i++) {
            this.charactersList.drawRandomCharacter(this.add, i, false);
        }
    }
}