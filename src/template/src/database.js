const fs = require('fs-extra');
const chalk = require('chalk');
class JsonDb {

    constructor(file, saveOnPush = false) {
        this.file = file;
        this.autoSave = saveOnPush;
        this.data = {};
        this.load();
    }

    //----------------------------------------------------------------------

    load() {
        if (!fs.existsSync(__dirname + this.file)) return this.data = {};
        try {
            this.data = JSON.parse(fs.readFileSync(__dirname + this.file));
        } catch (err) {
            console.log(`${chalk.red.bold('DATABASE')} data in database was corrupted... creating new one`);
            this.data = {};
            this.save();
        }
    }

    //----------------------------------------------------------------------

    save() {
        fs.ensureFileSync(__dirname + this.file);
        fs.writeFileSync(__dirname + this.file, JSON.stringify(this.data));
    }

    //----------------------------------------------------------------------

    saveOnPush(v) {
        this.autoSave = v;
    }

    //----------------------------------------------------------------------

    push(path, data) {
        path = path.split('/');
        let current = this.data;
        for (let i = 0; i < path.length; i++) {
            let dir = path[i];
            if (i == path.length - 1) {
                current[dir] = data;
                break;
            }
            if (!current[dir]) current[dir] = {};
            current = current[dir];
        }

        //save
        if (this.autoSave) {
            this.save();
        }
    }

    //----------------------------------------------------------------------

    empty(path) {
        path = path.split('/');
        let current = this.data;
        for (let dir of path) {
            if (!current[dir]) current[dir] = {};
            current = current[dir];
        }

        //save
        if (this.autoSave) {
            this.save();
        }
    }

    //----------------------------------------------------------------------

    get(path) {
        path = path.split('/');
        let current = this.data;
        for (let dir of path) {
            if (!current[dir]) return null;
            current = current[dir];
        }
        return current;
    }

    //----------------------------------------------------------------------

    exists(path) {
        path = path.split('/');
        let current = this.data;
        for (let dir of path) {
            if (!current[dir]) return false;
            current = current[dir];
        }
        return true
    }

    //----------------------------------------------------------------------

    delete(path) {
        path = path.split('/');
        let current = this.data;
        for (let i = 0; i < path.length; i++) {
            let dir = path[i];
            if (i == path.length - 1) {
                delete current[dir];
                break;
            }
            if (!current[dir]) return;
            current = current[dir];
        }

        //save
        if (this.autoSave) {
            this.save();
        }
    }
}

this.JsonDb = JsonDb;