"use strict";

const path = require('path');
const minimatch = require('minimatch');


function Rule(rule, option) {
    this.rule = rule;
    this.negation = rule.charAt(0) === option.symbol.negation;
    this.test = wrap(this.negation ? rule.slice(1) : rule, {
        dot: option.dot,
        symbol: option.symbol
    });
}

Rule.prototype.toString = function() {
    return (this.negation ? '!' : '') + this.test.toString();
};

function wrap(rule, option) {
    const symbol = option.symbol;

    switch (rule.charAt(0)) {
        case symbol.regexp:
            return wrapRegExp(rule.slice(1));
        case symbol.match:
            return wrapMatch(rule.slice(1), option.dot);
        default:
            return wrapPath(rule, symbol);
    }
}

function wrapRegExp(rule) {
    const reg = new RegExp(rule);
    const fn = path => reg.test(path);
    fn.toString = () => reg;
    return fn;
}

function wrapMatch(rule, dot) {
    const reg = new minimatch.Minimatch(rule, {
        dot: dot
    });
    const fn = path => reg.match(path);
    fn.toString = () => reg;
    return fn;
}

function wrapPath(rule, symbol) {
    rule = '/' + rule.replace(/^\//, '');
    let fn;
    if (rule.charAt(rule.length - 1) === symbol.file) {
        // absolute file path
        rule = rule.slice(0, rule.length - 1);
        fn = path => path === rule;
    } else {
        // contain folder path
        rule = rule.replace(/\/$/, '') + '/';
        fn = path => path.indexOf(rule) === 0;
    }
    fn.toString = () => rule;
    return fn;
}


exports = module.exports = Rule;
