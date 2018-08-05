import {BattleUnit} from "./BattleUnit";

export function getBattleApi(unit: BattleUnit) {
    return {
        character: unit.character,
        health: unit.health
    }
}