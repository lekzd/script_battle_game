
export class WebsocketConnection {
    private connection: WebSocket;

    constructor() {
        this.connection = new WebSocket('ws://localhost:1337');

        this.connection.onopen = function () {
            // connection is opened and ready to use
        };

        this.connection.onerror = function (error) {
            // an error occurred when sending/receiving data
        };

        this.connection.onmessage = function (message) {
            // try to decode json (I assume that each message
            // from server is json)
            try {
                const json = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ',
                    message.data);
                return;
            }
            // handle incoming message
        };
    }

    send(message: string) {
        this.connection.send(message);
    }
}