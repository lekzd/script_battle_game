import {Room} from "./Room";

export class RoomStorage {

    private rooms = new Map<string, Room>();

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

}