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
    freepack(config, packer => console.log('freepack', JSON.stringify({
        uuid: packer.uuid,
        src: packer.src,
        diff: packer.diff,
        output: packer.output,
        backup: packer.backup,
        time: packer.timer.list().map(([type, millisecond]) => `${type}[${millisecond}ms]`).join(', '),
        times: `${packer.timer.total()}ms`,
        option: JSON.stringify(packer.option),
        matcher: packer.matcher.toString().split('\n')
    })));
};
