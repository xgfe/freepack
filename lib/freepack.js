"use strict";

const version = require('../package.json').version;
const Packer = require('./Packer');
const VARIABLE = require('./VAR');
const validateOption = require('./validateOption');
const generateOption = require('./generateOption');


function getPacker(option) {
    validateOption(option);

    return new Packer(generateOption(option));
}


const freepack = (option, callback) => {
    const packer = getPacker(option);

    packer.run(callback);

    return packer;
};

exports = module.exports = freepack;


freepack.packer = getPacker;
freepack.version = version;
freepack.variable = VARIABLE;

freepack.debug = option => {
    const packer = getPacker(option);

    packer.init();
    packer.compare();
    packer.match();
    packer.clean();

    return packer;
};
