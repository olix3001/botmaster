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
    if (msg.guild == null) return;
    let guildId = msg.guild.id;
    if ((await db.get(`${guildId}/prefix`)) == null) await CreateDb(guildId);
    if (msg.author.bot) return;
    prefix = await db.get(`${guildId}/prefix`);
    if (!msg.content.startsWith(prefix)) return;
    let args = msg.content.split(' ').slice(1);
    for (let command of Object.keys(commands)) {
        if (command == msg.content.split(' ')[0].slice(prefix.length)) {
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
module.exports.db = db;

client.login(process.env.TOKEN);