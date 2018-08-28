const fs = require('fs');
const path = require('path');
const util = require('./index');
const configEnv = require('./config-env');


// env > cli > file
exports = module.exports = function(argv) {
    const envConfig = configEnv.parse(process.env[argv.configEnv || 'FREEPACK']);

    if (!(envConfig && typeof envConfig === 'object' && !Array.isArray(envConfig))) {
        throw new Error('Invalid env config');
    }

    if (envConfig.exclusive) {
        return envConfig;
    }

    const configs = {
        env: envConfig,
        cli: getCliConfig(argv),
        file: argv.ignoreConfigFile ? {} : getFileConfig(argv.config)
    };

    return Object.assign(
        {},
        configs.file,
        configs.cli,
        configs.env,
        {
            alias: Object.assign({}, configs.file.alias, configs.env.alias),
            module: Object.assign({}, configs.file.module, configs.env.module),
            ignore: ([]).concat(configs.file.ignore || [], configs.env.ignore || []),
            release: ([]).concat(configs.file.release || [], configs.env.release || []),
        }
    );
};


function getFileConfig(configPath) {
    configPath = configPath || 'freepack.config.js'
    configPath = path.resolve(process.cwd(), configPath);

    function read(fpath) {
        try {
            return JSON.parse(fs.readFileSync(fpath));
        } catch (e) {
            return require(fpath);
        }
    }

    if (fs.existsSync(configPath)) {
        let config = read(configPath) || {};
        if (typeof config === 'object' && !Array.isArray(config)) {
            return config;
        } else {
            throw new Error(`Invalid config file`);
        }
    } else {
        throw new Error(`not exist config file in ${fpath}`);
    }
}
exports.file = getFileConfig;

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
