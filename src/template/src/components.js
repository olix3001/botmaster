exports.BaseCommand = class BaseCommand {

    constructor(name, ...aliases) {
        this.name = name;
        this.aliases = [...aliases];
    }

    async run(msg, args, db) {
        throw new Error('run should be overrided');
    }
}

exports.BaseEvent = class BaseEvent {

    constructor(name, client) {
        this.name = name;
    }

    async run(...args) {
        throw new Error('run should be overrided');
    }
}