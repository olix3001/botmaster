const { BaseCommand } = require('../components.js');
const { MessageEmbed } = require('discord.js');
exports.command = class Ping extends BaseCommand {

    constructor() {
        super('ping');
    }

    async run(msg, args, db) {
        let embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Pong 🏓')
            .setDescription(`your ping is ${Date.now() - msg.createdTimestamp}ms`);
        msg.channel.send(embed);
    }

}