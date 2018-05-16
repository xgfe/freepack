const fs = require('fs');
const path = require('path');
const glob = require('glob');


function Bundle(dir, type) {
    this.type = type;
    this.dir = dir;
    this.list = glob.sync(path.join(dir, '**/*'), {
      dot: true
    });
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
        if (!fs.existsSync(fsPath)) return;
        const stat = fs.statSync(fsPath);
        const item = {
            bundle: this,
            absolute: fsPath,
            path: '/' + fsPath.replace(this.dir, '').replace(/^\//, ''),
            stat: stat
        };
        if (stat.isDirectory()) {
            categories.directory.push(item)
        } else if (stat.isFile()) {
            categories.file.push(item)
        }
        return item;
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
