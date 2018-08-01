import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject, setInject} from '../common/InjectDectorator';
import {Server} from '../common/Server';
import Phaser from 'phaser';
import {CharactersList} from "../common/characters/CharactersList";
import {Router} from '../common/router/Router';
import {BattleView} from './views/BattleView';
import {WaitingView} from "./views/WaitingView";

export class MasterApp {

    @Inject(Router) private router: Router;
    @Inject(CharactersList) private charactersList: CharactersList;

    constructor() {
        const connection = new WebsocketConnection();

        setInject(Server, connection);

        console.log('connection', connection);

        const config = {
            type: Phaser.AUTO,
            width: 400,
            height: 300,
            parent: 'display',
            scene: [WaitingView, BattleView]
        };

        const game = new Phaser.Game(config);

    }

}