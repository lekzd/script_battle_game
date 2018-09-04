import {Router} from "express";
import {Inject} from "../src/common/InjectDectorator";
import {LeaderBoard} from "./LeaderBoard";
import {ConnectionsStorage} from "./ConnectionsStorage";

export class ApiController {
    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(ConnectionsStorage) private connectionsStorage: ConnectionsStorage;

    constructor(public router: Router) {

        router.get('/leaderboard', (request, response) => {
            response.json(this.leaderBoard.data);
        });

        router.get('/state', (request, response) => {
            response.json(this.connectionsStorage.state);
        });
    }

}