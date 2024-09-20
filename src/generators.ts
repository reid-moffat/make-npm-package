import * as fs from "fs";
import * as path from 'path';
import shell from 'shelljs';
import chalk from "chalk";

class Generators {

    private readonly _packageName: string;
    private readonly _packageDirectory: string;

    private readonly _packageJson: PackageJson;

    constructor(packageName: string, packageDirectory: string) {
        this._packageName = packageName;
        this._packageDirectory = packageDirectory;

        this._packageJson = new PackageJson(packageName, packageDirectory);

        fs.mkdirSync(this._packageDirectory, { recursive: true });
    }

    public createPackageJson = () => {
        this._packageJson.createFile();
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
        shell.exec(`git init --quiet`);

        fs.writeFileSync(this._packageDirectory + "/.gitignore", "node_modules/\ndist/\n");
    }

    public installDependencies = () => {
        this._packageJson.installDependencies();
    }

    public createSourceFiles = () => {
        const srcDirectory = this._packageDirectory + "/src";
        fs.mkdirSync(srcDirectory, { recursive: true });
        fs.writeFileSync(srcDirectory + "/index.ts", "");

        const testDirectory = this._packageDirectory + "/test";
        fs.mkdirSync(testDirectory, { recursive: true });
        fs.writeFileSync(testDirectory + "/index.test.ts", "");
    }
}

class PackageJson {

    private _name: string;
    private _version: string;
    private _description: string;
    private _author: string;
    private _license: string;
    private _keywords: string[];

    private _type: "module" | "commonjs";
    private _main: string;
    private _module: string;
    private _types: string;

    private _scripts: { [key: string]: string };
    private _files: string[];
    private _repository: { type: string, url: string };
    private _bugs: string;

    // Helper fields
    private packageManager: 'npm' | 'yarn' | 'pnpm';
    private devDependencies: string[];
    private packageDirectory: string;

    constructor(packageName: string, packageDirectory: string) {
        this._name = packageName;
        this._version = '0.0.0';
        this._description = '';
        this._author = '';
        this._license = 'MIT';
        this._keywords = [];

        this._type = 'module';
        this._main = 'dist/index.js';
        this._module = 'dist/index.mjs';
        this._types = 'dist/index.d.ts';

        this._scripts = {
            "lint": "tsc",
            "test": "cross-env TS_NODE_PROJECT='./tsconfig.json' mocha --ui tdd",
            "build": "tsup src/index.ts --format cjs,esm --dts --minify",
            "deployHelp": "echo \"1) Run 'changeset' 2) Merge changes to main 3) Merge changeset PR 4) npm run deploy (verify it looks good)\"",
            "deploy": "git checkout main && git pull && npm run build && npm publish"
        };
        this._files = [
            "CHANGELOG.md",
            "dist"
        ];
        this._repository = {
            type: 'git',
            url: '',
        };
        this._bugs = '';

        this.packageManager = 'pnpm';
        this.devDependencies = [
            "@changesets/cli",
            "@types/chai",
            "@types/mocha",
            "@types/node",
            "cross-env",
            "mocha",
            "chai",
            "tsup",
            "typescript",
            "ts-node",
            "generate-arrays",
            "suite-metrics"
        ];
        this.packageDirectory = packageDirectory;
    }

    // Writes the data in this object to a new package.json file in the given directory
    public createFile() {
        // This object -> JSON (dependencies installed later & _ removed from field names)
        const result = {};
        for (const key of Object.keys(this)) {
            if (!key.startsWith('_')) {
                continue; // Ignore package manager as this needs a version
            }
            result[key.replace('_', '')] = this[key];
        }

        fs.writeFileSync(path.join(this.packageDirectory, "package.json"), JSON.stringify(result, null, 4));
    }

    // Verifies package manager is installed, then installs dependencies
    public installDependencies() {
        if (!shell.which(this.packageManager)) {
            const npmInstalled = shell.which('npm');

            if (this.packageManager === 'npm') {
                console.log(chalk.red(`The npm CLI is not installed. Please install npm CLI manually: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm`));
            } else if (this.packageManager === 'yarn') {
                if (npmInstalled) {
                    console.log(`Installing yarn CLI via npm...`);
                    shell.exec('npm install -g yarn --silent');
                    return;
                }

                console.log(chalk.red(`The yarn CLI is not installed. If you install npm CLI it can be installed automatically,`));
                console.log(chalk.red(`otherwise please install yarn CLI manually: https://classic.yarnpkg.com/lang/en/docs/install`));
            } else if (this.packageManager === 'pnpm') {
                if (npmInstalled) {
                    console.log(`Installing pnpm CLI via npm...`);
                    shell.exec('npm install -g pnpm --silent');
                    return;
                }

                console.log(chalk.red(`The pnpm CLI is not installed. If you install npm CLI it can be installed automatically,`));
                console.log(chalk.red(`otherwise please install pnpm CLI manually: https://pnpm.io/installation`));
                process.exit(0);
            } else {
                console.log(chalk.red(`Invalid package manager: ${this.packageManager}`));
            }
        }

        shell.cd(this.packageDirectory);
        shell.exec(`${this.packageManager} install -D ${this.devDependencies.join(' ')} --silent`);
    }
}

export default Generators;
