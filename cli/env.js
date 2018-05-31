"use strict";

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const configYargs = require('./util/config-yargs');
const configParse = require('./util/config-parse');


function generateEnv(configPath) {
    const configFile = configParse.file({ config: configPath });
    const modules = Object.keys(configFile.module || {});

    if (modules.length === 0) {
        throw new Error(`At least one presupposition module is needed`);
    }

    const config = {
        git: '',
        module: []
    };

    return inquirer.prompt({
        type: 'input',
        name: 'gitType',
        message: 'Which git tag or branch will be diff? [default: the previous tag]'
    })
    .then(gitTypeAnswers => {
        config.git = gitTypeAnswers.gitType;
    })
    .then(() => {
        return inquirer.prompt({
            type: 'checkbox',
            name: 'moduleType',
            message: 'Choice modules',
            choices: ['a', 'b', 'c']
        })
    })
    .then(moduleTypeAnswers => {
        config.module = moduleTypeAnswers.moduleType;
    })
    .then(() => {
        return JSON.stringify(config.git + ':' + config.module.join(','));
    });
}

exports.cmd = 'env [config]';
exports.desc = 'Generate env config string';
exports.builder = yargs => yargs
    .option('shortcut', {
        type: 'boolean',
        describe: 'Generate config to shortcut like git:modules,...',
        group: configYargs.BASIC_GROUP
    })
    .option('output', {
        type: 'string',
        describe: 'The output directory',
        group: configYargs.BASIC_GROUP,
        requiresArg: true
    })
    .strict();

exports.handler = argv => {
    new Promise((resolve, reject) => {
        if (argv.shortcut) {
            resolve(generateEnv(argv.config));
        } else {
            if (!(argv.config || typeof argv.config === 'string')) {
                reject('Required config path');
            }

            const configPath = path.join(process.cwd(), argv.config);
            const configFile = fs.readFileSync(configPath);
            const configObj = JSON.parse(configFile);
            const configStr = JSON.stringify(configObj);
            const configEnv = JSON.stringify(configStr);
            resolve(configEnv);
        }
    })
    .then(configEnv => {
        console.log(configEnv);
        if (argv.output) {
            const outputPath = path.join(process.cwd(), argv.output);
            fs.writeFileSync(outputPath, configEnv, 'utf8');
        }
    })
    .catch(e => {
        throw new Error(e);
    });
};
