import chalk from 'chalk';
import yoctoSpinner from 'yocto-spinner';
import PackageJson from "./packageJson";
import Generators from './generators';
import { promptForPackageDirectory, promptForPackageName, promptForUsingDefaults } from "./prompts";

const run = async () => {
    try {
        const packageName = await promptForPackageName();

        const packageDirectory = await promptForPackageDirectory(packageName);

        await promptForUsingDefaults();

        const tasks = async () => {
            const generators = new Generators(packageName, packageDirectory);

            let spinner = yoctoSpinner({ text: 'Creating package.json' }).start();
            new PackageJson(packageName, true).createFile(packageDirectory);
            spinner.success('package.json created');

            spinner = yoctoSpinner({ text: 'Creating README.md...' }).start();
            generators.createReadme();
            spinner.success('README.md created');

            spinner = yoctoSpinner({ text: 'Initializing git repository...' }).start();
            initGitRepo();
            spinner.success('Git repository initialized');
        }

        await tasks();

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
