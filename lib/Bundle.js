"use strict";

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const noop = () => {};

function Bundle(dir, option) {
    this.dir = dir;
    this.type = option.type || 'unkonw';
    this.list = glob.sync(path.join(dir, '**/*'), {
        dot: !!option.dot
    });
    this.ignore = typeof option.ignore === 'function' ? option.ignore : noop;
    this.categories = null;
}

Bundle.prototype.getCategory = function (category) {
    if (this.categories && this.categories[category]) return this.categories[category];
    const categories = this.categories = {
        file: [],
        directory: []
    };
    if (!categories[category]) return [];
    this.list = this.list.map(fsPath => {
        try {
            let itemPath = '/' + fsPath.replace(this.dir, '').replace(/^\//, '');
            const stat = fs.statSync(fsPath);
            const item = {
                bundle: this,
                absolute: fsPath,
                path: itemPath,
                stat: stat
            };
            if (stat.isDirectory()) {
                item.path = item.path.replace(/\/$/, '') + '/';
                item.absolute = item.absolute.replace(/\/$/, '') + '/';
            }
            if (!this.ignore(item.path, stat)) {
                stat.isDirectory() && categories.directory.push(item);
                stat.isFile() && categories.file.push(item);
            }
            return item;
        } catch (e) {}
    }).filter(arg => !!arg);
    return categories[category];
};

Bundle.prototype.getFile = function () {
    return this.getCategory('file');
};

Bundle.prototype.getDirectory = function () {
    return this.getCategory('directory');
};


exports = module.exports = Bundle;
