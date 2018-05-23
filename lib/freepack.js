"use strict";

const version = require('../package.json').version;
const Packer = require('./Packer');
const validateOption = require('./validateOption');

function getPacker(option) {
    option = Object.assign({}, typeof option === 'object' ? option : {});

    option.release = option.release || [];
    option.alias = option.alias || {};
    option.module = option.module || {};
    option.symbol = Object.assign({
        negation: '!',
        relation: ':',
        separation: ',',
        file: '$',
        regexp: '~',
        match: '-',
        alias: '$',
        module: '@',
    }, option.symbol);

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

freepack.diff = (option) => {
    const packer = getPacker(option);

    packer.init();
    packer.diff();
    packer.clean();

    return packer;
};

freepack.test = (option) => {
    const packer = getPacker(option);

    packer.init();
    packer.diff();
    packer.match();
    packer.clean();

    return packer;
};
