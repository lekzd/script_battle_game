import {Router} from "express";
import {Inject} from "../src/common/InjectDectorator";
import {LeaderBoard} from "./LeaderBoard";
import {RoomStorage} from "./RoomStorage";
import {RoomModel} from "./models/RoomModel";

export class ApiController {
    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;

    constructor(public router: Router) {

        router.get('/leaderboard', (request, response) => {
            response.json(this.leaderBoard.data);
        });

        router.get('/rooms', (request, response) => {
            this.roomStorage.get(request.params.name);

            const rooms = this.roomStorage.getAll();
            const result = {};

            Object.keys(rooms).forEach(name => {
                result[name] = new RoomModel(rooms[name]);
            });

            response.json({result});
        });

        router.post('/rooms/:id', (request, response) => {
            this.roomStorage.createNew(request.params.id, request.body.title);

            response.json({result: 'OK'});
        });

        router.delete('/rooms/:name', (request, response) => {
            this.roomStorage.delete(request.params.name);

            response.json({result: 'OK'});
        });

        router.get('/rooms/:name', (request, response) => {
            this.roomStorage.get(request.params.name);

            const result = new RoomModel(this.roomStorage.get(request.params.name));

            response.json({result});
        });
    }

}