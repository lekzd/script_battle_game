import {BattleSide} from './battle/BattleSide';
import {WinnerSide} from './battle/BattleSession';

export interface IPlayerState {
    name: string;
    side: BattleSide;

    army: {
        0: string;
        1: string;
        2: string;
        3: string;
    };

    editor: {
        code: string;
        scrollX: number;
        scrollY: number;
        cursorX: number;
        cursorY: number;
    }
}

export interface IState {
    left: IPlayerState;
    right: IPlayerState;
    damage: {
        left: number;
        right: number;
    },
    winner: WinnerSide;
}