import {BattleView} from './views/BattleView';
import {WaitingView} from './views/WaitingView';
import Phaser from "phaser";

export enum BattleState {
    wait = 'waiting',
    battle = 'battle',
    results = 'results'
}

export class BattleGame {

    private game: Phaser.Game;
    private currentState: BattleState.wait;

    constructor() {
        const config = {
            type: Phaser.AUTO,
            width: 400,
            height: 300,
            parent: 'display',
            scene: [WaitingView, BattleView]
        };

        this.game = new Phaser.Game(config);
    }

    setState(newState: BattleState) {
        this.game.scene.switch(this.currentState, newState);
    }

    runCode(code: string) {
        console.log('runCode', code);
    }

}