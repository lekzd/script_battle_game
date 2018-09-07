import {Room} from "./Room";
import * as ws from 'ws';
import {ConnectionsStorage} from './ConnectionsStorage';
import {Inject} from '../src/common/InjectDectorator';

export class RoomStorage {

    private rooms = new Map<string, Room>();
    private connections = new WeakMap<ws, Room>();

    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

    createNew(name: string) {
        this.rooms.set(name, new Room());

        this.guestConnectionsStorage.guest.dispatchRoomsChanged();
    }

    delete(name: string) {
        const room = this.get(name);

        if (room) {
            room.closeConnections();
            this.rooms.delete(name);

            this.guestConnectionsStorage.guest.dispatchRoomsChanged();
        }
    }

    get(name: string): Room {
        return this.rooms.get(name);
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

}