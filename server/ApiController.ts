import {Request, Router} from "express";
import {Inject} from "../src/common/InjectDectorator";
import {LeaderBoard} from "./storages/LeaderBoard";
import {RoomStorage} from "./storages/RoomStorage";
import {RoomModel} from "./models/RoomModel";
import {IApiFullResponse} from './models/IApiFullResponse.model';
import {ConnectionsStorage} from './storages/ConnectionsStorage';

export class ApiController {
    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;
    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

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
                this.checkTokenOrThrow(request);

                this.roomStorage.createNew(request.params.id, request.body.title);

                return 'OK';
            });

            response.json(output);
        });

        router.post('/rooms/save', (request, response) => {
            const output = this.getSafeResult(() => {
                this.checkTokenOrThrow(request);

                this.roomStorage.saveState();

                return 'OK';
            });

            response.json(output);
        });

        router.post('/rooms/:id/reload', (request, response) => {
            const output = this.getSafeResult(() => {
                this.checkTokenOrThrow(request);

                this.roomStorage.reloadRoomSession(request.params.id);

                return 'OK';
            });

            response.json(output);
        });

        router.delete('/rooms/:id', (request, response) => {
            const output = this.getSafeResult(() => {
                this.checkTokenOrThrow(request);

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

    private getSafeResult(dataCallback: () => any): IApiFullResponse {
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

    private checkTokenOrThrow(request: Request) {
        const token = request.query.token || request.params.token || request.body.token;

        if (!this.guestConnectionsStorage.admin.checkToken(token)) {
            throw Error('Invalid token');
        }
    }

}