import fs from 'fs';

const path = './leaderboard.json';

export class LeaderBoard {

    constructor() {
        this.data = [];

        const contents = fs.readFileSync(path, 'utf8');
        this.data = [];

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

        this._writeToFile(path, item)
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

    _writeToFile(path, item) {
        const contents = fs.readFileSync(path, 'utf8');
        let data = [];

        try {
            data = JSON.parse(contents.toString());
        } catch (e) {
            data = [];
        }

        data.push(item);

        fs.writeFile(path, JSON.stringify(data), (err) => {
            if(err) {
                return console.log(err);
            }

            console.log("ratings saved!");
        });
    }

}