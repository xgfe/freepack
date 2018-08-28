"use strict";
const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const uuid = require('./util/uuid');
const date = require('./util/date');
const VARIABLE = require('./variable');
const Time = require('./Time');
const Match = require('./Match');
const Bundle = require('./Bundle');
const ignoreFilter = require('./ignoreFilter');
const createDiff = require('./createDiff');
const validateOption = require('./validateOption');

const CACHE_DIR = path.join(__dirname, '../.cache');


function Packer(option) {
    option = validateOption(option);

    this.option = option;

    this.matcher = new Match({
        match: option.match,
        strict: option.strict,
        alias: option.alias,
        module: option.module,
        symbol: option.symbol,
        dot: option.dot
    }, option.release);
    this.timer = new Time();
    this.ignore = ignoreFilter(option.ignore);

    this.uuid = uuid();
    this.context = path.resolve(process.cwd(), option.context);
    this.src = path.resolve(this.context, option.src);
    this.output = path.resolve(this.context, option.output);
    this.backup = option.backup ? path.resolve(this.context, option.backup.replace(/(\[([^\]]+)\])/g, (match, attr, value) => {
        let [key, len] = value.split(':');
        len = Number(len);
        switch (key) {
            case 'uuid':
                return len ? this.uuid.replace(/-/g, '').slice(0, len) : this.uuid;
            case 'date':
                key = date.string(new Date(), 'yyyyMMddhhmmssSS');
                return len ? key.slice(0, len) : key;
            default:
                return value;
        }
    })) : false;

    this.cache = path.resolve(CACHE_DIR, this.uuid);
    this.diff = option.diff;

    this.newest = null;
    this.stable = null;
    this.bundle = null;

    this.difference = [];
    this.resource = [];
}

Packer.prototype.init = function() {
    let timer = this.timer.record('init');

    if (this.src.indexOf(this.context) !== 0) {
        throw new Error(`context [${this.context}] not include src dir [${this.src}]`);
    }

    if (this.backup && fs.existsSync(this.backup)) {
        throw new Error(`backup dir [${this.backup}] has exist`);
    }

    this.createNewest();
    this.createStable();
    this.createBundle();

    timer();
};

Packer.prototype.createNewest = function() {
    const newest_dir = this.src;

    if (!fs.existsSync(newest_dir)) {
        throw new Error(`src dir [${newest_dir}] not exist`);
    }

    this.newest = new Bundle(newest_dir, {
        type: VARIABLE.BUNDLE_TYPE.NEWEST,
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
        type: VARIABLE.BUNDLE_TYPE.STABLE,
        ignore: this.ignore
    });
};

Packer.prototype.createBundle = function () {
    this.bundle = new Bundle(this.output, {
        type: VARIABLE.BUNDLE_TYPE.BUNDLE,
        ignore: this.ignore
    });
};

Packer.prototype.compare = function() {
    const timer = this.timer.record('compare');

    if (!this.newest || !this.stable) {
        throw new Error('please pack step by step');
    }

    const stableFiles = {};
    this.stable.getFile().forEach(file => {
        stableFiles[file.path] = file;
    });

    this.difference = this.newest.getFile().map(file => {
        const stableFile = stableFiles[file.path];
        delete stableFiles[file.path];

        return {
            type: stableFile ? VARIABLE.DIFF_TYPE.UPDATE : VARIABLE.DIFF_TYPE.CREATE,
            path: file.path,
            newest: file,
            stable: stableFile,
        };
    }).concat(Object.keys(stableFiles).map(fpath => {
        return {
            type: VARIABLE.DIFF_TYPE.DELETE,
            path: fpath,
            newest: undefined,
            stable: stableFiles[fpath],
        };
    }));

    timer();

    return this.difference;
};

Packer.prototype.match = function() {
    const timer = this.timer.record('match');

    this.resource = this.difference
    .map(diff => this.matcher.test(diff.path) === VARIABLE.MATCH_STAT.RELEASE ? diff.newest : diff.stable)
    .filter(item => !!item)
    .map(file => ({
        path: file.path,
        src: file.absolute,
        tmp: path.join(this.cache, 'tmp', file.path),
        file: file
    }));

    timer();

    return this.resource;
};

Packer.prototype.pack = function() {
    const timer = this.timer.record('pack');

    if (!this.newest || !this.stable) {
        throw new Error('please pack step by step');
    }

    this.backup && this.newest.getFile().forEach(file => fsExtra.copySync(file.absolute, path.join(this.backup, file.path)));

    this.resource.forEach(file => fsExtra.copySync(file.src, file.tmp));
    this.bundle.getFile().forEach(file => fsExtra.removeSync(file.absolute));
    this.resource.forEach(file => fsExtra.moveSync(file.tmp, path.join(this.bundle.dir, file.path)));

    timer();
};

Packer.prototype.clean = function() {
    const timer = this.timer.record('clean');

    try {
        fsExtra.removeSync(this.cache);
    } catch (e) {}

    timer()
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
