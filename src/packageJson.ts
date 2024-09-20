import * as fs from 'fs';
import * as path from 'path';
import shell from 'shelljs';
import inquirer from 'inquirer';

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
    private _packageManager: 'npm' | 'yarn' | 'pnpm';

    private _devDependencies: string[];

    constructor(name: string, defaults: boolean) {
        if (defaults) {
            this._name = name;
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
            this._packageManager = 'pnpm';

            this._devDependencies = [
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
        }
    }

    private validatePackageManager() {
        if (shell.which(this._packageManager)) {
            ;
        }
    }

    // Writes the data in this object to a new package.json file in the given directory
    public createFile(directory: string) {
        fs.mkdirSync(directory, { recursive: true });

        // This object -> JSON (dependencies installed later & _ removed from field names)
        const result = {};
        for (const key of Object.keys(this)) {
            if (key !== '_devDependencies') {
                result[key.replace('_', '')] = this[key];
            }
        }

        fs.writeFileSync(path.join(directory, "package.json"), JSON.stringify(result, null, 4));

        this.validatePackageManager();

        shell.exec(`cd ${directory} && ${this._packageManager} install -D ${this._devDependencies.join(' ')} --silent`);
    }

    private checkPackageManager() {
        const managers = ['npm', 'yarn', 'pnpm'];
        for (const manager of managers) {
            const x = shell.which(manager);
            console.log(`Manager which: ${x}`);
            if (x) {
                this._packageManager = manager as 'npm' | 'yarn' | 'pnpm';
                break;
            }
        }

        if (!this._packageManager) {
            console.log('No package manager found. Please install one of the following: npm, yarn, or pnpm.');
            return false;
        }

        return true;
    }

    public async installPackages2() {
        if (!this.checkPackageManager()) {
            return;
        }

        console.log(`Using ${this._packageManager} to install packages.`);

        const answer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'installManager',
                message: `Do you want to install ${this._packageManager}?`,
                default: true,
            },
        ]);

        if (!answer.installManager) {
            console.log('Installation canceled by the user.');
            return;
        }

        if (this._packageManager !== 'npm') {
            console.log(`Cannot install ${this._packageManager} through the command line.`);
            return;
        }

        shell.exec(`npm i -g ${this._packageManager}`);

        shell.exec(`${this._packageManager} install -D ${this._devDependencies.join(' ')} --silent`);
    }

    // rsp b
    public async installPackages() {
        const packageManagers = ['npm', 'yarn', 'pnpm'];
        const { packageManager } = await inquirer.prompt([
            {
                type: 'list',
                name: 'packageManager',
                message: 'Select your package manager:',
                choices: packageManagers,
                default: this._packageManager
            }
        ]);

        this._packageManager = packageManager;

        const installCommand = `${this._packageManager} install -D ${this._devDependencies.join(' ')} --silent`;

        // Check if the package manager is installed
        try {
            shell.exec(`${this._packageManager} --version`, { silent: true });
        } catch (error) {
            const { install } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'install',
                    message: `The ${this._packageManager} package manager is not installed. Do you want to install it?`,
                    default: true
                }
            ]);

            if (!install) {
                console.error(`Please install the ${this._packageManager} package manager to use this script.`);
                process.exit(1);
            }

            // Try to install the package manager via npm
            try {
                shell.exec(`npm install -g ${this._packageManager}`, { silent: true });
            } catch (error) {
                const link = this._packageManager === 'npm'
                    ? 'https://docs.npmjs.com/downloading-and-installing-node-js-and-npm'
                    : (this._packageManager === 'yarn' ? 'https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable' : 'https://pnpm.io/installation');
                console.error(`Could not install ${this._packageManager} via npm. Please install it manually through the following link: ${link}`);
                process.exit(1);
            }
        }

        // Install dependencies
        shell.exec(installCommand, { silent: true });
    }
}

export default PackageJson;
