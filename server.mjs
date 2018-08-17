import websocket from 'websocket';
import http from 'http';
import {ConnectionsStorage} from "./server/ConnectionsStorage";
import {LeaderBoard} from "./server/LeaderBoard.mjs";

const server = http.createServer((request, response) => {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.

    response.end('OK');
});
server.listen(1337, () => {});

const WebSocketServer = websocket.server;

// create the server
const wsServer = new WebSocketServer({
    httpServer: server
});

const connectionsStorage = new ConnectionsStorage();
const leaderBoard = new LeaderBoard();

// WebSocket server
wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);

    function onMessage(data) {
        if (!connectionsStorage.isRegistered(connection)) {
            connectionsStorage.registerConnection(data, connection);

            if (!connectionsStorage.isRegistered(connection)) {
                connection.close();

                return;
            }

            return;
        }

        if (data.type === 'leftCode') {
            connectionsStorage.setLeftCode(data.code);
        }

        if (data.type === 'rightCode') {
            connectionsStorage.setRightCode(data.code);
        }

        if (data.type === 'leftState') {
            connectionsStorage.setLeftState(data.state);
        }

        if (data.type === 'rightState') {
            connectionsStorage.setRightState(data.state);
        }

        if (data.type === 'pushLeftCode') {
            connectionsStorage.pushLeftCode(data.code);
        }

        if (data.type === 'pushRightCode') {
            connectionsStorage.pushRightCode(data.code);
        }

        if (data.type === 'pushRightCode') {
            connectionsStorage.pushRightCode(data.code);
        }

        if (data.type === 'sendWinner') {
            const state = Object.assign({}, data.sessionResult, {
                state: {
                    left: connectionsStorage.leftPlayer.state,
                    right: connectionsStorage.rightPlayer.state
                },
                code: {
                    left: connectionsStorage.leftPlayer.code,
                    right: connectionsStorage.rightPlayer.code
                }
            });

            leaderBoard.write(state);
            connectionsStorage.endSession(data.sessionResult);
        }

        if (data.type === 'newSession') {
            connectionsStorage.newSession();
        }

        console.log('message', data);
    }

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            try {
                onMessage(JSON.parse(message.utf8Data));
            } catch (e) {
                console.error(e);
            }
            // process WebSocket message
        }
    });

    connection.on('close', () => {
        connectionsStorage.onConnectionLost(connection);
    });
});