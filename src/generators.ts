import * as fs from "fs";
import * as path from 'path';
import shell from 'shelljs';
import chalk from "chalk";
import * as commentJson from 'comment-json';
import logSymbols from "log-symbols";

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

    public runTasks = () => {
        process.stdout.write(logSymbols.info + " Creating development files...\r");
        this.createPackageJson();
        this.createReadme();
        this.createLicense();
        this.initGitRepo();
        this.initWorkflows();
        process.stdout.write(logSymbols.success + " Development files created    \n");

        process.stdout.write(logSymbols.info + " Creating code structure...\r");
        this.createSourceFiles();
        process.stdout.write(logSymbols.success + " Code structure created    \n");

        process.stdout.write(logSymbols.info + " Installing dependencies...\r");
        this.installDependencies();
        process.stdout.write(logSymbols.success + " Dependencies installed    \n");
    }

    private createPackageJson = () => {
        this._packageJson.createFile();
    }

    private createReadme = () => {

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

    private createLicense = () => {
        const license = "MIT License\n" +
            "\n" +
            "Copyright (c) [YEAR] [YOUR NAME]\n" +
            "\n" +
            "Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
            "of this software and associated documentation files (the \"Software\"), to deal\n" +
            "in the Software without restriction, including without limitation the rights\n" +
            "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
            "copies of the Software, and to permit persons to whom the Software is\n" +
            "furnished to do so, subject to the following conditions:\n" +
            "\n" +
            "The above copyright notice and this permission notice shall be included in all\n" +
            "copies or substantial portions of the Software.\n" +
            "\n" +
            "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n" +
            "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
            "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
            "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
            "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
            "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
            "SOFTWARE.\n";

        fs.writeFileSync(this._packageDirectory + "/LICENSE", license);
    }

    private initGitRepo = () => {
        shell.cd(this._packageDirectory);
        shell.exec(`git init --quiet`);

        fs.writeFileSync(this._packageDirectory + "/.gitignore", "node_modules/\ndist/\n");
    }

    private installDependencies = () => {
        this._packageJson.installDependencies();
    }

    private initWorkflows = () => {
        shell.cd(this._packageDirectory);
        shell.exec('npx changeset init > nul 2>&1');

        const workflowDirectory = this._packageDirectory + "/.github/workflows";
        fs.mkdirSync(workflowDirectory, { recursive: true });

        const pushYml =
            "name: CI\n" +
            "on:\n" +
            "  push:\n" +
            "    branches:\n" +
            "      - \"**\"\n\n" +
            "jobs:\n" +
            "  test:\n" +
            "    runs-on: ubuntu-latest\n" +
            "    steps:\n" +
            "      - name: Checkout\n" +
            "        uses: actions/checkout@v4\n" +
            "      - name: Setup pnpm\n" +
            "        uses: pnpm/action-setup@v4\n" +
            "        with:\n" +
            "          version: 9.5.0\n" +
            "      - name: Setup node\n" +
            "        uses: actions/setup-node@v4\n" +
            "        with:\n" +
            "          node-version: 20.x\n" +
            "          cache: 'pnpm'\n" +
            "      - name: Install dependencies\n" +
            "        run: pnpm install --frozen-lockfile\n\n" +
            "      - name: Run tests\n" +
            "        run: pnpm run test\n";
        fs.writeFileSync(workflowDirectory + "/push.yml", pushYml);

        const publishYml =
            "name: Publish\n" +
            "on:\n" +
            "  push:\n" +
            "    branches:\n" +
            "      - main\n\n" +
            "concurrency: ${{ github.workflow }}-${{ github.ref }}\n\n" +
            "jobs:\n" +
            "  build:\n" +
            "    runs-on: ubuntu-latest\n" +
            "    steps:\n" +
            "      - name: Checkout\n" +
            "        uses: actions/checkout@v4\n" +
            "      - name: Setup pnpm\n" +
            "        uses: pnpm/action-setup@v4\n" +
            "        with:\n" +
            "          version: 9.5.0\n" +
            "      - name: Setup node\n" +
            "        uses: actions/setup-node@v4\n" +
            "        with:\n" +
            "          node-version: 20.x\n" +
            "          cache: 'pnpm'\n" +
            "      - name: Install dependencies\n" +
            "        run: pnpm install --frozen-lockfile\n\n" +
            "      - name: Create Release Pull Request or Publish\n" +
            "        id: changesets\n" +
            "        uses: changesets/action@v1\n" +
            "        with:\n" +
            "          publish: pnpm run build\n" +
            "        env:\n" +
            "          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n";
        fs.writeFileSync(workflowDirectory + "/publish.yml", publishYml);
    }

    // Creates source directory, test directory & example, mocharc, tsconfig files
    private createSourceFiles = () => {
        const srcDirectory = this._packageDirectory + "/src";
        fs.mkdirSync(srcDirectory, { recursive: true });
        fs.writeFileSync(srcDirectory + "/index.ts", "");

        const testDirectory = this._packageDirectory + "/test";
        const testBoilerplate = "import { expect } from 'chai';\n\nsuite(\"Suite name\", function() {\n\n" +
            "    test(\"Test name\", function() {\n        expect(true).to.equal(true);\n    });\n});\n";
        fs.mkdirSync(testDirectory, { recursive: true });
        fs.writeFileSync(testDirectory + "/index.test.ts", testBoilerplate);

        const mocharcPath = this._packageDirectory + "/.mocharc.json";
        const mocharc = {"require":"ts-node/register","extension":["ts"],"spec":"./test/**/*.test{.js,.ts}","node-option":["loader=ts-node/esm"],"recursive":true,"timeout":5000};
        fs.writeFileSync(mocharcPath, JSON.stringify(mocharc, null, 2));

        shell.cd(this._packageDirectory);
        shell.exec('tsc --init > nul 2>&1');

        const tsconfigPath = this._packageDirectory  + '/tsconfig.json';
        const tsconfig = commentJson.parse(fs.readFileSync(tsconfigPath, 'utf8')); // @ts-ignore
        tsconfig.compilerOptions.module = 'es6'; // Allows for tests to run
        fs.writeFileSync(tsconfigPath, commentJson .stringify(tsconfig, null, 2));
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
            "ts-node"
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
            } // @ts-ignore
            result[key.replace('_', '')] = this[key];
        }

        fs.writeFileSync(path.join(this.packageDirectory, "package.json"), JSON.stringify(result, null, 2));
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
