import {Component, h} from 'preact';
import {CharacterType, ICharacterConfig} from "../../common/characters/CharactersList";

interface IComponentState {
}

interface IProps {
    characterConfig: ICharacterConfig,
    onChoose: () => any
}

export class UnitItem extends Component<IProps, IComponentState> {

    state: IComponentState = {};

    componentDidMount() {
    }

    render({characterConfig, onChoose}: IProps, state: IComponentState) {
        return (
            <section class="unit" onClick={onChoose}>
                <div class={`unit-img ${characterConfig.key}`} />
                <div class="unit-description">
                    <div class="unit-id">
                        {characterConfig.id}
                        <span class={`unit-type ${characterConfig.type}`}>{this.getCharacterType(characterConfig)}</span>
                        <br />
                        <span class="unit-grey">{characterConfig.title}</span>
                    </div>
                    <div class="unit-values">
                        <div class="unit-grey">attack / defence</div>
                        <div class="unit-mellee">
                            <span class="unit-grey">melee</span> {characterConfig.mellee.attack.max} / {characterConfig.mellee.defence.max}
                        </div>
                        <div class="unit-shooting">
                            <span class="unit-grey">shooting</span> {characterConfig.shoot.attack.max} / {characterConfig.shoot.defence.max}
                        </div>
                        <div class="unit-magic">
                            <span class="unit-grey">magic</span> {characterConfig.magic.attack.max} / {characterConfig.magic.defence.max}
                        </div>
                        <div class="unit-speed">
                            <span class="unit-grey">speed</span> {characterConfig.speed}
                        </div>
                    </div>

                </div>
            </section>
        );
    }

    private getCharacterType(config: ICharacterConfig): string {
        switch (config.type) {
            case CharacterType.magic:
                return 'Magician';
            case CharacterType.shooting:
                return 'Shooter';
            case CharacterType.melee:
                return 'Infantry';
        }
    }

}