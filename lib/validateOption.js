"use strict";

const VARIABLE = require('./VAR');


exports = module.exports = option => {
    const error = [];

    if (!option.context) {
        error.push(`required option.context`);
    }

    if (!option.diff) {
        error.push(`required option.diff`);
    }

    if (option.src && typeof option.src !== 'string') {
        error.push(`option.src must be string`);
    }

    if (option.output && typeof option.output !== 'string') {
        error.push(`option.output must be string`);
    }

    if (option.match && Object.keys(VARIABLE.MATCH_MODE).map(mode => VARIABLE.MATCH_MODE[mode]).indexOf(option.match) < 0) {
        error.push(`option.match invalid`);
    }

    if (option.alias) {
        if (typeof option.alias === 'object' && !Array.isArray(option.alias)) {
            Object.keys(option.alias).forEach(key => {
                if (!(typeof option.alias[key] === 'string' && option.alias[key])) {
                    error.push(`option.alias ${key} must be exist string value`);
                }
            });
        } else {
            error.push(`option.alias must be object`);
        }
    }

    if (option.module) {
        if (!(typeof option.module === 'object' && !Array.isArray(option.module))) {
            error.push(`option.alias must be object`);
        }
    }


    if (option.symbol) {
        if (typeof option.symbol !== 'object') {
            error.push(`option.symbol must be object`);
        } else if (JSON.stringify(Object.keys(option.symbol).sort()) !== JSON.stringify(VARIABLE.RULE_SYMBOL_TYPES)) {
            error.push(`option.symbol invalid`);
        } else {
            const symbolMap = {};
            const symbolError = {};
            Object.keys(option.symbol).forEach(key => {
                const symbol = option.symbol[key];
                if (typeof symbol !== 'string' || symbol.length !== 1) {
                    return error.push(`${key} symbol must be a character`);
                }

                if (key === 'file') {
                    return;
                }

                if (symbolMap[symbol]) {
                    symbolError[symbol] = symbolError[symbol] || [symbolMap[symbol]];
                    symbolError[symbol].push(key)
                } else {
                    symbolMap[symbol] = key;
                }
            });

            Object.keys(symbolError).forEach(symbol => {
                error.push(`symbol ${symbol} repeat in ${symbolError[symbol].join(', ')}`);
            });
        }
    }

    if (error.length > 0) {
        throw new Error(`Invalid arguments:\n` + error.join('\n'));
    }
};
