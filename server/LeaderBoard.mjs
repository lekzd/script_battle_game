
export class LeaderBoard {

    constructor() {
        this.data = [];
    }

    write(sessionResult) {
        const item = Object.assign({}, sessionResult, {
            time: Date.now()
        });

        this.data.push(item);
    }

    toHTML() {
        return `
            <table>
                ${this.data.map(row => `
                    <tr>
                        <td>${row.time}</td>
                        <td>${row.winner}</td>
                        <td>${row.damage.left}</td>
                        <td>${row.damage.right}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }

}