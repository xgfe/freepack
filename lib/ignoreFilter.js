"use strict";

/**
 * ignore filter
 * @param  {Array} rules string rule
 * @return {Function}    ignore fn, true => ignore
 * @example
 * /file.js => [/file.js]
 * file.js => [/file.js, /path/file.js, ...]
 */
exports = module.exports = function ignore(rules) {
    rules = (Array.isArray(rules) ? rules : []).map(rule => {
        if (typeof rule !== 'string') {
            throw new Error('ignore must be string');
        }
        if (rule.length === 0) {
            throw new Error('ignore can\'t be empty');
        }
        return rule.charAt(0) === '/'
            ? path => path === rule
            : path => {
                const index = path.lastIndexOf('/' + rule);
                return index > -1 && index === path.length - rule.length - 1;
            };
    });

    return function(path, stat) {
        if (!stat.isFile()) return false;

        for (let i = 0; i < rules.length; i++) {
            if (rules[i](path, stat)) {
                return true;
            }
        }

        return false;
    };
};
