const path = require('path');
const minimatch = require('minimatch');


function Rule(rule, option) {
    const symbol = option.symbol

    this.option = option;
    this.rule = rule;
    this.negation = rule.charAt(0) === symbol.negation;
    this.reg = this.wrap(rule.replace(new RegExp(`^\\${symbol.negation}`), ''));
}

Rule.prototype.test = function (path) {
    return this.reg(path)
        ? this.negation
            ? 0
            : 1
        : -1;
};

Rule.prototype.wrap = function (rule) {
    const option = this.option;
    const symbol = option.symbol
    switch (rule.charAt(0)) {
        case symbol.regexp:
            return this.wrapRegExp(rule);
        case symbol.match:
            return this.wrapMatch(rule);
        case symbol.alias:
            return this.wrapAlias(rule);
        default:
            return this.wrapPath(rule);
    }
};

Rule.prototype.wrapRegExp = function (rule) {
    const reg = new RegExp(rule.slice(1))
    return path => reg.test(path);
};

Rule.prototype.wrapMatch = function(rule) {
    const reg = new minimatch.Minimatch(rule.slice(1), {
        dot: this.option.dot
    });
    return path => reg.match(path);
};

Rule.prototype.wrapAlias = function (rule) {
    const index = rule.indexOf('/');
    const key = index > -1 ? rule.slice(1, index) : rule.slice(1);
    const sub = index > -1 ? rule.slice(index + 1) : '';
    const alias = this.option.alias[key];
    if (typeof alias !== 'string') {
        throw new Error(`alias ${key} not exist`);
    }
    return this.wrapPath(path.join(alias, sub));
};

Rule.prototype.wrapPath = function (rule) {
    const option = this.option;
    const symbol = option.symbol;
    rule = '/' + rule.replace(/^\//, '');
    if (rule.charAt(rule.length - 1) === symbol.file) {
        rule = rule.slice(0, rule.length - 1);
    } else {
        rule = rule.replace(/\/$/, '') + '/**/*'
    }
    return this.wrapMatch('-' + rule);
};

Rule.prototype.setNegation = function (negation) {
    this.negation = !!negation;
};

Rule.prototype.toString = function () {
    return this.rule;
};

exports = module.exports = Rule;
