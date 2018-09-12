
import {ISessionResult} from '../../src/common/battle/BattleSession';
import {AbstractFileBasedStorage} from './AbstractFileBasedStorage';

const filePath = './.data/leaderboard.json';

export class LeaderBoard extends AbstractFileBasedStorage {

    data = [];

    constructor() {
        super();

        this.data = this.readFromFile(filePath);
    }

    write(sessionResult: ISessionResult) {
        const item = Object.assign({}, sessionResult, {
            time: Date.now()
        });

        this.data.push(item);

        this.writeToFile(filePath, item)
    }
}