import {BattleView} from './views/BattleView';
import {WaitingView} from './views/WaitingView';
import Phaser from "phaser";
import {ConnectionClosedView} from "./views/ConnectionClosedView";
import {CodeSandbox} from '../codeSandbox/CodeSandbox';
import {Inject} from '../InjectDectorator';

export enum BattleState {
    wait = 'waiting',
    battle = 'battle',
    results = 'results',
    connectionClosed = 'connectionClosed'
}

export class BattleGame {

    @Inject(CodeSandbox) private codeSandbox: CodeSandbox;

    private game: Phaser.Game;
    private currentState: BattleState.wait;

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
        this.game.scene.switch(BattleState.wait, newState);

        this.currentState = BattleState.wait;
    }

    runCode(code: string) {
        console.log('runCode', code);

        // this.setState(BattleState.battle);

        this.codeSandbox.eval(code)
            .then(() => {
                console.log('run success');
            })
            .catch((e) => {
                console.error(e);
            });
    }

}