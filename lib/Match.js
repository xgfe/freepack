const path = require('path');
const Rule = require('./Rule');
const VAR = require('./VAR');



function Match(option, rules) {
    this.option = option;
    this.rules = [];
    this.init(rules);
}

Match.prototype.init = function (release) {
    release = release || [];
    if (!Array.isArray(release)) {
        switch (typeof release) {
            case 'string':
            case 'object':
                release = [release];
                break;
            default:
                throw new Error('Invalid release rule');
                break;
        }
    }
    const option = this.option;
    const symbol = option.symbol;
    let rules = [];
    release.forEach(rule => {
        const ruleType = typeof rule;
        if (ruleType === 'string') {
            rules.push(rule);
        } else if (Array.isArray(rule)) {
            if (rule.every(r => typeof r === 'string')) {
                throw new Error(`Invalid rule: array rule elements can only be a string`);
            }
            rules = rules.concat(rule);
        } else if (ruleType === 'object') {
            Object.keys(rule).map(key => {
                const value = rule[key];
                if (typeof value !== 'boolean') {
                    key = key
                    .replace(new RegExp(
                        `^(\\${symbol.negation}?)\\${symbol.module}`
                    ), `$1${symbol.alias}`)
                    .replace(new RegExp(
                        `^(\\${symbol.negation}?)(\\${symbol.regexp}|\\${symbol.match})`
                    ), `$1/$2`)
                }
                const item = {};
                item[key] = value;
                rules = rules.concat(this.stringifyRules(item));
            });
        } else {
            throw new Error(`Invalid rule type: ${ruleType}`);
        }
    });
    rules.forEach(rule => {
        if (!rule) {
            throw new Error('empty rule');
        }
        if (
            rule.charAt(0) === symbol.module
            || (
                rule.charAt(0) === symbol.negation
                && rule.charAt(1) === symbol.module
            )
        ) {
            const isModuleNegation = rule.charAt(0) === symbol.negation;
            const moduleName = rule.replace(new RegExp(`^\\${symbol.negation}`), '').slice(1);
            const moduleRule = option.module[moduleName];
            if (!moduleRule) {
                throw new Error(`not exist module ${moduleName}`)
            }
            const moduleMatch = new Match(option, moduleRule);
            moduleMatch.rules.forEach(rule => {
                isModuleNegation && rule.setNegation(true)
                this.rules.push(rule);
            });
        } else {
            const relation = rule.indexOf(symbol.relation);
            let base = '';
            let children = rule;
            if (relation > -1) {
                base = rule.slice(0, relation);
                children = rule.slice(relation + 1);
            }
            children.split(symbol.separation).forEach(child => {
                let prefix = base;
                if (prefix && child.charAt(0) === symbol.negation) {
                    prefix = symbol.negation + prefix.replace(new RegExp(`^\\${symbol.negation}`), '');
                    child = child.slice(1);
                }
                this.rules.push(new Rule(path.join(prefix, child), option));
            });
        }
    });
};

Match.prototype.test = function (path) {
    const matchMode = this.option.match;
    let release = false;
    let matched = false;
    this.rules.forEach(rule => {
        const stat = rule.test(path);
        if (stat > -1) {
            if (matched) {
                if (matchMode === VAR.MATCH_MODE.WARN) {
                    console.warn(`path[${path}] match repeat by rule[${rule.toString()}]`);
                } else if (matchMode === VAR.MATCH_MODE.STRICT) {
                    throw new Error(`path[${path}] must match once, repeat by rule[${rule.toString()}]`);
                }
            }
            matched = true;
            release = !!stat;
        }
    });
    return release;
};

Match.prototype.stringifyRules = function(rule, base) {
    const option = this.option;
    const symbol = option.symbol;

    const prefix = base || '';
    const prefixNonNegation = prefix.replace(new RegExp(`^\\${symbol.negation}`), '');

    let rules = [];
    Object.keys(rule).forEach(key => {
        const keyPrefix = key.charAt(0) === symbol.negation
            ? prefixNonNegation
                ? path.join(symbol.negation + prefixNonNegation, key.slice(1))
                : (symbol.negation + key.slice(1))
            : path.join(prefix, key);
        const keyPrefixNonNegation = keyPrefix.replace(new RegExp(`^\\${symbol.negation}`), '');

        const value = rule[key];
        const valueType = typeof value;
        if (valueType === 'string' || Array.isArray(value)) {
            (Array.isArray(value) ? value : [value]).forEach(subRule => {
                if (typeof subRule !== 'string' || subRule.length === 0) {
                    throw new Error(`Invalid rule: array rule elements can only be a string`);
                }
                rules.push(
                    subRule.charAt(0) === symbol.negation
                        ? path.join(symbol.negation + keyPrefixNonNegation, subRule.slice(1))
                        : path.join(keyPrefix, subRule)
                );
            });
        } else if (valueType === 'object') {
            rules = rules.concat(this.stringifyRules(value, keyPrefix));
        } else if (valueType === 'boolean') {
            rules.push(value ? keyPrefix : symbol.negation + keyPrefixNonNegation);
        } else {
            throw new Error('Invalid rule type');
        }
    });
    return rules;
};

Match.prototype.toString = function() {
    return this.rules.map(rule => rule.toString()).join('\n')
};


exports = module.exports = Match;
