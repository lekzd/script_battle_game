import {BattleView} from './views/BattleView';
import {WaitingView} from './views/WaitingView';
import Phaser from "phaser";
import {ConnectionClosedView} from "./views/ConnectionClosedView";
import {ISessionResult} from "./BattleSession";
import {ResultsView} from "./views/ResultsView";
import {WinView} from "./views/WinView";
import {LostView} from "./views/LostView";

export enum BattleState {
    wait = 'waiting',
    battle = 'battle',
    results = 'results',
    win = 'win',
    lost = 'lost',
    connectionClosed = 'connectionClosed'
}

export class BattleGame {

    private game: Phaser.Game;
    private currentState: BattleState;

    constructor() {
        const config = {
            type: Phaser.AUTO,
            width: 400,
            height: 300,
            parent: 'display',
            scene: [WaitingView, BattleView, ConnectionClosedView, ResultsView, WinView, LostView]
        };

        this.game = new Phaser.Game(config);
    }

    setState(newState: BattleState, state: any = {}) {
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

    showResults(sessionResult: ISessionResult) {
        this.setState(BattleState.results, sessionResult);
    }

    showWinnerScreen(sessionResult: ISessionResult) {
        this.setState(BattleState.win, sessionResult);
    }

    showLoseScreen(sessionResult: ISessionResult) {
        this.setState(BattleState.lost, sessionResult);
    }
}