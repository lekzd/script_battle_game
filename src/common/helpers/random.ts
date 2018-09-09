
// 1993 Park-Miller LCG
export function LCG(seed: number): () => number {
    return function() {
        seed = Math.imul(16807, seed) | 0 % 2147483647;

        return (seed & 2147483647) / 2147483648;
    }
}

let randomGenerator = LCG(0);

export function getRandomSeed(seed: string): number {
    return [...seed].reduce((acc, curr) => acc + curr.charCodeAt(0), 0) % 2147483647;
}

export function setRandomSeed(seed: string) {
    const sedNumber = getRandomSeed(seed);

    randomGenerator = LCG(sedNumber);
}

export function random(): number {
    return randomGenerator();
}