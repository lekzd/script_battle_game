import {Room} from "./Room";
import {connection} from "websocket";

export class RoomStorage {

    private rooms = new Map<string, Room>();
    private connections = new WeakMap<connection, Room>();

    createNew(name: string) {
        this.rooms.set(name, new Room());
    }

    delete(name: string) {
        this.rooms.delete(name);
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

    addConnection(connection: connection, room: Room) {
        this.connections.set(connection, room);
    }

    getRoomByConnection(connection: connection): Room {
        return this.connections.get(connection);
    }

}