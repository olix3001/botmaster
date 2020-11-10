import chalk from 'chalk';
import { generateBot, generateCommand, generateEvent } from './generator';
import inquirer from 'inquirer'
import fs from 'fs-extra';
import path from 'path';
import { fstat } from 'fs-extra';
import Listr from 'listr';

export async function cli() {
    let choices = [];
    if ((await fs.existsSync(path.join(process.cwd(), 'src/bot.js'))) == true) {
        choices = ['COMMAND', 'EVENT'];
    } else if ((await fs.readdirSync(process.cwd())).length > 0) {
        let options = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'empty',
                message: 'This directory is not empty! do you want to empty it?',
                default: false
            }
        ]);
        if (!options.empty) {
            process.exit(1);
        }
        await new Listr([
            {
                title: 'Emptying directory',
                task: () => {
                    fs.emptyDirSync(process.cwd());
                }
            }
        ]).run();
        choices = ['BOT']
    } else {
        choices = ['BOT'];
    }
    const type = (await inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'What do you want to generate?',
            choices: choices,
            default: 0
        }]))['type'];

    switch (type.toLowerCase()) {
        case 'bot':
            await generateBot();
            break;
        case 'command':
            await generateCommand();
            break;
        case 'event':
            await generateEvent();
            break;
    }
}