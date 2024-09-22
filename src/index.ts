#!/usr/bin/env node

import { promptForPackageDirectory, promptForPackageName, promptForUsingDefaults } from "./prompts";
import Generators from "./generators";
import chalk from "chalk";

const run = async () => {
    try {
        const packageName = await promptForPackageName();

        const packageDirectory = await promptForPackageDirectory(packageName);

        await promptForUsingDefaults();

        new Generators(packageName, packageDirectory).runTasks();

        console.log(chalk.green('\nBoilerplate generation completed!'));
        console.log(chalk.cyan(`Now you can start coding in your new package: ${packageName}`));
    } catch (error) {
        console.error(chalk.red('Error occurred:'), error);
    }
};

run();
