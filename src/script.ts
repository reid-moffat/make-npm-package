import chalk from 'chalk';
import yoctoSpinner from 'yocto-spinner';
import Generators from './generators';
import { promptForPackageDirectory, promptForPackageName, promptForUsingDefaults } from "./prompts";

const run = async () => {
    try {
        const packageName = await promptForPackageName();

        const packageDirectory = await promptForPackageDirectory(packageName);

        await promptForUsingDefaults();

        const tasks = async () => {
            const directorySpinner = yoctoSpinner({ text: 'Creating package directory...' }).start();
            const generators = new Generators(packageName, packageDirectory);
            directorySpinner.success('Package directory created');

            const packageSpinner = yoctoSpinner({ text: 'Creating package.json' }).start();
            generators.createPackageJson()
            packageSpinner.success('package.json created');

            const readmeSpinner = yoctoSpinner({ text: 'Creating README.md...' }).start();
            generators.createReadme();
            readmeSpinner.success('README.md created');

            const gitSpinner = yoctoSpinner({ text: 'Initializing git repository...' }).start();
            generators.initGitRepo();
            gitSpinner.success('Git repository initialized');

            const dependenciesSpinner = yoctoSpinner({ text: 'Installing dependencies...' }).start();
            generators.installDependencies();
            dependenciesSpinner.success('Dependencies installed');

            const srcSpinner = yoctoSpinner({ text: 'Creating code structure...' }).start();
            generators.createSourceFiles();
            srcSpinner.success('Code structure created');
        }

        await tasks();

        console.log(chalk.green('\nBoilerplate generation completed!'));
        console.log(chalk.cyan(`Now you can start coding in your new package: ${packageName}`));
    } catch (error) {
        console.error(chalk.red('Error occurred:'), error);
    }
};

export default run;
