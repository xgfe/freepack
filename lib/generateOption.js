"use strict";


exports = module.exports = option => {
    option = Object.assign({
        context: undefined,
        src: 'src',
        diff: undefined,
        output: 'bundle',
        match: undefined,
        dot: false,
        backup: true,
        strict: false,
    }, option);

    option.backup = option.backup
        ? (
            typeof option.backup === 'string' ? option.backup : 'freepack-[date]'
        )
        : false;
    option.ignore = option.ignore || [];
    option.alias = option.alias || {};
    option.module = option.module || {};
    option.symbol = option.symbol || {
        negation: '!',
        relation: ':',
        separation: ',',
        file: '$',
        regexp: '~',
        match: '-',
        alias: '$',
        module: '@',
    };

    option.release = Array.isArray(option.release)
        ? option.release.map(rule => typeof rule === 'function' ? rule(option) : rule)
        : (option.release || []);

    return option;
};
