import * as express from 'express';
import * as cors from 'cors';
import * as expressWs from 'express-ws';
import {ConnectionsStorage} from "./ConnectionsStorage";
import {LeaderBoard} from "./LeaderBoard";
import {inject} from '../src/common/InjectDectorator';
import {SocketMiddleware} from './SocketMiddleware';

const {app} = expressWs(express());

expressWs(app);

app.use(express.static('public'));

app.use(cors());

app.get('/leaderboard', (request, response) => {
    const leaderBoard = inject<LeaderBoard>(LeaderBoard);

    response.json(leaderBoard.data);
});

app.get('/state$', (request, response) => {
    const connectionsStorage = inject<ConnectionsStorage>(ConnectionsStorage);

    response.json(connectionsStorage.state);
});

app.ws('/', (ws, request) => {

    new SocketMiddleware(ws);

});

app.use('*', (request, response) => {
    response.send('OK');
});

app.listen(1337);