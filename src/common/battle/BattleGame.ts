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
        this.game.scene.switch(BattleState.wait, newState);

        this.currentState = newState;
    }

    runCode(code: string) {
        console.log('runCode', code);

        this.codeSandbox.eval(code)
            .then((actions) => {
                this.setState(BattleState.battle);

                const battleView = <BattleView>this.game.scene.getScene(BattleState.battle);

                battleView.runCode$.next([actions, []]);
            })
            .catch((e) => {
                console.error(e);
            });
    }

}