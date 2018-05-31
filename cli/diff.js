"use strict";

const freepack = require('../');
const configYargs = require('./util/config-yargs');
const configParse = require('./util/config-parse');


exports.cmd = 'diff';
exports.desc = 'Compare files between src and diff';
exports.builder = configYargs;

exports.handler = (argv) => {
    const config = configParse(argv);
    const packer = freepack.debug(config);
    const DIFF_TYPE = freepack.variable.DIFF_TYPE;

    const diffUpdate = [];
    const diffCreate = [];
    const diffDelete = [];
    packer.difference.forEach(diff => {
        switch (diff.type) {
            case DIFF_TYPE.CREATE:
                diffCreate.push(diff);
                break;
            case DIFF_TYPE.DELETE:
                diffDelete.push(diff);
                break;
            default:
                diffUpdate.push(diff);
                break;
        }
    });

    console.log('freepack:', `diff`);
    console.log('     src:', `${packer.newest.getFile().length}[${packer.src}]`);
    console.log('    diff:', `${packer.stable.getFile().length}[${packer.diff}]`);
    console.log('     [+]:', diffCreate.length);
    console.log('     [-]:', diffDelete.length);
    console.log('     [ ]:', diffUpdate.length);
    console.log('');
    console.log('  option:', JSON.stringify(packer.option));
};
