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
            : path => path.lastIndexOf('/' + rule) === path.length - rule.length - 1;
    });

    return function(path, stat) {
        if (!stat.isFile()) return false;

        for (var i = 0; i < rules.length; i++) {
            if (rules[i](path, stat)) {
                return true;
            }
        }

        return false;
    };
};
