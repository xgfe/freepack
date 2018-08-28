"use strict";

const path = require('path');

const Match = require('../lib/Match');
const Rule = require('../lib/Rule');
const VARIABLE = require('../lib/variable');


describe('Match', () => {
    let option;

    beforeEach(() => {
        option = {
            alias: {
                alias: 'ALIAS',
                common: 'components'
            },
            module: {
                module: ['module/1', 'module/2'],
                moduleA: ['moduleA', '@moduleB'],
                moduleB: ['moduleB'],
                moduleRecyle1: ['@moduleRecyle2'],
                moduleRecyle2: ['@moduleRecyle1'],
                common: ['lib', '!components']
            },
            symbol: {
                negation: '!',
                relation: ':',
                separation: ',',
                file: '$',
                regexp: '~',
                match: '-',
                alias: '$',
                module: '@',
            }
        };
    });

    it('should instantiation Match', () => {
        expect(() => new Match(option)).not.toThrow();
    });

    describe('match test', () => {
        it('if the file rule not end with symbol.file, the test returns unmatch', () => {
            let match = new Match(Object.assign(option, {
                match: VARIABLE.MATCH_MODE.WARN
            }), ['path/file.js']);
            expect(match.test('/path/file.js')).toBe(VARIABLE.MATCH_STAT.UNMATCH)
        });

        it('if the match mode is NORMAL when rules repeat, the test returns release', () => {
            let match = new Match(Object.assign(option, {
                match: VARIABLE.MATCH_MODE.NORMAL
            }), ['path', 'path']);
            expect(match.test('/path/file.js')).toBe(VARIABLE.MATCH_STAT.RELEASE)
        });

        it('if the match mode is WARN when rules repeat, the test returns release', () => {
            let match = new Match(Object.assign(option, {
                match: VARIABLE.MATCH_MODE.WARN
            }), ['path', '!path/file.js$']);
            expect(match.test('/path/file.js')).toBe(VARIABLE.MATCH_STAT.MATCHED)
        });

        it('if the match mode is STRICT when rules repeat, the test throw error', () => {
            let match = new Match(Object.assign(option, {
                match: VARIABLE.MATCH_MODE.STRICT
            }), ['!path', 'path']);
            expect(() => match.test('/path/file.js')).toThrow();
        });

        it('if the match strict is true, the test returns unmatch', () => {
            let match = new Match(Object.assign(option, {
                strict: true
            }));
            ['/path', '/path/file.js'].forEach(
                str => expect(match.test(str)).toBe(VARIABLE.MATCH_STAT.UNMATCH)
            );
        });

        it('if the match strict is false, the test returns release', () => {
            let match = new Match(Object.assign(option, {
                strict: false
            }));
            ['/path', '/path/file.js'].forEach(
                str => expect(match.test(str)).toBe(VARIABLE.MATCH_STAT.RELEASE)
            );
        });
    });

    it('should support multiple rules type', () => {
        expect(new Match(option, 'rule').rules[0].toString()).toBe(new Rule('rule', option).toString());
        expect(new Match(option, ['rule']).rules[0].toString()).toBe(new Rule('rule', option).toString());
        expect(new Match(option, {'rule':true}).rules[0].toString()).toBe(new Rule('rule', option).toString());
    });

    it('should support nestest rules', () => {
        let rules = [
            'str',
            ['arr1', '!arr2', { arr3: true, arr4: false }],
            {
                obj1: 'a.js$',
                obj2: {
                    a: true,
                    b: { c: false },
                    '!d': 'e',
                    '!f': '!g',
                    h: '!i'
                },
                obj3: [
                    'a',
                    '!b',
                    [
                        'c',
                        { d: 'e' }
                    ]
                ],
            }
        ];
        let match = new Match(option, rules);


        ([])
        .concat(['str'])
        .concat(['arr1', '!arr2', 'arr3', '!arr4'])
        .concat(['obj1/a.js$'])
        .concat(['obj2/a', '!obj2/b/c', '!obj2/d/e', '!obj2/f/g', '!obj2/h/i'])
        .concat(['obj3/a', '!obj3/b', 'obj3/c', 'obj3/d/e'])
        .forEach((rule, index) => {
            expect(match.rules[index].toString()).toBe(new Rule(rule, option).toString());
        });
        expect(match.toString()).toEqual(['/str/', '/arr1/', '!/arr2/', '/arr3/', '!/arr4/', '/obj1/a.js', '/obj2/a/', '!/obj2/b/c/', '!/obj2/d/e/', '!/obj2/f/g/', '!/obj2/h/i/', '/obj3/a/', '!/obj3/b/', '/obj3/c/', '/obj3/d/e/'].join('\n'));
        expect(new Match(option, {rule:{}}).rules).toHaveLength(0);
    });

    it('should support alias rule', () => {
        let rules = [
            '$alias', '$alias/a', 'b/$alias', '!c/$alias',
            { '@common': ['a', '!$common', '$common/b.js$'] }
        ];
        let match = new Match(option, rules);

        ([])
        .concat(['ALIAS', 'ALIAS/a', 'b/ALIAS', '!c/ALIAS'])
        .concat(['components/a', '!components/components', 'components/components/b.js$'])
        .forEach((rule, index) => {
            expect(match.rules[index].toString()).toBe(new Rule(rule, option).toString());
        });
    });

    it('should support module rule', () => {
        let rules = [
            '@module',
            '!@moduleA',
            { '@common': false }
        ];
        let match = new Match(option, rules);

        ([])
        .concat(['module/1', 'module/2'])
        .concat(['!moduleA', '!moduleB'])
        .concat(['!lib', '!components'])
        .forEach((rule, index) => {
            expect(match.rules[index].toString()).toBe(new Rule(rule, option).toString());
        });
    });

    describe('invalid rules', () => {
        it('should throw error when rules use recyle module', () => {
            expect(() => new Match(option, '@moduleRecyle1')).toThrow();
        });

        it('should throw error when rule type invalid', () => {
            expect(() => new Match(option, [ 1 ])).toThrow();
            expect(() => new Match(option, { rule: 1 })).toThrow();
        });

        it('should throw error when module not exist', () => {
            expect(() => new Match(option, '@not_exist_module')).toThrow();
        });

        it('should throw error when alias not exist', () => {
            expect(() => new Match(option, '$not_exist_alias')).toThrow();
        });
    });
});
