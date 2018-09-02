import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

const leaderBoardPath = './public/leaderboard.json';

export class LeaderBoard {

    data = [];

    constructor() {
        this.createFileIfNotExists(leaderBoardPath);

        const contents = fs.readFileSync(leaderBoardPath, 'utf8');

        try {
            this.data = JSON.parse(contents.toString());
        } catch (e) {
            this.data = [];
        }
    }

    write(sessionResult) {
        const item = Object.assign({}, sessionResult, {
            time: Date.now()
        });

        this.data.push(item);

        this.writeToFile(leaderBoardPath, item)
    }

    toHTML() {
        return `
            <table>
                ${this.data.map(row => `
                    <tr>
                        <td>${row.winner}</td>
                        <td>${row.state.left.name}</td>
                        <td>${row.damage.left}</td>
                        <td>${row.state.right.name}</td>
                        <td>${row.damage.right}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }

    private writeToFile(filePath: string, item) {
        this.createFileIfNotExists(filePath);

        const contents = fs.readFileSync(filePath, 'utf8');
        let data = [];

        try {
            data = JSON.parse(contents.toString());
        } catch (e) {
            data = [];
        }

        data.push(item);

        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            if(err) {
                return console.log(err);
            }

            console.log("ratings saved!");
        });
    }

    private createFileIfNotExists(filePath: string) {
        if (fs.existsSync(filePath)) {
            return;
        }

        mkdirp.sync(path.dirname(filePath));

        fs.writeFileSync(filePath, '[]');
    }
}