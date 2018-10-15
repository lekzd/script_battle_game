import * as ws from 'ws';
import {catchError, filter, first, map, tap} from 'rxjs/operators';
import {Observable, fromEvent, throwError, merge} from 'rxjs';
import {Inject} from '../src/common/InjectDectorator';
import {LeaderBoard} from './storages/LeaderBoard';
import {RoomStorage} from "./storages/RoomStorage";
import {ConnectionsStorage} from './storages/ConnectionsStorage';
import {IMessage} from '../src/common/WebsocketConnection';

export interface IClientRegisterMessage {
    type: string;
    roomId: string;
}

export class SocketMiddleware {
    connection: ws;

    @Inject(LeaderBoard) private leaderBoard: LeaderBoard;
    @Inject(RoomStorage) private roomStorage: RoomStorage;
    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

    // get onMessage$(): Observable<any> {
    //     return fromEvent<MessageEvent>(this.ws, 'message')
    //         .pipe(
    //             filter(message => message.type === 'message'),
    //             map(message => JSON.parse(message.data)),
    //             tap(message => {
    //                 // todo: temporary
    //                 if (this.isAdminMessage(message)) {
    //                     return this.tryRegisterGuestConnection(message, this.connection);
    //                 }
    //
    //                 const {roomId} = message;
    //                 const room = this.roomStorage.get(roomId);
    //
    //                 if (!room) {
    //                     this.connection.close();
    //
    //                     return throwError(`room id ${roomId} is not found`);
    //                 }
    //
    //                 this.roomStorage.addConnection(this.connection, room);
    //
    //                 return room.tryRegisterConnection(message, this.connection);
    //             }),
    //             filter(message => !this.isAdminMessage(message)),
    //             catchError(error => {
    //                 console.log(error);
    //
    //                 return [];
    //             })
    //         )
    // }

    get onRegisterMessage$(): Observable<IClientRegisterMessage> {
        return fromEvent<MessageEvent>(this.ws, 'message')
            .pipe(
                filter(message => message.type === 'message'),
                first(),
                map(message => JSON.parse(message.data)),
                filter(message => message.type.startsWith('register'))
            )
    }

    get onClose$(): Observable<void> {
        return fromEvent(this.ws, 'close');
    }

    get onGuestRegister$(): Observable<IClientRegisterMessage> {
        return merge(
            this.onRegister$('registerGuest'),
            this.onRegister$('registerAdmin')
        )
            .pipe(
                tap(message => {
                    this.tryRegisterGuestConnection(message, this.connection);
                })
            )
    }

    get onRoomMemberRegister$(): Observable<IClientRegisterMessage> {
        return merge(
            this.onRegister$('registerMaster'),
            this.onRegister$('registerLeftPlayer'),
            this.onRegister$('registerRightPlayer')
        )
            .pipe(
                tap(message => {
                    const {roomId} = message;
                    const room = this.roomStorage.get(roomId);

                    if (!room) {
                        this.connection.close();

                        return throwError(`room id ${roomId} is not found`);
                    }

                    this.roomStorage.addConnection(this.connection, room);

                    room.tryRegisterConnection(message, this.connection);
                })
            )
    }

    constructor(private ws: ws) {

        this.connection = <any>ws;

        this.onClose$.subscribe(() => {
            const room = this.roomStorage.getRoomByConnection(this.connection);

            if (room) {
                room.onConnectionLost(this.connection);
                this.guestConnectionsStorage.dispatchRoomsChanged();
            }
        });

        // this.onMessage$.subscribe(message => {
        //     const {roomId} = message;
        //     const room = roomId ? this.roomStorage.get(roomId) : null;
        //
        //     if (room) {
        //         room.onMessage$.next(message);
        //     } else {
        //         console.error(`room id ${roomId} is not found`);
        //     }
        // });

        merge(
            this.onGuestRegister$,
            this.onRoomMemberRegister$
        )
            .pipe(
                catchError(error => {
                    console.log(error);

                    return [];
                })
            )
            .subscribe();
    }

    private onRegister$(type: string): Observable<IClientRegisterMessage> {
        return this.onRegisterMessage$
            .pipe(
                filter(message => message.type === type)
            )
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

    private isAdminMessage(message: IMessage): boolean {
        return message.type === 'registerGuest' || message.type === 'registerAdmin';
    }

}