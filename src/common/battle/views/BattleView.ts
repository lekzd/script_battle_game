import Phaser from 'phaser';
import {Inject} from "../../InjectDectorator";
import {CharactersList} from "../../characters/CharactersList";
import {BattleFieldDrawer} from "../BattleFieldDrawer";

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
        this.generateHexagonsTexture('hexagons');

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

    private generateHexagonsTexture(name: string) {
        const {width, height} = this.battleFieldDrawer;

        const fieldTexture = this.textures.createCanvas(name, width, height);

        this.battleFieldDrawer.draw((fieldTexture as any).context);

        (fieldTexture as any).refresh();
    }
}