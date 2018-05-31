"use strict";

const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const uuid = require('./util/uuid');
const date = require('./util/date');
const VAR = require('./VAR');
const Time = require('./Time');
const Match = require('./Match');
const Bundle = require('./Bundle');
const ignoreFilter = require('./ignoreFilter');
const createDiff = require('./createDiff');


function Packer(option) {
    this.option = option;

    this.id = uuid();
    this.time = new Time();
    this.rules = new Match(option, option.release);
    this.ignore = ignoreFilter(option.ignore);
    this.cache = path.join(__dirname, '../.cache', this.id);


    this.context = path.resolve(process.cwd(), option.context);
    this.src = path.resolve(this.context, option.src);
    this.diff = option.diff;
    this.output = path.resolve(this.context, option.output);
    this.backup = option.backup ? path.resolve(this.context, option.backup.replace(/(\[([^\]]+)\])/g, (...args) => {
        let [key, len] = args[2].split(':');
        len = Number(len);
        switch (key) {
            case 'uuid':
                return len ? this.id.replace(/-/g, '').slice(0, len) : this.id;
            case 'date':
                key = date.string(new Date(), 'yMMddhhmmss');
                return len ? key.slice(0, len) : key;
            default:
                return args[2];
        }
    })) : false;

    this.newest = null;
    this.stable = null;
    this.bundle = null;

    this.difference = [];
    this.resource = [];
}

Packer.prototype.init = function() {
    this.time.begin('init');

    if (this.src.indexOf(this.context) !== 0) {
        throw new Error(`src dir [${this.src}] not in context [${this.context}]`);
    }

    if (this.backup && fs.existsSync(this.backup)) {
        throw new Error(`backup dir [${this.backup}] has exist`);
    }

    this.createNewest();
    this.createStable();
    this.createBundle();

    this.time.end('init');
};

Packer.prototype.createNewest = function() {
    const newest_dir = this.src;

    if (!fs.existsSync(newest_dir)) {
        throw new Error(`src dir [${newest_dir}] not exist`);
    }

    this.newest = new Bundle(newest_dir, {
        type: 'newest',
        ignore: this.ignore
    });
};

Packer.prototype.createStable = function() {
    const diff = this.diff;

    let stable_dir;

    if (/^git:?/.test(diff)) {
        const git_dir = path.join(this.cache, 'stable');
        const git_branch = createDiff(
            git_dir,
            this.context,
            diff.replace(/^git:?/, '')
        );

        stable_dir = path.join(git_dir, this.src.replace(this.context, ''));

        this.diff = `git:${git_branch}`;
    } else {
        stable_dir = path.resolve(this.context, diff.replace(/^path:?/, ''));

        this.diff = `path:${stable_dir}`;
    }

    if (!fs.existsSync(stable_dir)) {
        throw new Error(`diff dir [${stable_dir}] not exist`);
    }

    this.stable = new Bundle(stable_dir, {
        type: 'stable',
        ignore: this.ignore
    });
};

Packer.prototype.createBundle = function () {
    this.bundle = new Bundle(this.output, {
        type: 'bundle',
        ignore: this.ignore
    });
};

Packer.prototype.compare = function() {
    this.time.begin('compare');

    if (!this.newest || !this.stable) {
        throw new Error('please pack step by step');
    }

    const difference = this.difference = [];

    const stableFiles = {};
    this.stable.getFile().forEach(file => {
        stableFiles[file.path] = file;
    });

    this.newest.getFile().forEach(file => {
        const stableFile = stableFiles[file.path];
        delete stableFiles[file.path];

        difference.push({
            type: stableFile ? VAR.DIFF_TYPE.UPDATE : VAR.DIFF_TYPE.CREATE,
            path: file.path,
            newest: file,
            stable: stableFile,
        });
    });

    Object.keys(stableFiles).forEach(key => difference.push({
        type: VAR.DIFF_TYPE.DELETE,
        path: key,
        newest: undefined,
        stable: stableFiles[key],
    }));

    this.time.end('compare');

    return this.difference;
};

Packer.prototype.match = function() {
    this.time.begin('match');

    const option = this.option;
    const tmpDir = path.join(this.cache, 'tmp');
    const baseDir = path.resolve(this.context, this.output);

    this.resource = this.difference
    .map(diff => {
        const release = this.rules.test(diff.path) === VAR.TEST_STAT.RELEASE;
        switch (diff.type) {
            case VAR.DIFF_TYPE.CREATE:
                return release ? diff.newest : undefined;
            case VAR.DIFF_TYPE.UPDATE:
                return release ? diff.newest : diff.stable;
            case VAR.DIFF_TYPE.DELETE:
                return release ? undefined : diff.stable;
        }
    })
    .filter(file => !!file)
    .map(file => ({
        path: file.path,
        src: file.absolute,
        tmp: path.join(tmpDir, file.path),
        tar: path.join(baseDir, file.path),
        file: file,
    }));

    this.time.end('match');
    return this.resource;
};

Packer.prototype.pack = function() {
    this.time.begin('pack');

    if (!this.newest || !this.stable) {
        throw new Error('please pack step by step');
    }

    this.resource.forEach(item => {
        fsExtra.copySync(item.src, item.tmp);
    });

    if (this.backup) {
        this.newest.getFile().forEach(item => {
            fsExtra.copySync(item.absolute, path.join(this.backup, item.path));
        });
    }

    this.bundle.getFile().forEach(item => {
        fsExtra.removeSync(item.absolute);
    });

    this.resource.forEach(item => {
        fsExtra.moveSync(item.tmp, item.tar);
    });

    this.time.end('pack');
};

Packer.prototype.clean = function() {
    this.time.begin('clean');

    try {
        fsExtra.removeSync(this.cache);
    } catch (e) {}

    this.time.end('clean');
};

Packer.prototype.run = function(callback) {
    if (typeof callback !== 'function') {
        throw new Error('need run callback')
    }

    this.init();
    this.compare();
    this.match();
    this.pack();
    this.clean();

    setTimeout(() => {
        callback(this);
    }, 0);
};


exports = module.exports = Packer;
