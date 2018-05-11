"use strict";

const version = require('../package.json').version;
const leftPad = require('left-pad');
const Packer = require('./Packer');
const validateOption = require('./validateOption');

const freepack = (option, callback) => {
    validateOption(option);

    const packer = new Packer(option);

    packer.clean();

    packer.run(() => {
        const time = packer.time.get();
        console.log('='.repeat(24));
        console.log(`${leftPad('Time Used:', 12)} ${time.total}ms`);
        console.log('-'.repeat(24));
        time.children.forEach(t => {
            console.log(`${leftPad(t[0] + ':', 12)} ${t[1]}ms`);
        });
        console.log('='.repeat(24));

        callback();
    });

    return packer;
};

exports = module.exports = freepack;


freepack.diff = (option, callback) => {
    // const packer = new Packer(option);
    // packer.init();
    // packer.diff();
    // packer.clean();
    // return packer;
};

freepack.test = (option, callback) => {
    // const packer = new Packer(option);
    // packer.init();
    // packer.diff();
    // packer.match();
    // packer.clean();
    // return packer;
};