import * as ws from 'ws';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {Observable, fromEvent} from 'rxjs/index';
import {Inject} from '../src/common/InjectDectorator';
import {LeaderBoard} from './LeaderBoard';
import {RoomStorage} from "./RoomStorage";

export interface IClientRegisterMessage {
    type: string;
    roomId: string;
}

export class SocketMiddleware {
    connection: ws;

    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;

    get onMessage$(): Observable<any> {
        return fromEvent<MessageEvent>(this.ws, 'message')
            .pipe(
                filter(message => message.type === 'message'),
                map(message => JSON.parse(message.data)),
                tap(message => {
                    const {roomId} = message;
                    const room = this.roomStorage.get(roomId);

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

}