"use strict";

const Packer = require('./Packer');
const VARIABLE = require('./variable');


function freepack(option, callback) {
    const packer = new Packer(option);

    packer.run(callback);

    return packer;
}

freepack.debug = option => {
    const packer = new Packer(option);

    packer.init();
    packer.compare();
    packer.match();
    packer.clean();

    return packer;
};

exports = module.exports = freepack;

exports.Packer = Packer;

exports.MODE = VARIABLE.MATCH_MODE;
