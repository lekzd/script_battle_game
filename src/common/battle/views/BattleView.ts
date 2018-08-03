import Phaser from 'phaser';
import {Inject} from "../../InjectDectorator";
import {CharactersList} from "../../characters/CharactersList";
import {BattleFieldDrawer} from "../BattleFieldDrawer";
import {BattleFieldModel} from "../BattleFieldModel";
import {BattleUnit} from "../BattleUnit";
import {Subject} from "rxjs/internal/Subject";
import {IAction} from "../../codeSandbox/CodeSandbox";

export class BattleView extends Phaser.Scene {

    runLeftCode$ = new Subject<IAction[]>();

    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    constructor() {
        super({
            key: 'battle'
        });

        this.runLeftCode$.subscribe(actions => {
            console.log('runLeftCode$', actions);
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
            const unit = new BattleUnit();

            this.battleFieldModel.set(2, topIndexes[i], unit);
        }

        for (let i = 0; i <= 4; i++) {
            const unit = new BattleUnit();

            this.battleFieldModel.set(11, topIndexes[i], unit);
        }

        this.battleFieldModel.forEach((unit: BattleUnit, x: number, y: number) => {
            const left = this.battleFieldDrawer.getHexagonLeft(x, y);
            const top = this.battleFieldDrawer.getHexagonTop(x, y);
            const isFriend = x === 2;

            this.charactersList.drawRandomCharacter(this.add, left, top, isFriend);
        })
    }

    private generateHexagonsTexture(name: string) {
        const {width, height} = this.battleFieldDrawer;

        const fieldTexture = this.textures.createCanvas(name, width, height);

        this.battleFieldDrawer.draw((fieldTexture as any).context);

        (fieldTexture as any).refresh();
    }
}