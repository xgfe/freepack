const path = require('path');
const util = require('./index');
const configEnv = require('./config-env');
const readConfig = require('./readConfig');


// env > cli > file
exports = module.exports = function(argv) {
    const configEnv = getEnvConfig(argv);
    const configCli = configEnv.exclusive ? {} : getCliConfig(argv);
    const configFile = configEnv.exclusive ? {} : getFileConfig(argv);

    return Object.assign({
        context: process.cwd(),
        src: 'src',
        diff: undefined,
        output: 'bundle',
        match: undefined,
        dot: false,
        backup: true,
        symbol: undefined,
        strict: false,
    }, configFile, configCli, configEnv, {
        ignore: ([]).concat(configFile.ignore || [], configEnv.ignore || []),
        alias: Object.assign({}, configFile.alias, configEnv.alias),
        module: Object.assign({}, configFile.module, configEnv.module),
        release: ([]).concat(configFile.release || [], configEnv.release || []),
    });
};


function getFileConfig(argv) {
    if (argv.ignoreConfigFile) {
        return {};
    }

    let config = readConfig(argv.config || 'freepack.config.js');

    if (!config && argv.config) {
        throw new Error(`Can't parse config from ${argv.config}`);
    }

    config = config || {};

    if (typeof config !== 'object' || Array.isArray(config)) {
        throw new Error(`Invalid config file`);
    }

    return config;
}
exports.file = getFileConfig;

function getEnvConfig(argv) {
    const env_name = argv.configEnv || 'FREEPACK';
    const env_str = process.env[env_name];

    return configEnv.parse(env_str);
}
exports.env = getEnvConfig;

function getCliConfig(argv) {
    const configs = [];

    argv.context && configs.push(['context', argv.context]);
    argv.src && configs.push(['src', argv.src]);
    argv.diff && configs.push(['diff', argv.diff]);
    argv.output && configs.push(['output', argv.output]);
    argv.match && configs.push(['match', argv.match]);
    argv.backup && configs.push(['backup', argv.backup]);
    argv.backupSkip && configs.push(['backup', false]);
    argv.releaseStrict && configs.push(['strict', argv.releaseStrict]);

    const config = {};

    configs.forEach(arg => {
        config[arg[0]] = arg[1];
    });

    return config;
}
exports.cli = getCliConfig;
