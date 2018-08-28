"use strict";

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const configYargs = require('./util/config-yargs');
const configParse = require('./util/config-parse');
const configEnv = require('./util/config-env');


function generateEnv(configPath) {
    const modules = Object.keys(configParse.file(configPath).module || {});

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
            choices: modules
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
            if (!(argv.config && typeof argv.config === 'string')) {
                reject('Required config path');
            }

            const configPath = path.resolve(process.cwd(), argv.config);
            const configFile = fs.readFileSync(configPath);
            inquirer.prompt({
                type: 'confirm',
                name: 'exclusive',
                message: '[WARN] generate exclusive env config, other config (file, cli) will inoperative!!!',
                default: false
            }).then(exclusiveAnswer => {
                let config = configEnv.env(JSON.parse(configFile));
                config.exclusive = exclusiveAnswer.exclusive;
                resolve(config);
            });
        }
    })
    .then(env => {
        console.log(env);
        if (argv.output) {
            const outputPath = path.join(process.cwd(), argv.output);
            fs.writeFileSync(outputPath, env, 'utf8');
        }
    })
    .catch(e => {
        throw new Error(e);
    });
};
