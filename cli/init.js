"use strict";

const fs = require('fs');
const path = require('path');
const yeoman = require('yeoman-environment');
const Generator = require('yeoman-generator');
const freepack = require('../');


class generator extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.configuration = {
            config: {
                freepackOptions: {}
            }
        };
    }

    prompting() {
        const done = this.async();

        this.prompt({
            type: 'input',
            name: 'srcType',
            message: 'Which directory will be packed? [default: ./src]'
        })
        .then(srcTypeAnswer => {
            this.configuration.config.freepackOptions.src = srcTypeAnswer.srcType || './src';
        })
        .then(() => {
            return this.prompt({
                type: 'input',
                name: 'outputType',
                message: 'Which folder will your packed bundles to? [default: ./bundle]'
            });
        })
        .then(outputTypeAnswer => {
            this.configuration.config.freepackOptions.output = outputTypeAnswer.outputType || './bundle';
        })
        .then(() => {
            return this.prompt({
                type: 'confirm',
                name: 'advancedType',
                message: 'Do you want to make advanced settings?',
                default: false
            })
        })
        .then(advancedTypeAnswer => {
            if (advancedTypeAnswer.advancedType) {
                return this.prompt({
                    type: 'confirm',
                    name: 'backupType',
                    message: 'Will you want to skip backup?',
                    default: false
                })
                .then(backupTypeAnswer => {
                    if (backupTypeAnswer.backupType) {
                        this.configuration.config.freepackOptions.backup = false;
                    } else {
                        return this.prompt({
                            type: 'input',
                            name: 'backupType',
                            message: 'Which folder will your backup? [default: ./freepack-[date]]'
                        })
                        .then(backupTypeAnswer => {
                            this.configuration.config.freepackOptions.backup = backupTypeAnswer.backupType || true;
                        })
                    }
                })
                .then(() => {
                    return this.prompt([{
                        type: 'confirm',
                        name: 'matchType',
                        message: 'Will you want to match strict?',
                        default: false
                    }, {
                        type: 'confirm',
                        name: 'strictType',
                        message: 'Will you want to release strict?',
                        default: false
                    }, {
                        type: 'confirm',
                        name: 'dotType',
                        message: 'Will you want to release dot file?',
                        default: false
                    }]);
                })
                .then(answer => {
                    const { matchType, strictType, dotType } = answer;
                    if (matchType) {
                        this.configuration.config.freepackOptions.match = freepack.MODE.STRICT;
                    }
                    this.configuration.config.freepackOptions.strict = strictType;
                    this.configuration.config.freepackOptions.dot = dotType;
                })
            }
        })
        .then(() => {
            done();
        })
    }

    writing() {
        this.config.set('configuration', this.configuration);
    }
}


exports.cmd = 'init';
exports.desc = 'Init freepack config file';
exports.handler = (argv) => {
    const env = yeoman.createEnv('freepack', null);
    const generatorName = `freepack-init-generator`;
    env.registerStub(generator, generatorName);
    env.run(generatorName).on('end', (...args) => {
        let configModule;
        try {
          const configPath = path.resolve(process.cwd(), '.yo-rc.json');
          configModule = require(configPath);
          let tmpConfig = {};
          Object.keys(configModule).forEach(prop => {
            const configs = Object.keys(configModule[prop].configuration);
            configs.forEach(config => {
              tmpConfig[config] = configModule[prop].configuration[config];
            });
          });
          configModule = tmpConfig;
        } catch (err) {
          console.error(`\nCould not find a yeoman configuration file.\n`);
          console.error(`\nPlease make sure to use 'this.config.set('configuration', this.configuration);' at the end of the generator.\n`);
          Error.stackTraceLimit = 0;
          process.exitCode = -1;
        }


        const config = Object.assign(configModule.config.freepackOptions, {
            ignore: [],
            module: {},
            alias: {},
        });
        const configPath = path.join(process.cwd(), 'freepack.config.js');
        const configSource = JSON.stringify(config, null, 4);
        try {
            fs.writeFileSync(configPath, configSource, 'utf8');
        } catch (e) {}
    });
};
