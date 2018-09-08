import * as express from 'express';
import * as cors from 'cors';
import * as argsParser from 'args-parser';
import * as expressWs from 'express-ws';
import * as bodyParser from 'body-parser';
import {SocketMiddleware} from './SocketMiddleware';
import {ApiController} from "./ApiController";

const {app} = expressWs(express());
const args = argsParser(process.argv);

expressWs(app);

app.use(express.static('public'));

// parse application/json
app.use(bodyParser.json());

app.use(cors());
app.options('*', cors());

const {router} = new ApiController(express.Router());

app.use('/api', router);

app.ws('/', (ws, request) => {

    new SocketMiddleware(ws);

});

app.use('*', (request, response) => {
    response.send('OK');
});

app.listen(args.port || 80);