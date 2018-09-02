
const MIN_DISTANCE = 5;
const MAX_DISTANCE = 10;

// возвращает значение от 0.5 до 1
export function getDistanceFactor(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDistance = Math.min(Math.max(distance, MIN_DISTANCE), MAX_DISTANCE);

    return normalizedDistance / MAX_DISTANCE;
}