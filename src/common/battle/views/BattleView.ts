import Phaser from 'phaser';
import {Inject} from "../../InjectDectorator";
import {CharactersList} from "../../characters/CharactersList";
import {BattleFieldDrawer} from "../BattleFieldDrawer";
import {BattleFieldModel} from "../BattleFieldModel";
import {BattleUnit} from "../BattleUnit";
import {Subject} from "rxjs/internal/Subject";
import {IAction} from "../../codeSandbox/CodeSandbox";
import {BattleSession, BattleSide} from "../BattleSession";

export class BattleView extends Phaser.Scene {

    runCode$ = new Subject<[IAction[], IAction[]]>();

    @Inject(BattleSession) private battleSession: BattleSession;
    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    constructor() {
        super({
            key: 'battle'
        });

        this.runCode$.subscribe(([leftActions, rightActions]) => {
            this.battleSession.start(this.battleFieldModel.units, leftActions, rightActions);
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
            const x = 2;
            const y = topIndexes[i];
            const type = this.charactersList.getRandomType();
            const side = BattleSide.left;
            const scene = this;

            const unit = new BattleUnit({x, y, type, side, scene});

            this.battleFieldModel.set(x, y, unit);
        }

        for (let i = 0; i <= 4; i++) {
            const x = 11;
            const y = topIndexes[i];
            const type = this.charactersList.getRandomType();
            const side = BattleSide.right;
            const scene = this;

            const unit = new BattleUnit({x, y, type, side, scene});

            this.battleFieldModel.set(x, y, unit);
        }
    }

    private generateHexagonsTexture(name: string) {
        const {width, height} = this.battleFieldDrawer;

        const fieldTexture = this.textures.createCanvas(name, width, height);

        this.battleFieldDrawer.draw((fieldTexture as any).context);

        (fieldTexture as any).refresh();
    }
}