import * as fs from "fs";
import shell from 'shelljs';

class Generators {

    private readonly _packageName: string;
    private readonly _packageDirectory: string;

    constructor(packageName: string, packageDirectory: string) {
        this._packageName = packageName;
        this._packageDirectory = packageDirectory;

        fs.mkdirSync(this._packageDirectory, { recursive: true });
    }

    public createReadme = () => {

        let readmeStr = "";
        const addLine = (line: string, newlines: number = 2) => readmeStr += line + "\n".repeat(newlines);

        addLine(`# ${this._packageName}`);
        addLine(`A brief description of your package goes here`);

        addLine('## 📦 Installation');
        addLine('```bash', 1);
        addLine(`npm install ${this._packageName}`);
        addLine(`# or`, 1);
        addLine(`yarn add install ${this._packageName}`);
        addLine(`# or`, 1);
        addLine(`pnpm install ${this._packageName}`, 1);
        addLine('```');

        addLine('## 🚀 Usage');
        addLine('...');

        fs.writeFileSync(this._packageDirectory + "/README.md", readmeStr);
    }

    public initGitRepo = () => {
        shell.cd(this._packageDirectory);
        shell.exec(`git init`);
    }
}

export default Generators;
