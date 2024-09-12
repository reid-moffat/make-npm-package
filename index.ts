import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Listr from 'listr';

const generateBoilerplate = async () => {
    try {
        const packageName = await promptForPackageName();
        const packageConfig = await promptForPackageConfig();

        const tasks = new Listr([
            {
                title: `Creating package.json`,
                task: () => createPackageJson(packageName, packageConfig),
            },
            {
                title: `Generating README.md`,
                task: () => generateReadme(packageName),
            },
            {
                title: `Initializing Git repository`,
                task: () => initGitRepo(),
            },
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
        validate: (input) => {
            if (!input.trim()) {
                return 'Package name is required.';
            }
            return true;
        },
    });
    return packageName;
};

const promptForPackageConfig = async () => {
    const { useDefaults } = await inquirer.prompt({
        type: 'confirm',
        name: 'useDefaults',
        message: `Would you like to use default package configuration?`,
        default: true,
    });

    let packageConfig;
    if (!useDefaults) {
        // Prompt for specific config options if not using defaults
        packageConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'version',
                message: `Enter version number:`,
                default: '1.0.0',
            },
            {
                type: 'input',
                name: 'description',
                message: `Enter package description:`,
            },
            // Add more config prompts as needed
        ]);
    }

    return { useDefaults, ...packageConfig };
};

const createPackageJson = (packageName, packageConfig) => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const config = packageConfig.useDefaults
        ? {
                name: packageName,
                version: '1.0.0',
                main: 'index.js',
                scripts: {
                    test: 'echo "Error: no test specified" && exit 1',
                },
                repository: {
                    type: 'git',
                    url: `git+https://github.com/${process.env.USERNAME}/${packageName}.git`,
                },
                keywords: [],
                author: '',
                license: 'ISC',
                bugs: {
                    url: `https://github.com/${process.env.USERNAME}/${packageName}/issues`,
                },
                homepage: `https://github.com/${process.env.USERNAME}/${packageName}#readme`,
          }
        : {
                ...packageConfig,
                name: packageName,
          };

    fs.writeFileSync(packageJsonPath, JSON.stringify(config, null, 2));
};

const generateReadme = (packageName) => {
    const readmePath = path.join(process.cwd(), 'README.md');
    const readmeContent = `# ${packageName}

[![Build Status](https://img.shields.io/badge/status-unstable.svg)](https://travis-ci.org/${process.env.USERNAME}/${packageName})

## Description

A brief description of your package goes here.

## Installation

\`\`bash
npm install ${packageName}
\`\`

## Usage

...

## Contributing

...

## Tests

\`\`bash
npm test
\`\`


`;
    fs.writeFileSync(readmePath, readmeContent);
};

const initGitRepo = () => {
    // Simulate git init command
    console.log(chalk.yellow('Initializing Git repository...'));
};

generateBoilerplate();
