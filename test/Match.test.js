"use strict";

const path = require('path');

const Match = require('../lib/Match');
const VAR = require('../lib/VAR');
const TEST_STAT = VAR.TEST_STAT;



describe('Match', () => {
    let option;

    beforeEach(() => {
        option = {
            alias: {
                'alias.js': 'alias/js',
                alias: 'alias',
                common: 'common'
            },
            module: {
                'module/path': ['modulePath'],
                common: ['common', 'lib'],
                module: ['moduleA', 'moduleB']
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

    it('should create Match with empty rules', () => {
        expect((new Match(option)).toString()).toBe('');
        expect((new Match(option, [])).toString()).toBe('');
        expect((new Match(option, {})).toString()).toBe('');
    });

    it('should match with path string', () => {
        const match = new Match(option, '/path');
        expect(match.test('/path/file.js')).toBe(TEST_STAT.RELEASE);
    });

    it('should match with path match', () => {
        const match = new Match(option, '-/path/**/**');
        expect(match.test('/path/file.js')).toBe(TEST_STAT.RELEASE);
    });

    it('should match with path regexp', () => {
        const match = new Match(option, '~path');
        expect(match.test('/path.js')).toBe(TEST_STAT.RELEASE);
    });

    it('should match if include alias', () => {
        ([
            ['$alias', '/alias/file.js', TEST_STAT.RELEASE],
            ['$alias.js', '/alias/js/file.js', TEST_STAT.RELEASE],
            ['$alias/path', '/alias/path/file.js', TEST_STAT.RELEASE],
            ['path/$alias', '/path/$alias/file.js', TEST_STAT.RELEASE],
        ]).forEach(item => {
            const match = new Match(option, item[0]);
            expect(match.test(item[1])).toBe(item[2]);
        });
    });

    it('should match if include module', () => {
        const match = new Match(option, '@module');
        expect(match.test('/moduleA/file.js')).toBe(TEST_STAT.RELEASE);
        expect(match.test('/moduleB/file.js')).toBe(TEST_STAT.RELEASE);
        expect((new Match(option, '@module/path')).test('/modulePath/file.js')).toBe(TEST_STAT.RELEASE);
    });

    it('should match with path nesting', () => {
        ([
            [{ pathA: true }, '/pathA/file.js', TEST_STAT.RELEASE],
            [{ pathB: {} }, '/path/file', TEST_STAT.UNRELEASE_UNMATCHED],
            [{ pathC: { a: true } }, '/pathC/a/', TEST_STAT.RELEASE],
            [{ pathC: { b: false } }, '/pathC/b/', TEST_STAT.UNRELEASE_MATCHED],
            [{ pathD: 'subpath' }, '/pathD/subpath/file.js', TEST_STAT.RELEASE],
            [{ pathE: 'file.js$' }, '/pathE/file.js', TEST_STAT.RELEASE],
            [{ 'pathF$': true }, '/pathF', TEST_STAT.RELEASE],
            [{ 'pathG$': 'subpath' }, '/pathG$/subpath/file.js', TEST_STAT.RELEASE],
            [{ 'path/subpath': true }, '/path/subpath/', TEST_STAT.RELEASE],
            [[ ['path'] ], '/path/file.js', TEST_STAT.RELEASE]
        ]).forEach(item => {
            const match = new Match(option, item[0]);
            expect(match.test(item[1])).toBe(item[2]);
        });
    });

    it('should match with path nesting if include minimatch/regexp/alias/module', () => {
        ([
            [{ '-/path/file.js': true }, '/path/file.js', TEST_STAT.RELEASE],
            [{ '-path': 'subpath' }, '/-path/subpath/file.js', TEST_STAT.RELEASE],
            [{ 'path': '-subpath' }, '/path/-subpath/file.js', TEST_STAT.RELEASE],
            [{ '~path': true }, '/path/subpath/file.js', TEST_STAT.RELEASE],
            [{ '~path': 'subpath' }, '/~path/subpath/file.js', TEST_STAT.RELEASE],
            [{ 'path': '~subpath' }, '/path/~subpath/file.js', TEST_STAT.RELEASE],
            [{ '$alias': true }, '/alias/file.js', TEST_STAT.RELEASE],
            [{ 'path': '$alias' }, '/path/$alias/file.js', TEST_STAT.RELEASE],
            [{ '@common': true }, '/lib/file.js', TEST_STAT.RELEASE],
            [{ '@common': { 'path': true } }, '/common/path/file.js', TEST_STAT.RELEASE],
            [{ 'path': { '@common': true } }, '/path/@common/file.js', TEST_STAT.RELEASE]
        ]).forEach(item => {
            const match = new Match(option, item[0]);
            expect(match.test(item[1])).toBe(item[2]);
        });
    });

    it('should toString', () => {
        expect((new Match(option, ['path'])).toString()).toEqual('/path/');
    });

    describe('relation', () => {
        it('should match with relation', () => {
            const match = new Match(option, 'path:subpath');
            expect(match.test('/path/subpath/file.js')).toBe(TEST_STAT.RELEASE);
        });

        it('should match with relation if include separation', () => {
            const match = new Match(option, 'path:a,b');
            expect(match.test('/path/a/file.js')).toBe(TEST_STAT.RELEASE);
            expect(match.test('/path/b/file.js')).toBe(TEST_STAT.RELEASE);
        });

        it('should match with relation if not exist separation', () => {
            const match = new Match(option, 'path:');
            expect(match.test('/path/file.js')).toBe(TEST_STAT.RELEASE);
        });

        it('should match once in multiple relation', () => {
            const match = new Match(option, 'path:a,b:c,d');
            expect(match.test('/path/a/file.js')).toBe(TEST_STAT.RELEASE);
            expect(match.test('/path/b:c/file.js')).toBe(TEST_STAT.RELEASE);
            expect(match.test('/path/d/file.js')).toBe(TEST_STAT.RELEASE);
        });
    });

    describe('negation', () => {
        it('should not match if include negation', () => {
            ([
                [{ '!pathA': true }, '/pathA/file.js', TEST_STAT.UNRELEASE_MATCHED],
                [{ 'pathC': { '!a': true } }, '/pathC/a/file.js', TEST_STAT.UNRELEASE_MATCHED],
                [{ 'pathC': { '!b': false } }, '/pathC/b/file.js', TEST_STAT.UNRELEASE_MATCHED],
                [{ '!pathC': { '!c': true } }, '/pathC/c/file.js', TEST_STAT.UNRELEASE_MATCHED],
                [{ '!pathC': { '!d': false } }, '/pathC/d/file.js', TEST_STAT.UNRELEASE_MATCHED],
                [{ 'pathD': '!subpath' }, '/pathD/subpath/file.js', TEST_STAT.UNRELEASE_MATCHED],
                [ '!@module' , '/moduleA/file.js', TEST_STAT.UNRELEASE_MATCHED]
            ]).forEach(item => {
                const match = new Match(option, item[0]);
                expect(match.test(item[1])).toBe(item[2]);
            });
        });

        it('should not match when separation include negation', () => {
            const match = new Match(option, 'path:a,!b');
            expect(match.test('/path/a/file.js')).toBe(TEST_STAT.RELEASE);
            expect(match.test('/path/b/file.js')).toBe(TEST_STAT.UNRELEASE_MATCHED);
        });
    });

    describe('catch error', () => {
        it('should warn when matching repeat', () => {
            option.match = VAR.MATCH_MODE.WARN;
            const match = new Match(option, [
                'path',
                'path/subpath'
            ]);
            expect(() => match.test('/path/subpath/file.js')).not.toThrow();
        });

        it('should throw error when matching repeat', () => {
            option.match = VAR.MATCH_MODE.STRICT;
            const match = new Match(option, [
                'path',
                'path/subpath'
            ]);
            expect(() => match.test('/path/subpath/file.js')).toThrow();
        });

        it('should throw error when release rule invalid', () => {
            expect(() => new Match(option, true)).toThrow();
            expect(() => new Match(option, [true])).toThrow();
            expect(() => new Match(option, [ '' ])).toThrow();
            expect(() => new Match(option, [ [ true ] ])).toThrow();
            expect(() => new Match(option, { path: [{}] })).toThrow();
            expect(() => new Match(option, { path: 1 })).toThrow();
            expect(() => new Match(option, { path: () => {} })).toThrow();
            expect(() => new Match(option, '@module/file.js')).toThrow();
        });
    });
});
