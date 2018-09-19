import * as express from 'express';
import * as cors from 'cors';
import * as argsParser from 'args-parser';
import * as expressWs from 'express-ws';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import {SocketMiddleware} from './SocketMiddleware';
import {ApiController} from "./ApiController";

const {app} = expressWs(express());
const args = argsParser(process.argv);

expressWs(app);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
    origin: args.port === 80 ? '' : 'http://localhost:8080',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use('/api', cors(corsOptions));
app.options('*', cors(corsOptions));

const {router} = new ApiController(express.Router());

app.use('/api', router);

app.ws('/', (ws, request) => {

    new SocketMiddleware(ws);

});

app.use('*', (request, response) => {
    response.send('OK');
});

app.listen(args.port || 80);