import Phaser from 'phaser';
import {Inject} from "../../common/InjectDectorator";
import {CharactersList} from "../../common/characters/CharactersList";

export class BattleView extends Phaser.Scene {

    @Inject(CharactersList) private charactersList: CharactersList;

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

        for (let i = 0; i <= 4; i++) {
            this.charactersList.drawRandomCharacter(this.add, i, true);
        }

        for (let i = 0; i <= 4; i++) {
            this.charactersList.drawRandomCharacter(this.add, i, false);
        }
    }
}