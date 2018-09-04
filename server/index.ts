import * as express from 'express';
import * as cors from 'cors';
import * as expressWs from 'express-ws';
import {SocketMiddleware} from './SocketMiddleware';
import {ApiController} from "./ApiController";

const {app} = expressWs(express());

expressWs(app);

app.use(express.static('public'));

app.use(cors());

const {router} = new ApiController(express.Router());

app.use('/api', router);

app.ws('/', (ws, request) => {

    new SocketMiddleware(ws);

});

app.use('*', (request, response) => {
    response.send('OK');
});

app.listen(1337);