import Phaser from 'phaser';
import {ISessionResult, WinnerSide} from '../BattleSession';
import {BattleFieldModel} from '../BattleFieldModel';
import {Inject} from '../../InjectDectorator';
import {BattleSide} from '../BattleSide';
import {BattleUnit} from '../BattleUnit';

export class ResultsView extends Phaser.Scene {

    @Inject(BattleFieldModel) private battleFieldModel: BattleFieldModel;

    constructor() {
        super({
            key: 'results'
        });
    }

    create() {
        const graphics = this.add.graphics();

        graphics.setPosition(0, 0);

        graphics.fillStyle(0x000000);
        graphics.setAlpha(0.6);
        graphics.fillRect(0, 0, 400, 300);

        const text = this.add.text(200, 150, 'Результаты', {
            font: '16px Courier',
            align: 'right',
            fill: '#00ff00'
        });

        text.setOrigin(0.5);
    }

    setResults(results: ISessionResult) {
        const isLeftWins = results.winner === WinnerSide.left;
        const isRightWins = results.winner === WinnerSide.right;
        let units = [];

        if (isLeftWins) {
            units = this.getAliveUnits(BattleSide.left);
        }

        if (isRightWins) {
            units = this.getAliveUnits(BattleSide.right);
        }

        this.makeCelebration(units);
    }

    private getAliveUnits(side: BattleSide): BattleUnit[] {
        return this.battleFieldModel.units.filter(unit => {
            return unit.health > 0 && unit.side === side;
        })
    }

    private makeCelebration(units: BattleUnit[]) {
        units.forEach(unit => {
           unit.makeCelebration();
        });
    }
}