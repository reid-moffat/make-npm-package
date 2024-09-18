class Readme {

    private readonly _packageName: string;

    constructor(packageName: string) {
        this._packageName = packageName;
    }

    public getReadmeString() {

        let str = "";
        const addLine = (line: string, newlines: number = 2) => str = str + line + "\n".repeat(newlines);

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

        return str;
    }
}

export default Readme;
