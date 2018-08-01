import {WebsocketConnection} from '../common/WebsocketConnection';
import {Inject, setInject} from '../common/InjectDectorator';
import {Server} from '../common/Server';
import Phaser from 'phaser';
import {CharactersList} from "../common/characters/CharactersList";
import {Router} from '../common/router/Router';
import {WaitingView} from './views/WaitingView';
import {BattleView} from './views/BattleView';
import {ResultsView} from './views/ResultsView';

export class MasterApp {

    @Inject(Router) private router: Router;
    @Inject(CharactersList) private charactersList: CharactersList;

    constructor() {
        const connection = new WebsocketConnection();

        setInject(Server, connection);

        this.router.setConfig({
            waiting: WaitingView,
            battle: BattleView,
            results: ResultsView
        });

        console.log('connection', connection);
        console.log('Phaser', Phaser);

        const config = {
            type: Phaser.AUTO,
            width: 400,
            height: 300,
            parent: 'display',
            scene: {
                preload: preload,
                create: create
            }
        };

        const game = new Phaser.Game(config);
        const self = this;

        function preload () {
            this.load.setBaseURL('http://localhost:8080');

            self.charactersList.load(this.load);
        }

        function create () {
            self.charactersList.prepareAnimations(this.anims);

            for (let i = 0; i <= 4; i++) {
                self.charactersList.drawRandomCharacter(this.add, i, true);
            }

            for (let i = 0; i <= 4; i++) {
                self.charactersList.drawRandomCharacter(this.add, i, false);
            }

        }
    }

}