import {Room} from "../Room";
import * as ws from 'ws';
import {ConnectionsStorage} from './ConnectionsStorage';
import {Inject} from '../../src/common/InjectDectorator';
import {AbstractFileBasedStorage} from './AbstractFileBasedStorage';

const filePath = './.data/rooms.json';

export class RoomStorage extends AbstractFileBasedStorage {

    private rooms = new Map<string, Room>();
    private connections = new WeakMap<ws, Room>();

    @Inject(ConnectionsStorage) private guestConnectionsStorage: ConnectionsStorage;

    constructor() {
        super();

        const data = this.readFromFile(filePath);

        data.forEach(({id, title, state}) => {
            const room = new Room(title);

            room.state = state;

            this.rooms.set(id, room);
        })
    }

    saveState() {
        const data = [];

        this.rooms.forEach((room, id) => {
            data.push({
                id,
                title: room.title,
                state: room.state
            })
        })

        this.writeAllData(filePath, data);
    }

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