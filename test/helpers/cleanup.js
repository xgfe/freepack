const rimraf = require('rimraf');


module.exports.cleanup = function cleanup(dir) {
    rimraf.sync(dir);
};
