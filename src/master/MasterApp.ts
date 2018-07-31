import {WebsocketConnection} from '../common/WebsocketConnection';
import {setInject} from '../common/InjectDectorator';
import {Server} from '../common/Server';
import 'p2/build/p2';
import 'pixi.js/dist/pixi';
import * as Phaser from 'phaser-ce';

export class MasterApp {

    constructor() {
        const connection = new WebsocketConnection();

        setInject(Server, connection);

        console.log('connection', connection);
        console.log('Phaser', Phaser);

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            scene: {
                preload: preload,
                create: create
            }
        };

        const game = new Phaser.Game(config);

        function preload () {
            this.load.setBaseURL('http://localhost:8080');

            this.load.image('character_magic', 'img/character_magic.png');
        }

        function create () {
            this.add.image(400, 300, 'character_magic');
        }
    }

}