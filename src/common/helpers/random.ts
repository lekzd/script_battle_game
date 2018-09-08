
// 1993 Park-Miller LCG
function LCG(seed: number): () => number {
    return function() {
        seed = Math.imul(16807, seed) | 0 % 2147483647;

        return (seed & 2147483647) / 2147483648;
    }
}

let randomGenerator = LCG(0);

export function setRandomSeed(seed: string) {
    const sedNumber = [...seed].reduce((acc, curr) => acc + curr.charCodeAt(0), 0) % 2147483647;

    randomGenerator = LCG(sedNumber);
}

export function random(): number {
    return randomGenerator();
}