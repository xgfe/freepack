const fs = require('fs');
const path = require('path');


module.exports.list = function list(src) {
    src = path.resolve(src);
    if (!fs.existsSync(src)) return [];
    if (!fs.statSync(src).isDirectory()) return [];
    let files = [];
    fs.readdirSync(src).forEach(filename => {
        const srcFile = path.join(src, filename);
        const directory = fs.statSync(srcFile).isDirectory();
        files = files.concat(directory ? list(srcFile) : srcFile)
    });
    return files;
};
