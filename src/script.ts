import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Listr from 'listr';
import validate from "validate-npm-package-name";
import npmName from 'npm-name';
import PackageJson from "./packageJson";
import Readme from "./readme";

const run = async () => {
    try {
        const packageName = await promptForPackageName();

        const packageDirectory = await promptForPackageDirectory(packageName);

        await promptForUsingDefaults();

        const tasks = new Listr([
            {
                title: `Creating package.json`,
                task: () => { new PackageJson(packageName, true).createFile(packageDirectory); }
            },
            {
                title: `Generating README.md`,
                task: () => generateReadme(packageName)
            },
            {
                title: `Initializing Git repository`,
                task: () => initGitRepo()
            }
        ]);

        await tasks.run();

        console.log(chalk.green('\nBoilerplate generation completed!'));
        console.log(chalk.cyan(`Now you can start coding in your new package: ${packageName}`));
    } catch (error) {
        console.error(chalk.red('Error occurred:'), error);
    }
};

const promptForPackageName = async () => {
    const { packageName } = await inquirer.prompt({
        type: 'input',
        name: 'packageName',
        message: `Enter your package name:`,
        validate: async (input) => {
            if (!input.trim()) {
                return 'Package name is required.';
            }
            const valid = validate(input).validForNewPackages;
            if (!valid) {
                return 'Invalid package name. Please try again.';
            }

            const available = await npmName(input);
            if (!available) {
                return 'Package name is already taken - you won\'t be able to deploy this package. Please try another name.';
            }

            return true;
        },
    });
    return packageName;
};

const promptForPackageDirectory = async (packageName) => {
    const { packageDirectory } = await inquirer.prompt({
        type: 'confirm',
        name: 'packageDirectory',
        message: `Package will be created here '${__dirname + '\\' + packageName}' - is this ok?`
    });
    return __dirname + '\\' + packageName;
}

const promptForUsingDefaults = async () => {

    const defaults = {
        "Language": "TypeScript",
        "Source Control": "git",
        "Changeset Manager": "changeset",
        "Testing": ["mocha (tdd)", "chai"],
        "Linting": ["tsc", "eslint"],
        "Build": "tsup",
        "Package Manager": "pnpm"
    };

    console.log(chalk.blue.bold("Default Settings for Package Installation:"));

    for (const [category, options] of Object.entries(defaults)) {
        if (Array.isArray(options)) {
            console.log(`${chalk.green(category)}:`);
            options.forEach(option => console.log(`  ${chalk.yellow('•')} ${chalk.yellow(option)}`));
        } else {
            console.log(`${chalk.green(category)}: ${chalk.yellow(options)}`);
        }
    }

    const { useDefaults } = await inquirer.prompt({
        type: 'confirm',
        name: 'useDefaults',
        message: `Start package installation (no to quit)?`
    });

    if (!useDefaults) {
        console.log(chalk.red('Exiting script...'));
        process.exit(0);
    }
};

const generateReadme = (packageName) => {
    const readmePath = path.join(__dirname, packageName, 'README.md');

    const readme = new Readme(packageName);
    const readmeContent = readme.getReadmeString();

    fs.writeFileSync(readmePath, readmeContent);
};

const initGitRepo = () => {
    // Simulate git init command
    console.log(chalk.yellow('Initializing Git repository...'));
};

export default run;
