import Phaser from 'phaser';
import {Inject} from "../../InjectDectorator";
import {CharactersList} from "../../characters/CharactersList";
import {BattleFieldDrawer} from "../BattleFieldDrawer";
import {BattleFieldModel} from "../BattleFieldModel";
import {BattleUnit} from "../BattleUnit";
import {Subject} from "rxjs/internal/Subject";
import {CodeSandbox} from "../../codeSandbox/CodeSandbox";
import {BattleSession, ISessionResult} from "../BattleSession";
import {combineLatest} from "rxjs/internal/observable/combineLatest";
import {BattleSide} from "../BattleSide";
import {color} from "../../helpers/color";
import {ClientState} from '../../client/ClientState';
import {EnemyState} from '../../client/EnemyState';
import {WebsocketConnection} from "../../WebsocketConnection";
import {LeftArmy} from "../../../left/LeftArmy";
import {RightArmy} from "../../../right/RightArmy";
import {timer} from "rxjs/internal/observable/timer";
import {BattleStatistics} from "../BattleStatistics";

export class BattleView extends Phaser.Scene {

    runCode$ = new Subject<[string, string]>();

    @Inject(LeftArmy) private leftArmy: LeftArmy;
    @Inject(RightArmy) private rightArmy: RightArmy;
    @Inject(EnemyState) private enemyState: EnemyState;
    @Inject(ClientState) private clientState: ClientState;
    @Inject(CodeSandbox) private codeSandbox: CodeSandbox;
    @Inject(BattleSession) private battleSession: BattleSession;
    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;
    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;
    @Inject(BattleFieldDrawer) private battleFieldDrawer: BattleFieldDrawer;

    private create$ = new Subject();
    private leftUnits: BattleUnit[] = [];
    private rightUnits: BattleUnit[] = [];
    private updateTimer$ = new Subject();

    private leftStatistics: BattleStatistics;
    private rightStatistics: BattleStatistics;

    constructor() {
        super({
            key: 'battle'
        });

        combineLatest(this.runCode$, this.create$.asObservable())
            .subscribe(([[leftCode, rightCode]]) => {
                this.clearField();
                this.runCode(leftCode, rightCode);
            });

        this.battleFieldModel.bullet$
            .subscribe(([x, y, x2, y2]) => {
                this.createBullet(x, y, x2, y2);
            });

        this.enemyState.change$
            .subscribe(state => {
                if (this.clientState.side === BattleSide.left) {
                    this.updateUnitsFromState(this.rightUnits, state);
                } else {
                    this.updateUnitsFromState(this.leftUnits, state);
                }
            });

        this.clientState.change$
            .subscribe(state => {
                if (this.clientState.side === BattleSide.right) {
                    this.updateUnitsFromState(this.rightUnits, state);
                } else {
                    this.updateUnitsFromState(this.leftUnits, state);
                }
            });

        this.connection.onMessage$.subscribe(message => {
            if (message.type === 'leftState') {
                this.updateUnitsFromState(this.leftUnits, message.data.state);
            }

            if (message.type === 'rightState') {
                this.updateUnitsFromState(this.rightUnits, message.data.state);
            }
        });

        this.updateTimer$.subscribe(() => {
            this.leftStatistics.setDamage(this.battleSession.getSideDamage(BattleSide.right));
            this.rightStatistics.setDamage(this.battleSession.getSideDamage(BattleSide.left));
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

        this.leftStatistics = new BattleStatistics(this, BattleSide.left);
        this.rightStatistics = new BattleStatistics(this, BattleSide.right);

        timer(500, 500).subscribe(() => {
            this.updateTimer$.next();
        });

        for (let i = 0; i < 4; i++) {
            const {x, y} = this.getUnitStartPosition(BattleSide.left, i);
            const army = this.leftArmy;
            const type = army[i];
            const side = BattleSide.left;
            const scene = this;

            const unit = new BattleUnit({x, y, type, side, scene});

            this.leftUnits.push(unit);
            this.battleFieldModel.set(x, y, unit);
        }

        for (let i = 0; i < 4; i++) {
            const {x, y} = this.getUnitStartPosition(BattleSide.right, i);
            const army = this.rightArmy;
            const type = army[i];
            const side = BattleSide.right;
            const scene = this;

            const unit = new BattleUnit({x, y, type, side, scene});

            this.rightUnits.push(unit);
            this.battleFieldModel.set(x, y, unit);
        }

        this.create$.next();
    }

    private clearField() {
        this.leftUnits.forEach((unit, index) => {
            const {x, y} = this.getUnitStartPosition(BattleSide.left, index);

            this.battleFieldModel.set(x, y, unit);

            unit.clear();
            unit.setPosition(x, y);
        });


        this.rightUnits.forEach((unit, index) => {
            const {x, y} = this.getUnitStartPosition(BattleSide.right, index);

            this.battleFieldModel.set(x, y, unit);

            unit.clear();
            unit.setPosition(x, y);
        })
    }

    private getUnitStartPosition(side: BattleSide, index: number): {x: number, y: number} {
        const topIndexes = [
            2, 4, 6, 8
        ];

        return {
            x: side === BattleSide.left ? 2 : 11,
            y: topIndexes[index]
        }
    }

    private generateHexagonsTexture(name: string) {
        const {width, height} = this.battleFieldDrawer;

        const fieldTexture = this.textures.createCanvas(name, width, height);

        this.battleFieldDrawer.draw((fieldTexture as any).context);

        (fieldTexture as any).refresh();
    }

    private runCode(leftCode: string, rightCode: string) {
        const promises = [];

        this.leftUnits.forEach(unit => {
            const evalPromise = this.codeSandbox.eval(leftCode, unit);

            evalPromise.then((actions) => {
                unit.setActions(actions);
            });

            promises.push(evalPromise);
        });

        this.rightUnits.forEach(unit => {
            const evalPromise = this.codeSandbox.eval(rightCode, unit);

            evalPromise.then((actions) => {
                unit.setActions(actions);
            });

            promises.push(evalPromise);
        });

        Promise.all(promises)
            .then(() => {
                return this.battleSession.start([...this.leftUnits, ...this.rightUnits]);
            })
            .then((sessionResult: ISessionResult) => {
                if (this.connection.isMaster) {
                    this.dispatchWinner(sessionResult);
                }
            });
    }

    private createBullet(x: number, y: number, x2: number, y2: number) {
        const left = this.battleFieldDrawer.getHexagonLeft(x, y);
        const top = this.battleFieldDrawer.getHexagonTop(x, y);

        const left2 = this.battleFieldDrawer.getHexagonLeft(x2, y2);
        const top2 = this.battleFieldDrawer.getHexagonTop(x2, y2);

        const graphics = this.add.graphics();

        graphics.fillStyle(color('#fcff93'), 1);
        graphics.fillCircle(left, top, 4);

        this.tweens.add({
            targets: graphics,
            x: left2 - left,
            y: top2 - top,
            duration: 300,
            repeat: 0,
            onComplete: () => {
                graphics.destroy();
            }
        });
    }

    private updateUnitsFromState(units: BattleUnit[], state: any) {
        if (!state.army) {
            return;
        }

        units.forEach((unit, index) => {
            const type = state.army[index];

            if (type && unit.character.type !== type) {
                unit.setType(type);
            }
        })
    }

    private dispatchWinner(sessionResult: ISessionResult) {
        this.connection.sendWinner(sessionResult);
    }
}