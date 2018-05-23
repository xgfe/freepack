"use strict";

const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const uuid = require('./util/uuid');
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

    this.newest = null;
    this.stable = null;

    this.difference = [];
    this.resource = [];
}

Packer.prototype.init = function() {
    this.time.begin('init');

    this.createNewest();
    this.createStable();

    this.time.end('init');
};

Packer.prototype.createNewest = function() {
    let newest_dir = this.option.root;
    this.newest = new Bundle(newest_dir, {
        type: 'newest',
        ignore: this.ignore
    });
};

Packer.prototype.createStable = function() {
    const option = this.option;

    let stable_dir = option.diff;
    if (!stable_dir) {
        // create diff dir by git
        const [ git_path, src_path, diff_tag ] = option.git;
        const git_dir = path.join(this.cache, 'stable');
        createDiff(git_dir, git_path, diff_tag);
        stable_dir = path.join(git_dir, src_path || '');
    }

    this.stable = new Bundle(stable_dir, {
        type: 'stable',
        ignore: this.ignore
    });
};

Packer.prototype.diff = function() {
    this.time.begin('diff');

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

    this.time.end('diff');
    return this.difference;
};

Packer.prototype.match = function() {
    this.time.begin('match');

    const tmpDir = path.join(this.cache, 'tmp');
    const baseDir = this.newest.dir;

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
        // fsExtra.moveSync(item.src, item.tmp);
    });

    this.newest.getFile().forEach(item => {
        fsExtra.removeSync(item.absolute);
    });

    this.resource.forEach(item => {
        // console.log('move', item.tmp, '=>', item.tar);
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
    this.diff();
    this.match();
    this.pack();
    this.clean();

    setTimeout(() => {
        callback(this);
    }, 0);
};


exports = module.exports = Packer;
