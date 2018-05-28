#!/usr/bin/env node


(function() {
    const yargs = require('yargs');
    const cli = require('../cli');
    const noop = () => {};

    [Object.assign({
        cmd: '$0'
    }, cli)].concat(cli.commands).forEach(command => yargs.command(
        command.cmd,
        command.desc || '',
        command.builder || noop,
        command.handler || noop
    ));

    const CONFIG_GROUP = "Config options:";

    yargs
        .usage(`freepack ${
            require('../package.json').version
        }

Usage: freepack [options]
       freepack <command> [options]`)
        .help('help')
        .alias('help', 'h')
        .version()
        .alias('version', 'v')
        .argv
}());
