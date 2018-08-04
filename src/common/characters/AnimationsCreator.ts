
const actions = [
    {
        name: 'spellcast',
        frames: 7
    },
    {
        name: 'thrust',
        frames: 8
    },
    {
        name: 'walk',
        frames: 9
    },
    {
        name: 'slash',
        frames: 6
    },
    {
        name: 'shoot',
        frames: 13
    },
    {
        name: 'idle',
        frames: 1
    }
];

const turns = ['top', 'left', 'bottom', 'right'];

export class AnimationsCreator {
    create(phaserAnims: any, characterName: string) {

        actions.forEach(({name, frames}) => {
            turns.forEach(turn => {
                phaserAnims.create({
                    key: `${characterName}_${name}_${turn}`,
                    frames: phaserAnims.generateFrameNames(characterName, {
                        prefix: `${name}_${turn}_`,
                        end: frames - 1
                    }),
                    frameRate: 10,
                    repeat: -1
                });
            })
        });
    }
}