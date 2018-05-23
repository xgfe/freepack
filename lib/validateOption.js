"use strict";


exports = module.exports = option => {
    const error = [];

    if (!option.root) {
        error.push(`required option.root`);
    }

    if (!option.diff && !option.git) {
        error.push(`required option.diff or option.git`);
    }

    if (!option.diff && option.git && !Array.isArray(option.git)) {
        error.push(`option.git like [ git_path, src_path, diff_tag ]`);
    }

    if (typeof option.alias === 'object') {
        Object.keys(option.alias).forEach(key => {
            if (!(typeof option.alias[key] === 'string' && option.alias[key])) {
                error.push(`option.alias ${key} must be exist string value`);
            }
        });
    } else {
        error.push(`option.alias must be object`);
    }

    if (typeof option.module !== 'object') {
        error.push(`option.module must be object`);
    }

    const symbolMap = [];
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

    if (error.length > 0) {
        throw new Error(`Invalid arguments:\n` + error.join('\n'));
    }
};
