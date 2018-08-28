"use strict";

const Rule = require('./Rule');
const VARIABLE = require('./variable');


function Match(option, rules) {
    this.mode = option.match;
    this.strict = option.strict;

    this.alias = option.alias;
    this.module = option.module;
    this.symbol = option.symbol;
    this.dot = option.dot;

    this.rules = [];
    this.format(rules);
}

Match.prototype.format = function(rules) {
    let optModule = this.module;
    let alias = this.alias;
    let symbol = this.symbol;

    let relationMap = {};
    let stringRules = [];
    stringify(rules);

    this.rules = stringRules.map(rule => new Rule(rule, {
        dot: this.dot,
        symbol: this.symbol
    }));

    function stringify(originRules, isParentNegation, parentModuleName) {
        [].concat(originRules || []).forEach(rule => {
            if (Array.isArray(rule)) {
                stringify(rule);
            } else if (typeof rule === 'object') {
                Object.keys(rule).map(prefix => {
                    const value = rule[prefix];
                    if (typeof value === 'boolean') {
                        // format negation
                        stringify(prefix.replace(
                            new RegExp(`^\\${symbol.negation}?`),
                            match => match || (value ? '' : symbol.negation)
                        ));
                    } else {
                        prefix = prefix
                            // replace module symbol to same alias
                            .replace(
                                new RegExp(`^(\\${symbol.negation}?)\\${symbol.module}`),
                                `$1${symbol.alias}`
                            )
                            // format to absolute path
                            .replace(
                                new RegExp(`^(\\${symbol.negation}?)\/?`),
                                `$1/`
                            );

                        if (Array.isArray(value)) {
                            stringify(value.map(val => {
                                let r = {};
                                r[prefix] = val;
                                return r;
                            }));
                        } else if (typeof value === 'object') {
                            stringify(Object.keys(value).map(key => {
                                let r = {};
                                r[joinRule(prefix, key)] = value[key];
                                return r;
                            }));
                        } else if (typeof value === 'string') {
                            stringify(joinRule(prefix, value));
                        } else {
                            stringify([null]);
                        }
                    }
                });
            } else if (rule && typeof rule === 'string') {
                let isNegation = new RegExp(`^\\${symbol.negation}`).test(rule);
                rule = isNegation ? rule.slice(1) : rule;
                if (rule.charAt(0) === symbol.module) {
                    let moduleName = rule.slice(1);
                    let moduleRules = optModule[moduleName];

                    relationMap[parentModuleName] = relationMap[parentModuleName] || [];
                    relationMap[parentModuleName].push(moduleName);

                    // check circular support
                    var circularModule = isCircularModule(parentModuleName, relationMap);
                    if (circularModule) {
                        throw new Error(`circular support in ${parentModuleName}: ${[''].concat(circularModule).join('\n--> ')}`);
                    }

                    if (!moduleRules) {
                        throw new Error(`not exist module ${moduleName}`);
                    }

                    stringify(moduleRules, isNegation || isParentNegation, moduleName);
                } else {
                    stringRules.push(
                        rule.split('/').map(part => {
                            if (part.charAt(0) === symbol.alias) {
                                let aliasName = part.slice(1);
                                let aliasValue = alias[aliasName];
                                if (aliasValue && typeof aliasValue === 'string') {
                                    return aliasValue;
                                } else {
                                    throw new Error(`alias ${aliasName} invalid`);
                                }
                            } else {
                                return part;
                            }
                        }).join('/').replace(
                            new RegExp(`^\\${symbol.negation}?`),
                            match => match || (isNegation || isParentNegation ? symbol.negation : '')
                        )
                    );
                }
            } else {
                throw new Error('invalid release rule');
            }
        });
    }

    function isCircularModule(key, value) {
        var stacks = [[key]];
        var deps;
        while (deps = stacks.pop()) {
            var relation = relationMap[deps[0]] || [];
            for (var i = 0; i < relation.length; i++) {
                var dep = relation[i];
                if (deps.indexOf(dep) > -1) {
                    return deps;
                } else {
                    stacks.push([dep].concat(deps));
                }
            }
        }
        return false;
    }

    function joinRule(prefix, rule) {
        let negation = '';
        let reg = new RegExp(`^\\${symbol.negation}?`);
        let regHandle = match => {
            negation = negation || match;
            return '';
        };
        prefix = prefix.replace(reg, regHandle).replace(/\/$/, '');
        rule = rule.replace(reg, regHandle).replace(/^\//, '');
        return negation + prefix + '/' + rule;
    }
};

Match.prototype.test = function(str) {
    if (this.length() === 0) {
        return this.strict ? VARIABLE.MATCH_STAT.UNMATCH : VARIABLE.MATCH_STAT.RELEASE;
    }

    const mode = this.mode;

    let stat = VARIABLE.MATCH_STAT.UNMATCH;
    let matched = false;
    this.rules.forEach(rule => {
        if (rule.test(str)) {
            if (matched) {
                if (mode === VARIABLE.MATCH_MODE.WARN) {
                    console.warn(`path[${str}] match repeat by rule[${rule.toString()}]`);
                } else if (mode === VARIABLE.MATCH_MODE.STRICT) {
                    throw new Error(`path[${str}] must match once, repeat by rule[${rule.toString()}]`);
                }
            }
            matched = true;
            stat = rule.negation ? VARIABLE.MATCH_STAT.MATCHED : VARIABLE.MATCH_STAT.RELEASE;
        }
    });

    return stat;
};

Match.prototype.length = function() {
    return this.rules.length;
};

Match.prototype.toString = function() {
    return this.rules.length > 0
        ? this.rules.map(rule => rule.toString()).join('\n')
        : this.strict
            ? '[STABLE ALL]'
            : '[NEWEST ALL]';
};


exports = module.exports = Match;
