const fs = require('fs');


exports.isDirectory = fsPath => fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory();
exports.isFile = fsPath => fs.existsSync(fsPath) && fs.statSync(fsPath).isFile();
