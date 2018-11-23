import Phaser from 'phaser';
import {Inject} from "../../InjectDectorator";
import {CharactersList} from "../../characters/CharactersList";
import {WebsocketConnection} from "../../WebsocketConnection";
import {Environment} from '../../Environment';
import {font} from '../../helpers/font';

export class WaitingView extends Phaser.Scene {

    @Inject(Environment) private environment: Environment;
    @Inject(CharactersList) private charactersList: CharactersList;
    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    constructor() {
        super({
            key: 'waiting'
        });
    }

    preload () {
        this.load.setBaseURL(this.environment.config.staticHost);

        this.load.image('arrow', '/img/arrow.png');
        this.load.image('snow', '/img/snow.png');
        this.load.image('fire', '/img/fire.png');
        this.load.image('stone', '/img/stone.png');

        this.charactersList.load(this.load);

        const text = this.add.text(200, 150, 'Connecting...', {
            font: font(16),
            align: 'right',
            fill: '#00ff00'
        });

        text.setOrigin(0.5);
    }

    create() {

        if (!this.connection.isMaster) {
            setTimeout(() => {
                this.scene.switch('battle');
            }, 1000);
        }
    }
}