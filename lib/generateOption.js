"use strict";


exports = module.exports = option => {
    option = Object.assign({
        context: undefined,
        src: undefined,
        diff: undefined,
        output: undefined,
        match: undefined,
        dot: false,
        backup: true,
        strict: false,
    }, option);

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
