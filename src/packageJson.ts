import * as fs from 'fs';
import * as path from 'path';
import shell from 'shelljs';

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
    private _packageManager: string;

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

    // Writes the data in this object to a new package.json file in the given directory
    public createFile(p: string) {
        fs.mkdirSync(p, { recursive: true });

        // This object -> JSON (dependencies installed later & _ removed from field names)
        const result = {};
        for (const key of Object.keys(this)) {
            if (key !== '_devDependencies') {
                result[key.replace('_', '')] = this[key];
            }
        }

        fs.writeFileSync(path.join(p, "package.json"), JSON.stringify(result, null, 4));

        shell.exec(`cd ${p} && ${this._packageManager} install -D ${this._devDependencies.join(' ')} --silent`);
    }
}

export default PackageJson;
