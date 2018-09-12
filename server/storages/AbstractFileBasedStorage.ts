import * as fs from 'fs';
import * as path from "path";
import * as mkdirp from 'mkdirp';

export abstract class AbstractFileBasedStorage {

    protected writeToFile(filePath: string, item: any) {
        const data = this.readFromFile(filePath);

        data.push(item);

        this.writeAllData(filePath, data);
    }

    protected writeAllData(filePath: string, data: any[]) {
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            if(err) {
                return console.log(err);
            }
        });
    }

    protected readFromFile(filePath: string): any[] {
        this.createFileIfNotExists(filePath);

        const contents = fs.readFileSync(filePath, 'utf8');
        let data = [];

        try {
            data = JSON.parse(contents.toString());
        } catch (e) {
            data = [];
        }

        return data;
    }

    private createFileIfNotExists(filePath: string) {
        if (fs.existsSync(filePath)) {
            return;
        }

        mkdirp.sync(path.dirname(filePath));

        fs.writeFileSync(filePath, '[]');
    }
}