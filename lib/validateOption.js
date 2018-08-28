"use strict";

const VARIABLE = require('./variable');


exports = module.exports = option => {
    option = Object.assign({
        diff: undefined,
        // the source for freepack (required)
        //   - git[:commit] defaults to the lastest tag of git
        //   - path[:dirname]

        context: '',
        // the home directory for freepack
        //   resolve relative to process cwd

        src: 'src',
        // the directory for freepack
        //   resolve relative to context

        output: 'bundle',
        // the target directory for all output files
        //   resolve relative to context

        match: VARIABLE.MATCH_MODE.NORMAL,
        // the mode of match when multiple rules match the same file
        //   - freepack.MODE.NORMAL
        //   - freepack.MODE.WARN
        //   - freepack.MODE.STRICT

        strict: false,
        // use source without rules

        release: [],
        // the rules for freepack

        alias: {},
        // the mapping of rule alias

        module: {},
        // the mapping of rules collection

        symbol: {
            negation: '!',
            relation: ':',
            separation: ',',
            file: '$',
            regexp: '~',
            match: '-',
            alias: '$',
            module: '@',
        },
        // the symbol of rules

        ignore: [],
        // the rules for ignore files

        dot: false,
        // Include .dot files in normal matches and globstar matches.
        // Note that an explicit dot in a portion of the pattern will always match dot files.

        backup: 'freepack-[date]',
        // the directory for src backup
    }, option);

    const error = [];

    option.diff
        ? typeof option.diff !== 'string' && error.push(`option.diff invalid`)
        : error.push(`required option.diff`);

    typeof option.context !== 'string' && error.push(`option.context must be string`);

    typeof option.src !== 'string' && error.push(`option.src must be string`);

    typeof option.output !== 'string' && error.push(`option.output must be string`);

    Object.keys(VARIABLE.MATCH_MODE).map(
        mode => VARIABLE.MATCH_MODE[mode]
    ).indexOf(option.match) < 0 && error.push(`option.match invalid`);

    typeof option.alias === 'object'
        ? Object.keys(option.alias).forEach(
            key => !(
                option.alias[key] && typeof option.alias[key] === 'string'
            ) && error.push(`option.alias ${key} must be exist string value`)
        )
        : error.push(`option.alias must be object`);

    typeof option.module !== 'object' && error.push(`option.module must be object`);

    typeof option.symbol === 'object'
        ? ['negation', 'relation', 'separation', 'regexp', 'match', 'alias', 'module', 'file'].forEach((key, index, keys) => {
            const symbol = option.symbol[key];

            symbol
                ? typeof symbol === 'string' && symbol.length === 1
                    ? key !== 'file'
                        && keys
                            .filter(k => k !== 'file' && k !== key)
                            .map(key => option.symbol[key])
                            .indexOf(symbol) > -1
                        && error.push(`symbol.${key} duplicate`)
                    : error.push(`symbol.${key} must be single character string`)
                : error.push(`symbol.${key} required`);
        })
        : error.push(`option.symbol must be object`);

    Array.isArray(option.ignore)
        ? !option.ignore.every(
            item => item && typeof item === 'string'
        ) && error.push(`option.ignore invalid`)
        : error.push(`option.ignore must be array`);

    option.backup && typeof option.backup !== 'string' && error.push(`option.backup must be string`);

    if (error.length > 0) {
        throw new Error(`Invalid arguments:\n` + error.join('\n'));
    }

    // support for dynamic env shortcut config
    option.release = option.release.map(rule => typeof rule === 'function' ? rule(option) : rule)

    return option;
};
