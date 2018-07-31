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

enum CharacterType {
    shooting,
    magic,
    melee
}

interface IAttackConfigs {
    mellee: IAttackTypeConfig;
    shoot: IAttackTypeConfig;
    magic: IAttackTypeConfig;
}

interface ICharacterConfig extends IAttackConfigs {
    id: string;
    title: string;
    type: CharacterType;
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
    type: CharacterType.magic
}, getAttackConfigs(0, 4, 8));

const SKELETON: ICharacterConfig = Object.assign({
    id: 'character_nekr',
    title: 'skeleton',
    type: CharacterType.shooting
}, getAttackConfigs(2, 6, 4));

const ORK: ICharacterConfig = Object.assign({
    id: 'character_ork',
    title: 'ork',
    type: CharacterType.shooting
}, getAttackConfigs(2, 8, 0));

const PALLADIN: ICharacterConfig = Object.assign({
    id: 'character_palladin',
    title: 'palladin',
    type: CharacterType.melee
}, getAttackConfigs(6, 6, 0));

const VARVAR: ICharacterConfig = Object.assign({
    id: 'character_varvar',
    title: 'varvar',
    type: CharacterType.melee
}, getAttackConfigs(6, 2, 4));

const WINTER: ICharacterConfig = Object.assign({
    id: 'character_winter',
    title: 'winter',
    type: CharacterType.magic
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

    drawRandomCharacter(factory: Phaser.GameObjects.GameObjectFactory, index: number, friend: boolean) {
        const left = friend ? 100 : 300;
        const top = (index * 75) - 32;
        const randomIndex = Math.floor(Math.random() * this.types.length);
        const characterId = this.types[randomIndex].id;
        const characterAnimation = friend ? `${characterId}_slash_right` : `${characterId}_slash_left`;

        factory.sprite(left, top, characterId).play(characterAnimation, false, 0);
    }

}