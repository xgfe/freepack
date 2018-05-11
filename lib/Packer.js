const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const Time = require('./Time');
const Match = require('./Match');
const Bundle = require('./Bundle');
const createDiff = require('./createDiff');


function Packer(option) {
    this.option = option;
    this.root = option.root;
    this.dirs = {
        curr: option.root,
        cache: option.cache,
        temp: path.join(option.cache, 'temp'),
        diff: path.join(option.cache, 'diff')
    };
    this.bundle = {}; // curr: Bundle, diff: Bundle
    this.difference = {}; // add 新增, del 删除, non 都存在(=> same change)
    this.rules = new Match(option, option.release);
    this.resource = null;
    this.time = new Time();
    this.initialized = false;

    console.log(this.option)
    console.log(this.dirs)
}

Packer.prototype.init = function() {
    this.time.start('init');

    this.initialized = true;

    this.bundle.curr = new Bundle(this.dirs.curr, 'curr');

    this.dirs.diff = createDiff({
        root: this.option.root,
        git: this.option.git,
        dir: this.dirs.diff,
        tag: this.option.diff
    });
    this.bundle.diff = new Bundle(this.dirs.diff, 'diff');

    this.time.end('init');
};

Packer.prototype.diff = function() {
    this.time.start('diff');

    const difference = this.difference = { add: [],  del: [],  non: [] };

    if (!(this.bundle.curr && this.bundle.diff)) return difference;

    const diff = {};
    this.bundle.diff.getFile().forEach(item => {
        diff[item.path] = item;
    });

    this.bundle.curr.getFile().forEach(item => {
        const meta = {
            path: item.path,
            curr: item,
            diff: diff[item.path]
        };
        if (meta.diff) {
            difference.non.push(meta);
            delete diff[item.path];
        } else {
            difference.add.push(meta);
        }
    });

    Object.keys(diff).forEach(delPath => {
        difference.del.push({
            path: delPath,
            curr: undefined,
            diff: diff[delPath]
        })
    });

    this.time.end('diff');

    return difference;
};

Packer.prototype.match = function() {
    this.time.start('match');

    const difference = this.difference;

    this.resource = [];

    if (!(difference.add && difference.del && difference.non)) return this.resource;

    const rules = this.rules;
    const base = this.root;
    const temp = this.dirs.temp;
    this.resource = this.resource.concat(
        difference.add.map(item => rules.test(item.path) ? item.curr : undefined),
        difference.del.map(item => rules.test(item.path) ? undefined : item.diff),
        difference.non.map(item => rules.test(item.path) ? item.curr : item.diff)
    ).filter(item => !!item).map(file => {
        const item = {
            path: file.path,
            src: file.absolute,
            tmp: path.join(temp, file.path),
            tar: path.join(base, file.path),
            file: file,
        };
        return item;
    });

    this.time.end('match');

    let same = 0;
    this.resource.forEach(item => {
        if (item.src === item.tar) {
            same += 1;
        } else {
        }
    });
    console.log('total: ', this.resource.length);
    console.log('same: ', same);
    console.log('diff: ', this.resource.length - same);

    return this.resource;
};

Packer.prototype.pack = function() {
    this.time.start('pack');

    if (!this.resource) return;

    // TODO record log

    // console.log('='.repeat(100));
    // console.log('create temp bundle');
    // console.log('-'.repeat(100));
    this.resource.forEach(item => {
        // TODO if item.src === item.tar, don't copy/move
        // console.log('copy', item.src, '=>', item.tmp);
        try {
            fsExtra.copySync(item.src, item.tmp);
            // fsExtra.moveSync(item.src, item.tmp);
        } catch (e) {
            throw new Error(e)
        }
    });

    // console.log('clean root');
    this.bundle.curr.getFile().forEach(item => {
        try {
            fsExtra.removeSync(item.absolute);
        } catch (e) {
            throw new Error(e)
        }
    });

    // console.log('='.repeat(100));
    // console.log('move temp to root');
    // console.log('-'.repeat(100));
    this.resource.forEach(item => {
        // console.log('move', item.tmp, '=>', item.tar);
        try {
            fsExtra.moveSync(item.tmp, item.tar);
        } catch (e) {
            throw new Error(e)
        }
    });

    this.time.end('pack');
};

Packer.prototype.clean = function() {
    this.time.start('clean');

    try {
        fsExtra.removeSync(this.dirs.cache);
    } catch (e) {
        throw new Error(e)
    }

    this.time.end('clean');
};

Packer.prototype.run = function(callback) {
    this.init();
    this.diff();
    this.match();
    this.pack();
    this.clean();

    callback();
};


exports = module.exports = Packer;
