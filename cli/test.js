"use strict";

const fs = require('fs');
const path = require('path');
const configYargs = require('./util/config-yargs');
const configParse = require('./util/config-parse');

const freepack = require('../');
const VARIABLE = require('../lib/variable');


exports.cmd = 'test';
exports.desc = 'Test config';
exports.builder = yargs => {
    configYargs(yargs)
        .option('module-coverage', {
            type: 'boolean',
            describe: 'Test coverage to the config module',
            defaultDescription: false,
            group: configYargs.LOCAL_GROUP
        })
        .option('report-file', {
            type: 'string',
            describe: 'Path to the report file',
            group: configYargs.LOCAL_GROUP,
            defaultDescription: false,
            requiresArg: true,
        })
        .option('print', {
            type: 'string',
            describe: 'Type of report to print to console',
            group: configYargs.LOCAL_GROUP,
            defaultDescription: 'default',
            choices: ['default', 'detail', 'none'],
            requiresArg: true,
        })
        .strict();
};

exports.handler = argv => {
    const config = configParse(argv);
    const packer = freepack.debug(Object.assign(config, argv.moduleCoverage ? {
        strict: true,
        release: Object.keys(config.module).map(key => {
            return config => config.symbol.module + key;
        })
    } : {}));
    const info = {
        cli: `test${argv.moduleCoverage ? '@module' : ''}`,
        src: packer.src,
        diff: packer.diff,
        source: packer.newest.dir,
        origin: packer.stable.dir,
        count: {
            source: packer.newest.getFile().length,
            origin: packer.stable.getFile().length,
        },
        resource: packer.resource.map(res => res.path),
        newest: packer.resource.filter(res => res.file.bundle.type === VARIABLE.BUNDLE_TYPE.NEWEST).map(res => res.path),
        stable: packer.resource.filter(res => res.file.bundle.type === VARIABLE.BUNDLE_TYPE.STABLE).map(res => res.path),
        option: packer.option,
        files: {
            source: packer.newest.getFile().map(file => file.path),
            origin: packer.stable.getFile().map(file => file.path),
        },
    };

    if (argv.moduleCoverage) {
        info.coverage = {};
        info.coverage.files = [].concat(
            packer.newest.getFile().map(file => file.path)
        ).concat(
            packer.stable.getFile().map(file => file.path)
        ).filter(
            (fpath, index, list) => index === list.indexOf(fpath)
        );
        info.coverage.overlay = info.coverage.files.filter(fpath => packer.matcher.test(fpath) !== VARIABLE.MATCH_STAT.UNMATCH);
        info.coverage.uncover = info.coverage.files.filter(fpath => packer.matcher.test(fpath) === VARIABLE.MATCH_STAT.UNMATCH);
        info.coverage.rate = info.coverage.overlay.length / info.coverage.files.length;
    }

    if (argv.print !== 'none') {
        console.log(`freepack ${info.cli}`);
        console.log(`source(${info.count.source}): ${info.src}`);
        console.log(`origin(${info.count.origin}): ${info.diff}`);
        console.log(`resource: ${info.resource.length}`);
        console.log(`newest: ${info.newest.length}`);
        console.log(`stable: ${info.stable.length}`);
        if (info.coverage) {
            console.log(`coverage: ${(info.coverage.rate * 100).toFixed(2)}% (${info.coverage.overlay.length}/${info.coverage.files.length})`);
        }
        if (argv.print === 'detail') {
            console.log('='.repeat(50));
            if (info.coverage) {
                if (info.coverage.uncover.length === 0) {
                    console.log('Congratulations, full files coverage!');
                } else {
                    console.log(`Uncover files(${info.coverage.uncover.length}):`);
                    console.log('-'.repeat(50));
                    info.coverage.uncover.forEach(fpath => console.log(`${fpath}`))
                }
            } else {
                info.newest.forEach(fpath => console.log(`[N] ${fpath}`));
                info.stable.forEach(fpath => console.log(`[S] ${fpath}`));
            }
            console.log('='.repeat(50));
        }
        console.log(info.option);
    }

    argv.reportFile && fs.writeFileSync(path.join(process.cwd(), argv.reportFile), JSON.stringify(info), 'utf8');
};
