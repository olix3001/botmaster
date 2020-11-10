const { BaseCommand } = require('../components.js');
exports.command = class Prefix extends BaseCommand {

    constructor() {
        super('prefix', 'pref');
    }

    async run(msg, args, db) {
        if (args[0].length <= 5 && args[0].length > 0) {
            if (args[0] == db.get(`${msg.guild.id}/prefix`)) {
                msg.channel.send('❌ this prefix is already set');
                return;
            }
            db.push(`${msg.guild.id}/prefix`, args[0].trim());
            msg.channel.send(`✅ prefix set to ${args[0].trim()}`);
        } else {
            msg.channel.send('❌ prefix must be 1-5 length');
        }
    }

}