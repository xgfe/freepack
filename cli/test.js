"use strict";

const fs = require('fs');
const path = require('path');
const freepack = require('../');
const configYargs = require('./util/config-yargs');
const configParse = require('./util/config-parse');


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
    const info = argv.moduleCoverage ? testModuleCoverage(config) : test(config);
    const packer = info.packer;
    const basic = [
        { key: 'freepack', value: info.type},
        { key: 'src', value: packer.src},
        { key: 'diff', value: packer.diff},
        { key: 'option', value: JSON.stringify(packer.option)}
    ].concat(info.basic);
    const detail = info.detail;

    if (argv.print !== 'none') {
        formatMessage(basic).concat(argv.print === 'detail' ? detail : []).forEach(message => console.log(message));
    }

    if (argv.reportFile) {
        const reportFilePath = path.join(process.cwd(), argv.reportFile);
        const fileSource = formatMessage(basic).concat(detail).join('\n');
        fs.writeFileSync(reportFilePath, fileSource, 'utf8');
    }
};

function testModuleCoverage(config) {
    config.release = Object.keys(config.module).map(key => config => config.symbol.module + key);

    const packer = freepack.debug(config);
    const TEST_STAT = freepack.variable.TEST_STAT;

    const info = {
        type: 'test module coverage',
        packer: packer,
        basic: [],
        detail: []
    };

    if (packer.rules.length() === 0) {
        info.basic.push('WARN: empty module config!');
        return info;
    }

    const files = ([]).concat(packer.newest.getFile(), packer.stable.getFile());
    const fileMap = [];
    const coverFiles = [];
    const uncoverFiles = [];
    files.forEach(file => {
        if (!fileMap[file.path]) {

            if (packer.rules.test(file.path) === TEST_STAT.UNRELEASE_UNMATCHED) {
                uncoverFiles.push(file);
            } else {
                coverFiles.push(file);
            }

            fileMap[file.path] = true;
        }
    });

    const total = Object.keys(fileMap).length;
    const cover = coverFiles.length;
    const uncover = uncoverFiles.length;
    const coverage = cover / total * 100;

    info.basic = [{
        key: 'coverage',
        value: `${coverage.toFixed(2)}%(${cover}/${total})`
    }, {
        key: 'total', value: `${total}`
    }, {
        key: 'cover', value: `${cover}`
    }, {
        key: 'uncover', value: `${uncover}`
    }]

    if (uncoverFiles.length === 0) {
        info.detail.push('Congratulations, full files coverage!');
    } else {
        info.detail.push(`Uncover files[${uncover}] in ${packer.src}`);
        uncoverFiles.forEach(file => info.detail.push(file.path));
    }

    return info;
}

function test(config) {
    const packer = freepack.debug(config);
    const BUNDLE_TYPE = freepack.variable.BUNDLE_TYPE;

    const newest = packer.resource.filter(res => res.file.bundle.type === BUNDLE_TYPE.NEWEST);
    const stable = packer.resource.filter(res => res.file.bundle.type === BUNDLE_TYPE.STABLE);

    const info = {
        type: 'test',
        packer: packer,
        basic: [
            { key: 'resource', value: `${packer.resource.length}` },
            { key: 'newest[N]', value: `${newest.length}` },
            { key: 'stable[S]', value: `${stable.length}` },
        ],
        detail: []
    };

    info.detail = packer.resource.map(res => `[${
        res.file.bundle.type === BUNDLE_TYPE.NEWEST ? 'N' : 'S'
    }]${res.path}`);

    return info;
}

function formatMessage(message) {
    let keyLength = 0;
    message.forEach(item => {
        if (typeof item === 'object') {
            keyLength = Math.max(item.key.length, keyLength);
        }
    });
    keyLength += 2;

    let keyPrefix = ' '.repeat(keyLength);

    return message.map(item => {
        if (typeof item === 'string') {
            return item;
        } else {
            let { key, value } = item;
            key, value
            key = keyPrefix + key + `${key ? ': ' : ''}`;
            return key.slice(key.length - keyLength) + value;
        }
    });
}
