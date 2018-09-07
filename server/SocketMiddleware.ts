import * as ws from 'ws';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {Observable, fromEvent, throwError} from 'rxjs/index';
import {Inject} from '../src/common/InjectDectorator';
import {LeaderBoard} from './LeaderBoard';
import {RoomStorage} from "./RoomStorage";
import {ConnectionsStorage} from './ConnectionsStorage';

export interface IClientRegisterMessage {
    type: string;
    roomId: string;
}

export class SocketMiddleware {
    connection: ws;

    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;
    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

    get onMessage$(): Observable<any> {
        return fromEvent<MessageEvent>(this.ws, 'message')
            .pipe(
                filter(message => message.type === 'message'),
                map(message => JSON.parse(message.data)),
                tap(message => {
                    const {roomId} = message;
                    const room = this.roomStorage.get(roomId);

                    // todo: temporary
                    if (message.type === 'registerGuest') {
                        return this.tryRegisterGuestConnection(message, this.connection);
                    }

                    if (!room) {
                        this.connection.close();

                        return throwError(`room id ${roomId} is not found`);
                    }

                    this.roomStorage.addConnection(this.connection, room);

                    return room.tryRegisterConnection(message, this.connection);
                }),
                catchError(error => {
                    console.log(error);

                    return [];
                })
            )
    }

    get onClose$(): Observable<void> {
        return fromEvent(this.ws, 'close');
    }

    constructor(private ws: ws) {

        this.connection = <any>ws;

        this.onClose$.subscribe(() => {
            const room = this.roomStorage.getRoomByConnection(this.connection);

            if (room) {
                room.onConnectionLost(this.connection);
                this.guestConnectionsStorage.guest.dispatchRoomsChanged();
            }
        });

        this.onMessage$.subscribe(message => {
            const {roomId} = message;
            const room = this.roomStorage.get(roomId);

            if (room) {
                room.onMessage$.next(message);
            } else {
                console.error(`room id ${roomId} is not found`);
            }
        });
    }

    private tryRegisterGuestConnection(data: IClientRegisterMessage, connection: ws) {
        if (!this.guestConnectionsStorage.isRegistered(connection)) {
            this.guestConnectionsStorage.registerConnection(data, connection);

            if (!this.guestConnectionsStorage.isRegistered(connection)) {
                connection.close();

                return;
            }

            return;
        }
    }

}