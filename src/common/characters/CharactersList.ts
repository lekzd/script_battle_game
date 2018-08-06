import {Inject} from "../InjectDectorator";
import {AnimationsCreator} from "./AnimationsCreator";

interface IMinMax {
    min: number;
    max: number;
}

interface IAttackTypeConfig {
    attack: IMinMax;
    defence: IMinMax;
}

export enum CharacterType {
    shooting = 'shooting',
    magic = 'magic',
    melee = 'melee'
}

interface IAttackConfigs {
    mellee: IAttackTypeConfig;
    shoot: IAttackTypeConfig;
    magic: IAttackTypeConfig;
}

export interface ICharacterConfig extends IAttackConfigs {
    id: string;
    title: string;
    type: CharacterType;
    speed: number;
}

function getCoefficents(num: number): IMinMax {
    const min = Math.max(0, num - 2);
    const max = num + 2;

    return {
        min, max
    }
}

function getAttackConfigs(mellee: number, shoot: number, magic: number): IAttackConfigs {

    const melleeConfig = {
        attack: getCoefficents(mellee),
        defence: getCoefficents(mellee)
    };

    const shootConfig = {
        attack: getCoefficents(shoot),
        defence: getCoefficents(shoot)
    };

    const magicConfig = {
        attack: getCoefficents(magic),
        defence: getCoefficents(magic)
    };


    return {
        mellee: melleeConfig,
        shoot: shootConfig,
        magic: magicConfig
    }
}

const MAGIC_GIRL: ICharacterConfig = Object.assign({
    id: 'character_magic',
    title: 'magic girl',
    type: CharacterType.magic,
    speed: 4,
}, getAttackConfigs(0, 4, 8));

const SKELETON: ICharacterConfig = Object.assign({
    id: 'character_nekr',
    title: 'skeleton',
    type: CharacterType.shooting,
    speed: 4,
}, getAttackConfigs(2, 6, 4));

const ORK: ICharacterConfig = Object.assign({
    id: 'character_ork',
    title: 'ork',
    type: CharacterType.shooting,
    speed: 4,
}, getAttackConfigs(2, 8, 0));

const PALLADIN: ICharacterConfig = Object.assign({
    id: 'character_palladin',
    title: 'palladin',
    type: CharacterType.melee,
    speed: 4,
}, getAttackConfigs(6, 6, 0));

const VARVAR: ICharacterConfig = Object.assign({
    id: 'character_varvar',
    title: 'varvar',
    type: CharacterType.melee,
    speed: 4,
}, getAttackConfigs(6, 2, 4));

const WINTER: ICharacterConfig = Object.assign({
    id: 'character_winter',
    title: 'winter',
    type: CharacterType.magic,
    speed: 4,
}, getAttackConfigs(2, 4, 6));

export class CharactersList {

    types: ICharacterConfig[] = [
        MAGIC_GIRL,
        SKELETON,
        ORK,
        PALLADIN,
        VARVAR,
        WINTER
    ];

    @Inject(AnimationsCreator) private animationsCreator: AnimationsCreator;

    load(loader: Phaser.Loader.LoaderPlugin) {
        this.types.forEach(type => {
            loader.atlas(type.id, `img/${type.id}.png`, 'img/sprites.json');
        });
    }

    prepareAnimations(phaserAnims: any) {
        this.types.forEach(type => {
            this.animationsCreator.create(phaserAnims, type.id);
        });
    }

    get(typeId: string): ICharacterConfig {
        return this.types.find(type => type.id === typeId);
    }

    getRandomType(): string {
        const randomIndex = Math.floor(Math.random() * this.types.length);

        return this.types[randomIndex].id;
    }

}