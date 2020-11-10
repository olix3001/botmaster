const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { readdirSync } = require('fs-extra');

exports.registerCommands = (dir) => {
    var commands = {};
    fs.ensureDir(dir);
    let commandList = fs.readdirSync(dir);

    let registerCommand = (file) => {
        let command = require(file);
        let commandInstance = new command.command();
        console.log(`loading command ${chalk.yellow.bold(commandInstance.name)} (alts: ${commandInstance.aliases.join(', ') || "No aliases"})`);
        commands[commandInstance.name] = commandInstance;
        for (let alt of commandInstance.aliases) {
            commands[alt] = commandInstance.name;
        }
    }
    for (let cmd of commandList) {
        let file = path.join(dir, cmd);
        if (file.endsWith('.js')) {
            registerCommand(file);
        } else {
            let subdir = readdirSync(file);
            for (let subFile of subdir) {
                let subDirPath = path.join(file, subFile);
                registerCommand(subDirPath);
            }
        }
    }

    return commands;
}
exports.registerEvents = (dir, client) => {
    var events = {};
    fs.ensureDir(dir);
    let eventList = fs.readdirSync(dir);

    let registerEvent = (file) => {
        let events = require(file).events;
        for (let event of events) {
            let eventInstance = new event();
            console.log(`registering event ${chalk.yellow.bold(eventInstance.name.toUpperCase())}`);
            client.on(eventInstance.name, (...args) => {
                eventInstance.run(...args);
            });
        }
    }

    for (let evt of eventList) {
        let file = path.join(dir, evt);

        if (file.endsWith('.js')) {
            registerEvent(file);
        } else {
            let subdir = fs.readdirSync(file);
            for (let subFile of subdir) {
                let subdirpath = path.join(file, subFile);
                registerEvent(subdirpath);
            }
        }
    }
}