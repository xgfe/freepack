"use strict";

const freepack = require('../');
const configYargs = require('./util/config-yargs');
const configParse = require('./util/config-parse');


exports.commands = [
    require('./env'),
    require('./init'),
    require('./diff'),
    require('./test'),
];

exports.builder = configYargs;

exports.handler = argv => {
    const config = configParse(argv);
    freepack(config, packer => {
        const time = packer.time;
        console.log('freepack:', `${time.total()}ms`);
        console.log('      id:', packer.id);
        console.log('     src:', packer.src);
        console.log('    diff:', packer.diff);
        console.log('  output:', packer.output);
        console.log('  backup:', packer.backup);
        console.log('timeused:', time.list().map(([type, millisecond]) => `${type}[${millisecond}ms]`).join(', '));
        console.log(' release:', JSON.stringify(packer.option.release));
        console.log('  option:', JSON.stringify(packer.option));
    });
};
