import {Component, h} from 'preact';
import {BattleState} from "./BattleState.model";
import Phaser from "phaser";
import {WaitingView} from "./views/WaitingView";
import {BattleView} from "./views/BattleView";
import {AttentionView} from "./views/AttentionView";
import {ResultsView} from "./views/ResultsView";
import {WinView} from "./views/WinView";
import {LostView} from "./views/LostView";
import {ConnectionClosedView} from "./views/ConnectionClosedView";
import {ISessionResult} from "./BattleSession";
import { Observable } from 'rxjs/internal/Observable';

interface IComponentState {
}

interface IProps {
    runCode$: Observable<[string, string]>;
}

export class BattleGameScreen extends Component<IProps, IComponentState> {

    state: IComponentState = {};
    stateParams: any = {};
    currentState: BattleState;

    private game: Phaser.Game;

    componentDidMount() {
        this.props.runCode$.subscribe(([leftCode, rightCode]) => {
            this.runCode(leftCode, rightCode);
        })
    }

    shouldComponentUpdate(): boolean {
        return false;
    }

    render(props: IProps, state: IComponentState) {
        return (
            <div ref={ref => this.initGame(ref)} class="playerDisplay" />
        );
    }

    setGameState(newState: BattleState, stateParams: any = {}) {
        if (this.currentState === newState) {
            return;
        }

        this.game.scene.switch(BattleState.wait, newState);

        this.currentState = newState;
        this.stateParams = stateParams || {};
    }

    runCode(leftCode: string, rightCode: string) {
        this.setState(BattleState.battle);

        const battleView = this.game.scene.getScene(BattleState.battle) as BattleView;

            battleView.runCode$.next([leftCode, rightCode]);
    }

    showResults(sessionResult: ISessionResult) {
        this.setGameState(BattleState.results, sessionResult);

        const resultsView = this.game.scene.getScene(BattleState.results) as ResultsView;

        resultsView.setResults(sessionResult);
    }

    showWinnerScreen(sessionResult: ISessionResult) {
        this.setGameState(BattleState.win, sessionResult);
    }

    showLoseScreen(sessionResult: ISessionResult) {
        this.setGameState(BattleState.lost, sessionResult);
    }

    private initGame(parent: HTMLElement) {
        const config = {
            type: Phaser.AUTO,
            width: 400,
            height: 275,
            parent,
            scene: [WaitingView, BattleView, AttentionView, ResultsView, WinView, LostView, ConnectionClosedView]
        };

        this.game = new Phaser.Game(config);
    }
}