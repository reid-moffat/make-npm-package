import chalk from "chalk";
import inquirer from "inquirer";
import validate from "validate-npm-package-name";
import npmName from "npm-name";

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

const promptForPackageDirectory = async (packageName: string) => {
    const defaultDirectory = process.cwd() + '\\' + packageName;

    const { useDefaultDirectory } = await inquirer.prompt({
        type: 'confirm',
        name: 'useDefaultDirectory',
        message: `Package will be created here '${defaultDirectory}' - is this ok?`,
        default: true
    });

    if (useDefaultDirectory) {
        return defaultDirectory;
    }

    const { packageDirectory } = await inquirer.prompt({
        type: 'input',
        name: 'packageDirectory',
        message: `Which path would you like to create the package in?`
    });

    if (!packageDirectory.endsWith(packageName)) {
        return packageDirectory + '\\' + packageName;
    }

    return packageDirectory;
}

const promptForUsingDefaults = async () => {

    const defaults = {
        "Language": "TypeScript",
        "Source Control": [
            "git",
            "github"
        ],
        "Build/run tools": [
            "tsc",
            "tsup",
            "ts-node",
            "cross-env"
        ],
        "Changeset Manager": "changeset",
        "Testing": [
            "mocha (tdd)",
            "chai"
        ],
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

export { promptForPackageName, promptForPackageDirectory, promptForUsingDefaults };
