import {Router} from "express";
import {Inject} from "../src/common/InjectDectorator";
import {LeaderBoard} from "./LeaderBoard";
import {RoomStorage} from "./RoomStorage";
import {RoomModel} from "./models/RoomModel";

interface IResponse {
    result: any;
    success: boolean;
    error?: string;
}

export class ApiController {
    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;

    constructor(public router: Router) {

        router.get('/leaderboard', (request, response) => {
            const output = this.getSafeResult(() => this.leaderBoard.data);

            response.json(output);
        });

        router.get('/rooms', (request, response) => {
            const output = this.getSafeResult(() => {
                const rooms = this.roomStorage.getAll();
                const result = {};

                Object.keys(rooms).forEach(name => {
                    result[name] = new RoomModel(rooms[name]);
                });

                return result;
            });

            response.json(output);
        });

        router.post('/rooms/:id', (request, response) => {
            const output = this.getSafeResult(() => {
                this.roomStorage.createNew(request.params.id, request.body.title);

                return 'OK';
            });

            response.json(output);
        });

        router.post('/rooms/:id/reload', (request, response) => {
            const output = this.getSafeResult(() => {
                this.roomStorage.reloadRoomSession(request.params.id);

                return 'OK';
            });

            response.json(output);
        });

        router.delete('/rooms/:id', (request, response) => {
            const output = this.getSafeResult(() => {
                this.roomStorage.delete(request.params.id);

                return 'OK';
            });

            response.json(output);
        });

        router.get('/rooms/:id', (request, response) => {
            const output = this.getSafeResult(() => {
                return new RoomModel(this.roomStorage.get(request.params.id));;
            });

            response.json(output);
        });
    }

    private getSafeResult(dataCallback: () => any): IResponse {
        let result = null;
        let error = null;
        let success = false;

        try {
            success = true;
            result = dataCallback();
        } catch (e) {
            success = false;
            error = e.message
        }

        return {result, success, error};
    }

}