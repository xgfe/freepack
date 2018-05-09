const path = require('path');
const Rule = require('./Rule');


function Match(option) {
    this.option = option;
    this.rules = [];
    this.init();
}

Match.prototype.init = function () {
    const option = this.option;
    let rules = [];
    option.release.forEach(rule => {
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
                const item = {};
                item[typeof value === 'boolean'? key : key.replace(
                    new RegExp(`^(\\${option.symbol.negation}?)\\${option.symbol.module}`),
                    `$1${option.symbol.alias}`
                )] = value;
                rules = rules.concat(stringifyRules(item));
            });
        } else {
            throw new Error(`Invalid rule type: ${ruleType}`);
        }
    });
    rules.forEach(rule => {
        const relation = rule.indexOf(option.symbol.relation);
        let base = '';
        let children = rule;
        if (relation > -1) {
            base = rule.slice(0, relation);
            children = rule.slice(relation + 1);
        }
        children.split(option.symbol.separation).forEach(child => this.rules.push(
            new Rule(path.join(base, child), option)
        ));
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
                if (matchMode === 'normal') {
                    console.warn(`rule: ${rule.toString()} match repeat`);
                } else if (matchMode === 'strict') {
                    throw new Error(`rule: ${rule.toString()} must match once`);
                }
            }
            matched = true;
            release = !!stat;
        }
    });
    return release;
};

function stringifyRules(rule, base) {
    base = base || '';
    let rules = [];
    // TODO !key
    Object.keys(rule).forEach(key => {
        const value = rule[key];
        const valueType = typeof value;
        if (Array.isArray(value)) {
            value.forEach(r => {
                if (typeof r !== 'string') {
                    throw new Error(`Invalid rule: array rule elements can only be a string`);
                }
                rules.push()
            });
            // rules = rules.concat(value.map());
        } else if (valueType === 'object') {
        } else if (valueType === 'boolean') {
        } else if (valueType === 'string') {
        }
    });
    return ''
}


exports = module.exports = Match;
