"use strict";

const version = require('../package.json').version;
const Packer = require('./Packer');
const validateOption = require('./validateOption');

const freepack = (option, callback) => {
    validateOption(option);

    const packer = new Packer(option);

    packer.run(callback);

    return packer;
};

exports = module.exports = freepack;


freepack.diff = (option, callback) => {
    const packer = new Packer(option);
    packer.init();
    packer.diff();
    packer.clean();
    return packer;
};

freepack.test = (option, callback) => {
    const packer = new Packer(option);
    packer.init();
    packer.diff();
    packer.match();
    packer.clean();
    return packer;
};
