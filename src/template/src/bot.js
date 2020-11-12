const Discord = require('discord.js');
const chalk = require('chalk');
const path = require('path');
const { JsonDb } = require('./database');
const { registerCommands, registerEvents } = require('./registry');

require('dotenv').config();
const client = new Discord.Client();

const db = new JsonDb('/database/servers.db', true);

client.on('ready', () => {
    console.log(`Logged in as ${chalk.green.bold(client.user.tag)}!`);
});

async function CreateDb(name) {
    await db.push(`${name}/prefix`, process.env.PREFIX);
}

const commands = registerCommands(__dirname + '/commands');
registerEvents(__dirname + '/events', client);

client.on('message', async (msg) => {
    if (db.get(`${msg.guild.id}/prefix`) == null) await CreateDb(msg.guild.id);
    if (msg.author.bot) return;
    if (!msg.content.startsWith(db.get(`${msg.guild.id}/prefix`))) return;
    let args = msg.content.split(' ').slice(1);
    for (let command of Object.keys(commands)) {
        if (command == msg.content.split(' ')[0].slice(1)) {
            let cmd = commands[command];
            if (typeof cmd == 'string') {
                await commands[cmd].run(msg, args, db);
                return;
            } else {
                await commands[command].run(msg, args, db);
                return;
            }
        }
    }
});

client.login(process.env.TOKEN);