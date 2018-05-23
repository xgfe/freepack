"use strict";

const version = require('../package.json').version;
const Packer = require('./Packer');
const validateOption = require('./validateOption');

function getPacker(option) {
    validateOption(option);
    return new Packer(option)
}

const freepack = (option, callback) => {
    const packer = getPacker(option);

    packer.run(callback);

    return packer;
};

exports = module.exports = freepack;


freepack.packer = getPacker;
freepack.version = version;

freepack.diff = (option, callback) => {
    // const packer = getPacker(option);

    // packer.init();
    // packer.diff();
    // packer.clean();

    // return packer;
};

freepack.test = (option, callback) => {
    const packer = getPacker(option);

    packer.init();
    packer.diff();
    packer.match();
    packer.clean();

    return packer;
};
