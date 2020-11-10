import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import Listr from 'listr';
import inquirer from 'inquirer';
import execa from 'execa';

export async function generateBot() {
    await new Listr([
        {
            title: 'Copying Files',
            task: () => {
                fs.copy(__dirname + '/template', process.cwd());
            }
        },
        {
            title: 'Installing modules',
            task: async () => await execa('npm install')
        }
    ]).run();

    let options = await inquirer.prompt([
        {
            type: 'password',
            name: 'token',
            message: 'Enter your bot token',
            mask: '*'
        },
        {
            type: 'input',
            name: 'prefix',
            message: 'Your bot prefix',
            default: '>',
            validate: (value) => {
                if (value.length <= 0) {
                    return 'Bot prefix connot be empty!'
                }
                if (value.length > 5) {
                    return 'Max prefix length is 5'
                }
                return true
            }
        },
        {
            type: 'input',
            name: 'package',
            message: 'Your package name',
            default: 'bot',
            validate: (value) => {
                if (value.length <= 0) {
                    return 'Package name connot be empty!'
                } else if (value.includes(' ')) {
                    return 'Package name cannot contain space';
                } else if (value.toLowerCase() != value) {
                    return 'Package name must be lowercase';
                }
                return true;
            }
        }
    ]);

    await new Listr([
        {
            title: 'Creating .env',
            task: () => {
                fs.writeFileSync(path.join(process.cwd(), '/.env'), `TOKEN=${options.token}\nPREFIX=${options.prefix}`);
            }
        },
        {
            title: 'Creating package.json',
            task: () => {
                fs.writeFileSync(path.join(process.cwd(), '/package.json'), `{
    "name": "${options.package}",
    "version": "1.0.0",
    "description": "",
    "main": "src/bot.js",
    "scripts": {
        "start": "node src/bot.js"
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
        "chalk": "^4.1.0",
        "discord.js": "^12.4.1",
        "dotenv": "^8.2.0",
        "fs-extra": "^9.0.1"
    }
}`);
            }
        }
    ]).run();

    console.log(`${chalk.green.bold('DONE')} Your bot is ready!`);
}

export async function generateCommand() {
    if (!await fs.existsSync(path.join(process.cwd(), 'src/bot.js'))) {
        console.log(`${chalk.red.bold('ERROR')} Create bot before creating a command`);
        process.exit(1);
    }

    const options = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Command name (use xyz/name to create subdirectory)',
            validate: (value) => {
                if (value.length <= 0) {
                    return 'Command name connot be empty!'
                } else if (value.includes(' ')) {
                    return 'Command name cannot include space!';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'alts',
            message: 'Command alts',
            validate: (value) => {
                if (value.split(',').length > 5) {
                    return 'Enter max 5 alts';
                }
                return true;
            }
        }
    ]);

    let fullName = options.name;
    options.name = options.name.split('/')[1] || options.name;

    let p = '';
    if (fullName.split('/').length > 1) {
        p = '../';
    }

    await new Listr([
        {
            title: 'Creating command',
            task: () => {
                let count = fs.readdirSync(path.join(process.cwd(), 'src/commands')).filter(x => x == fullName + '.js').length;
                count = (count > 0) ? `-${count}` : '';
                fs.ensureFileSync(path.join(process.cwd(), `src/commands/${fullName + count}.js`));
                fs.writeFileSync(path.join(process.cwd(), `src/commands/${fullName + count}.js`), generateCommandContent(options, p));
            }
        }
    ]).run();
    console.log(`${chalk.green.bold('DONE')} Your command is ready to work!`);
}

function generateCommandContent(options, p) {
    return `const { BaseCommand } = require('../${p}components.js');
exports.command = class ${options.name.charAt(0).toUpperCase() + options.name.slice(1).toLowerCase()} extends BaseCommand {

    constructor() {
        super('${options.name}'${(options.alts.length > 0) ? ", " + options.alts.replace(/ +/g, '').split(',').map(v => "'" + v + "'").join(', ') : ''});
    }

    async run(msg, args, db) {
        // Your code here...
        msg.reply('Reply from command ${options.name}');
    }

}`
}

export async function generateEvent() {
    if (!await fs.existsSync(path.join(process.cwd(), 'src/bot.js'))) {
        console.log(`${chalk.red.bold('ERROR')} Create bot before creating a event`);
        process.exit(1);
    }

    let options = await inquirer.prompt([
        {
            type: 'input',
            name: 'filename',
            message: 'File name (use xyz/name to create subdirectory)',
            validate: (value) => {
                if (value.length <= 0) {
                    return 'file name connot be empty!'
                } else if (value.includes(' ')) {
                    return 'file name cannot include space!';
                }
                return true;
            }
        },
        {
            type: 'checkbox',
            name: 'events',
            message: 'select events',
            choices: allEvents
        }
    ]);
    let fullName = options.filename;
    options.filename = options.filename.split('/')[1] || options.filename;
    let p = '';
    if (fullName.split('/').length > 1) {
        p = '../';
    }

    let code = `const { BaseEvent } = require('../${p}components');
let events = [];`;
    for (let event of options.events) {
        code += `\n
events.push(class ${event}Event extends BaseEvent {

    constructor() {
        super('${event}');
    }

    run(...args) {
        //Your event code here...
    }

})`;
    }
    code += '\nexports.events = events;'

    await new Listr([
        {
            title: 'Creating events',
            task: () => {
                let count = fs.readdirSync(path.join(process.cwd(), 'src/events')).filter(x => x == fullName + '.js').length;
                count = (count > 0) ? `-${count}` : '';
                fs.ensureFileSync(path.join(process.cwd(), `src/events/${fullName + count}.js`));
                fs.writeFileSync(path.join(process.cwd(), `src/events/${fullName + count}.js`), code);
            }
        }
    ]).run();
}

const allEvents = [
    'channelCreate',
    'channelDelete',
    'channelPinsUpdate',
    'channelUpdate',
    'clientUserGuildSettingsUpdate',
    'clientUserSettingsUpdate',
    'debug',
    'disconnect',
    'emojiCreate',
    'emojiDelete',
    'emojiUpdate',
    'error',
    'guildBanAdd',
    'guildBanRemove',
    'guildCreate',
    'guildDelete',
    'guildMemberAdd',
    'guildMemberAvailable',
    'guildMemberRemove',
    'guildMembersChunk',
    'guildMemberSpeaking',
    'guildMemberUpdate',
    'guildUnavailable',
    'guildUpdate',
    'message',
    'messageDelete',
    'messageDeleteBulk',
    'messageReactionAdd',
    'messageReactionRemove',
    'messageReactionRemoveAll',
    'messageUpdate',
    'presenceUpdate',
    'ready',
    'reconnecting',
    'resume',
    'roleCreate',
    'roleDelete',
    'roleUpdate',
    'typingStart',
    'typingStop',
    'userNoteUpdate',
    'userUpdate',
    'voiceStateUpdate',
    'warn'
];