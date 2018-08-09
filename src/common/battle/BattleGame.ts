import {BattleView} from './views/BattleView';
import {WaitingView} from './views/WaitingView';
import Phaser from "phaser";
import {ConnectionClosedView} from "./views/ConnectionClosedView";
import {CodeDisplay} from "../editor/CodeDisplay";
import {Subject} from "rxjs/internal/Subject";

export enum BattleState {
    wait = 'waiting',
    battle = 'battle',
    results = 'results',
    connectionClosed = 'connectionClosed'
}

export class BattleGame {

    private game: Phaser.Game;
    private currentState: BattleState;

    private leftCode: CodeDisplay;
    private rightCode: CodeDisplay;

    constructor() {
        const config = {
            type: Phaser.AUTO,
            width: 400,
            height: 300,
            parent: 'display',
            scene: [WaitingView, BattleView, ConnectionClosedView]
        };

        this.game = new Phaser.Game(config);
    }

    setState(newState: BattleState) {
        if (this.currentState === newState) {
            return;
        }

        this.game.scene.switch(BattleState.wait, newState);

        this.currentState = newState;
    }

    runCode(leftCode: string, rightCode: string) {
        console.log('runCode', leftCode);

        this.setState(BattleState.battle);

        const battleView = <BattleView>this.game.scene.getScene(BattleState.battle);

        battleView.runCode$.next([leftCode, rightCode]);
    }

    updateLeftCode(code: string) {
        this.leftCode.setCode(code);
    }

    updateRightCode(code: string) {
        this.rightCode.setCode(code);
    }

    initCodeDisplay() {
        this.leftCode = new CodeDisplay(document.querySelector('.leftCode'));
        this.rightCode = new CodeDisplay(document.querySelector('.rightCode'));
    }
}