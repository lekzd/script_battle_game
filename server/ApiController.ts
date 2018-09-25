import {Request, Router} from "express";
import * as passport from 'passport';
import {Inject} from "../src/common/InjectDectorator";
import {LeaderBoard} from "./storages/LeaderBoard";
import {RoomStorage} from "./storages/RoomStorage";
import {RoomModel} from "./models/RoomModel";
import {IApiFullResponse} from './models/IApiFullResponse.model';
import {ConnectionsStorage} from './storages/ConnectionsStorage';
import {BattleState} from '../src/common/battle/BattleState.model';
import {AuthController} from "./AuthController";

export class ApiController {
    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;
    @Inject(AuthController) private authController: AuthController;
    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

    constructor(public router: Router) {

        passport.use(this.authController.cookiesMiddleware());
        passport.use(this.authController.localMiddleware());

        router.get('/authData', this.authController.checkAuth(), (req, response) => {
            const output = this.getSafeResult(() => req.user);

            response.json(output);
        });

        router.post('/logout', this.authController.checkAuth(), (req, response) => {
            const output = this.getSafeResult(() => 'OK');

            response.clearCookie('token');

            response.json(output);
        });

        router.post('/login', this.authController.authenticate(), (req, response) => {
            const output = this.getSafeResult(() => req.user);

            response.cookie('token', this.authController.lastToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
                signed: true
            });

            response.json(output);
        });

        router.get('/leaderboard', (request, response) => {
            const output = this.getSafeResult(() => this.leaderBoard.data);

            response.json(output);
        });

        router.get('/rooms', (request, response) => {
            const output = this.getSafeResult(() => {
                const rooms = this.roomStorage.getAll();
                const result = {};

                if (request.query.isAll) {
                    Object.keys(rooms).forEach(name => {
                        const room = rooms[name];

                        result[name] = new RoomModel(room);
                    });

                } else {
                    Object.keys(rooms).forEach(name => {
                        const room = rooms[name];

                        if (room.state.mode !== BattleState.wait) {
                            result[name] = new RoomModel(room);
                        }
                    });
                }

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

        router.post('/saveRoomState', (request, response) => {
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
            console.log('Invalid token:', request.method, request.url);

            throw Error('Invalid token');
        }
    }

}