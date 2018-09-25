import {ISessionResult} from "./BattleSession";
import {BattleState} from './BattleState.model';
import {BattleGameScreen} from './BattleGameScreen';

export class BattleGame {

    stateParams: any = {};
    currentState: BattleState;

    private game: BattleGameScreen;

    register(game: BattleGameScreen) {
        this.game = game;
    }

    setState(newState: BattleState, stateParams: any = {}) {
        if (this.currentState === newState) {
            return;
        }

        this.game.setGameState(BattleState.wait, newState);

        this.currentState = newState;
        this.stateParams = stateParams || {};
    }

    showResults(sessionResult: ISessionResult) {
        this.setState(BattleState.results, sessionResult);

        this.game.showResults(sessionResult);
    }

    showWinnerScreen(sessionResult: ISessionResult) {
        this.setState(BattleState.win, sessionResult);
    }

    showLoseScreen(sessionResult: ISessionResult) {
        this.setState(BattleState.lost, sessionResult);
    }
}