const freepack = require('../../');

const CONFIG_GROUP = 'Config options:';
const BASIC_GROUP = 'Basic options:';
const ADVANCED_GROUP = 'Advanced options:';
const LOCAL_GROUP = 'Local options:';


// env => cli => file
exports = module.exports = yargs => yargs
    .option('config', {
        type: 'string',
        alias: 'c',
        describe: 'Path to the config file',
        group: CONFIG_GROUP,
        defaultDescription: 'freepack.config.js',
        requiresArg: true,
    })
    .option('config-env', {
        describe: 'Name to the config enviroment',
        group: CONFIG_GROUP,
        defaultDescription: 'FREEPACK',
        requiresArg: true,
    })
    .option('context', {
        type: 'string',
        describe: 'The base directory for resolving like the `src`, `diff` and `output` options. If the `diff` target is git, the path must be git repository',
        group: BASIC_GROUP,
        defaultDescription: 'The current directory',
        requiresArg: true
    })

    .option('src', {
        type: 'string',
        describe: 'The directory of the pack.',
        group: BASIC_GROUP,
        defaultDescription: 'src',
        requiresArg: true
    })
    .option('diff', {
        type: 'string',
        describe: 'The diff target, git[:branch] or path:target',
        group: BASIC_GROUP,
        requiresArg: true
    })
    .option('output', {
        type: 'string',
        describe: 'The output directory',
        group: BASIC_GROUP,
        defaultDescription: 'bundle',
        requiresArg: true
    })

    .option('match', {
        type: 'string',
        describe: 'The match mode',
        group: ADVANCED_GROUP,
        choices: Object.keys(freepack.variable.MATCH_MODE).map(mode => freepack.variable.MATCH_MODE[mode]),
        requiresArg: true
    })
    .option('backup', {
        type: 'string',
        describe: 'The backup directory',
        group: ADVANCED_GROUP,
        requiresArg: true,
        defaultDescription: 'freepack-[date]',
    })
    .option('backup-skip', {
        type: 'boolean',
        describe: 'Skip backup `src` files',
        group: ADVANCED_GROUP
    })
    .option('release-strict', {
        type: 'boolean',
        describe: 'Strictly abide by the release rules that are undefined or empty',
        group: ADVANCED_GROUP
    })
    .option('ignore-config-file', {
        type: 'boolean',
        describe: 'Ignore the config file, suitable for emergencies, only support env or cli',
        group: ADVANCED_GROUP
    })
    .strict();


exports.CONFIG_GROUP = CONFIG_GROUP;
exports.BASIC_GROUP = BASIC_GROUP;
exports.ADVANCED_GROUP = ADVANCED_GROUP;
exports.LOCAL_GROUP = LOCAL_GROUP;
