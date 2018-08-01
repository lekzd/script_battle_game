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

        const {width, height} = this.battleFieldDrawer;

        const fieldTexture = this.textures.createCanvas('hexagons', width, height);

        this.battleFieldDrawer.draw((fieldTexture as any).context);

        (fieldTexture as any).refresh();

        this.add.image(200, 150, 'hexagons');

        const topIndexes = [
            2, 4, 6, 8
        ];

        for (let i = 0; i <= 4; i++) {
            const left = this.battleFieldDrawer.getHexagonLeft(2, topIndexes[i]);
            const top = this.battleFieldDrawer.getHexagonTop(2, topIndexes[i]);

            this.charactersList.drawRandomCharacter(this.add, left, top, true);
        }

        for (let i = 0; i <= 4; i++) {
            const left = this.battleFieldDrawer.getHexagonLeft(11, topIndexes[i]);
            const top = this.battleFieldDrawer.getHexagonTop(11, topIndexes[i]);

            this.charactersList.drawRandomCharacter(this.add, left, top, false);
        }
    }
}