import {Room} from "./Room";
import * as ws from 'ws';

export class RoomStorage {

    private rooms = new Map<string, Room>();
    private connections = new WeakMap<ws, Room>();

    createNew(name: string) {
        this.rooms.set(name, new Room());
    }

    delete(name: string) {
        const room = this.get(name);

        if (room) {
            room.closeConnections();
            this.rooms.delete(name);
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