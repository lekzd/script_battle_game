import {BattleView} from './views/BattleView';
import {WaitingView} from './views/WaitingView';
import Phaser from "phaser";
import {ConnectionClosedView} from "./views/ConnectionClosedView";

export enum BattleState {
    wait = 'waiting',
    battle = 'battle',
    results = 'results',
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
        const container = document.querySelector('.leftCode');
        const preLength = container.querySelectorAll('pre').length;

        if (preLength > 1) {
            container.removeChild(container.querySelector('pre'));
            container.querySelector('pre').classList.remove('fade-in');
        }

        container.innerHTML += `
            <pre class="fade-in">${code}</pre>
        `;
    }

    updateRightCode(code: string) {
        const container = document.querySelector('.rightCode');
        const preLength = container.querySelectorAll('pre').length;

        if (preLength > 1) {
            container.removeChild(container.querySelector('pre'));
            container.querySelector('pre').classList.remove('fade-in');
        }

        container.innerHTML += `
            <pre class="fade-in">${code}</pre>
        `;
    }
}