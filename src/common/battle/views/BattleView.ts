import Phaser from 'phaser';
import {Inject} from "../../InjectDectorator";
import {CharactersList} from "../../characters/CharactersList";
import {BattleFieldDrawer} from "../BattleFieldDrawer";
import {BattleFieldModel} from "../BattleFieldModel";
import {BattleUnit} from "../BattleUnit";
import {Subject} from "rxjs/internal/Subject";
import {CodeSandbox} from "../../codeSandbox/CodeSandbox";
import {BattleSession, BattleSide} from "../BattleSession";
import {combineLatest} from "rxjs/internal/observable/combineLatest";

export class BattleView extends Phaser.Scene {

    runCode$ = new Subject<[string, string]>();

    @Inject(CodeSandbox) private codeSandbox: CodeSandbox;
    @Inject(BattleSession) private battleSession: BattleSession;
    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private create$ = new Subject();

    constructor() {
        super({
            key: 'battle'
        });

        combineLatest(this.runCode$, this.create$.asObservable())
            .subscribe(([[leftCode, rightCode]]) => {
                this.runCode(leftCode, rightCode);
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

        const ids = [
            'CHROME', 'FIREFOX', 'IE', 'SAFARI'
        ];

        for (let i = 0; i <= 4; i++) {
            const x = 2;
            const y = topIndexes[i];
            const type = this.charactersList.getRandomType();
            const side = BattleSide.left;
            const scene = this;
            const id = ids[i];

            const unit = new BattleUnit({x, y, type, side, scene, id});

            this.battleFieldModel.set(x, y, unit);
        }

        for (let i = 0; i <= 4; i++) {
            const x = 11;
            const y = topIndexes[i];
            const type = this.charactersList.getRandomType();
            const side = BattleSide.right;
            const scene = this;
            const id = ids[i];

            const unit = new BattleUnit({x, y, type, side, scene, id});

            this.battleFieldModel.set(x, y, unit);
        }

        this.create$.next();
    }

    private generateHexagonsTexture(name: string) {
        const {width, height} = this.battleFieldDrawer;

        const fieldTexture = this.textures.createCanvas(name, width, height);

        this.battleFieldDrawer.draw((fieldTexture as any).context);

        (fieldTexture as any).refresh();
    }

    private runCode(leftCode: string, rightCode: string) {
        const {units} = this.battleFieldModel;

        const promises = units
            .map(unit => {
                const evalPromise = unit.side === BattleSide.left
                    ? this.codeSandbox.eval(leftCode, unit)
                    : this.codeSandbox.eval(rightCode, unit);

                evalPromise.then((actions) => {
                    unit.setActions(actions);
                });

                return evalPromise;
            });

        Promise.all(promises)
            .then(() => {
                this.battleSession.start(units);
            })
    }
}