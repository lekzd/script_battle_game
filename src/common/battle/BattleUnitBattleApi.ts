import {BattleUnit} from "./BattleUnit";

export function getBattleApi(unit: BattleUnit) {
    return {
        character: unit.character,
        health: unit.health,
        id: unit.id,
        x: unit.x,
        y: unit.y
    }
}