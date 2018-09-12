import {Room} from "./Room";
import * as ws from 'ws';
import {ConnectionsStorage} from './ConnectionsStorage';
import {Inject} from '../src/common/InjectDectorator';

export class RoomStorage {

    private rooms = new Map<string, Room>();
    private connections = new WeakMap<ws, Room>();

    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

    createNew(id: string, title: string) {
        this.rooms.set(id, new Room(title));

        this.guestConnectionsStorage.dispatchRoomsChanged();
    }

    delete(roomId: string) {
        const room = this.get(roomId);

        room.closeConnections();
        this.rooms.delete(roomId);

        this.guestConnectionsStorage.dispatchRoomsChanged();
    }

    get(roomId: string): Room {
        const room = this.rooms.get(roomId);

        if (!room) {
            throw Error(`No room with id ${roomId}`);
        }

        return room;
    }

    getAll(): {[key: string]: Room} {
        const result = {};

        this.rooms.forEach((room, name) => {
            result[name] = room;
        });

        return result;
    }

    addConnection(connection: ws, room: Room) {
        this.connections.set(connection, room);
    }

    getRoomByConnection(connection: ws): Room {
        return this.connections.get(connection);
    }

    reloadRoomSession(roomId: string) {
        const room = this.get(roomId);

        room.reloadSession();
    }

}