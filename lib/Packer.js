const path = require('path');
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
    this.rules = new Match(option);
    this.resource = null;
    this.time = new Time();
    this.initialized = false;
}

Packer.prototype.init = function() {
    this.time.start('init');

    // TODO remove cache dir
    require('child_process').execSync(`rm -rf ${this.dirs.cache}`);

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
    this.resource = this.resource.concat(
        difference.add.map(item => rules.test(item.path) ? item.curr : undefined),
        difference.del.map(item => rules.test(item.path) ? undefined : item.diff),
        difference.non.map(item => rules.test(item.path) ? item.curr : item.diff)
    ).filter(item => !!item);

    this.time.end('match');

    return this.resource;
};

Packer.prototype.pack = function() {
    this.time.start('pack');

    if (!this.resource) return;

    // TODO
    // console.log(this.bundle.curr.getFile().length)
    // console.log(this.bundle.diff.getFile().length)
    // console.log(this.resource.length)
    this.resource
    .slice(0, 10)
    .forEach(item => {
        console.log(item.bundle.type, item.path)
    });

    this.time.end('pack');
};

Packer.prototype.clean = function() {
    this.time.start('clean');

    this.time.end('clean');
};

Packer.prototype.run = function(callback) {
    this.init();
    this.diff();
    this.match();
    this.pack();
    this.clean();

    console.log(this.time.get('init') + 'ms')
    console.log(this.time.get('diff') + 'ms')
    console.log(this.time.get('match') + 'ms')
    console.log(this.time.get('pack') + 'ms')
    console.log(this.time.get('clean') + 'ms')
};


exports = module.exports = Packer;
