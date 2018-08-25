import * as websocket from 'websocket';
import * as http from 'http';
import {ConnectionsStorage} from "./ConnectionsStorage";
import {LeaderBoard} from "./LeaderBoard";

const leaderBoard = new LeaderBoard();

const server = http.createServer((request, response) => {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.

    response.end(leaderBoard.toHTML());
});
server.listen(1337, () => {});

const WebSocketServer = websocket.server;

// create the server
const wsServer = new WebSocketServer({
    httpServer: server
});

const connectionsStorage = new ConnectionsStorage();

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

        if (data.type === 'sendWinner') {
            const state = Object.assign({}, data.sessionResult, {
                state: {
                    left: connectionsStorage.state.left,
                    right: connectionsStorage.state.right
                },
                code: {
                    left: connectionsStorage.state.left.editor.code,
                    right: connectionsStorage.state.right.editor.code
                }
            });

            leaderBoard.write(state);
            connectionsStorage.endSession(data.sessionResult);
        }

        if (data.type === 'newSession') {
            connectionsStorage.newSession();
        }

        if (data.type === 'state') {
            connectionsStorage.setState(data.state);
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