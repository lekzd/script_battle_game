
export class RoomService {

    get params(): URLSearchParams {
        return new URLSearchParams(location.hash.substr(1));
    }

    get roomId(): string {
        return this.params.get('room');
    }

    constructor() {
    }
}