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
    rules = rules.map(rule => rule.charAt(0) === '/'
        ? path => path === rule
        : path => {
            const index = path.lastIndexOf('/' + rule);
            return index > -1 && index === path.length - rule.length - 1;
        }
    );

    return function(path, stat) {
        if (!stat.isFile()) return false;

        for (let i = 0; i < rules.length; i++) {
            if (rules[i](path)) {
                return true;
            }
        }

        return false;
    };
};
