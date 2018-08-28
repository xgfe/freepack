"use strict";

const fs = require('fs');
const path = require('path');
const configYargs = require('./util/config-yargs');
const configParse = require('./util/config-parse');

const freepack = require('../');
const VARIABLE = require('../lib/variable');


exports.cmd = 'diff';
exports.desc = 'Compare files between src and diff';
exports.builder = yargs => {
    configYargs(yargs)
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

exports.handler = (argv) => {
    const config = configParse(argv);
    const packer = freepack.debug(config);

    const difference = { update: [], create: [], delete: [] };
    packer.difference.forEach(diff => {
        let fpath = diff.path;
        switch (diff.type) {
            case VARIABLE.DIFF_TYPE.CREATE:
                difference.create.push(fpath);
                break;
            case VARIABLE.DIFF_TYPE.DELETE:
                difference.delete.push(fpath);
                break;
            default:
                difference.update.push(fpath);
                break;
        }
    });

    // [+] Create, [-] Delete, [ ] Update
    const info = {
        cli: 'diff',
        src: packer.src,
        diff: packer.diff,
        source: packer.newest.dir,
        origin: packer.stable.dir,
        count: {
            source: packer.newest.getFile().length,
            origin: packer.stable.getFile().length,
            create: difference.create.length,
            delete: difference.delete.length,
            update: difference.update.length
        },
        create: difference.create,
        delete: difference.delete,
        update: difference.update,
        files: {
            source: packer.newest.getFile().map(file => file.path),
            origin: packer.stable.getFile().map(file => file.path),
        }
    };

    if (argv.print !== 'none') {
        console.log(`freepack diff`);
        console.log(`source(${info.count.source}): ${info.src}`);
        console.log(`origin(${info.count.origin}): ${info.diff}`);
        console.log(`create files: ${info.count.create}`);
        console.log(`delete files: ${info.count.delete}`);
        console.log(`update files: ${info.count.update}`);
        if (argv.print === 'detail') {
            console.log('-'.repeat(50));
            info.create.forEach(s => console.log(`[+] ${s}`));
            info.delete.forEach(s => console.log(`[-] ${s}`));
            console.log(`[ ] ${info.update.length} MORE...`);
            console.log('='.repeat(50));
            console.log('[+] Create, [-] Delete, [ ] Update');
        }
    }

    argv.reportFile && fs.writeFileSync(path.join(process.cwd(), argv.reportFile), JSON.stringify(info), 'utf8');
};
