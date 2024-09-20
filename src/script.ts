import chalk from 'chalk';
import Listr from 'listr';
import PackageJson from "./packageJson";
import Readme from "./readme";
import { promptForPackageDirectory, promptForPackageName, promptForUsingDefaults } from "./prompts";

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
                task: () => { new Readme(packageName).createFile(packageDirectory) }
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

const initGitRepo = () => {
    // Simulate git init command
    console.log(chalk.yellow('Initializing Git repository...'));
};

export default run;
