"use strict";

const path = require('path');

const Match = require('../lib/Match');
const VAR = require('../lib/VAR');


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
        expect(match.test('/path/file.js')).toBe(1);
    });

    it('should match with path match', () => {
        const match = new Match(option, '-/path/**/**');
        expect(match.test('/path/file.js')).toBe(1);
    });

    it('should match with path regexp', () => {
        const match = new Match(option, '~path');
        expect(match.test('/path.js')).toBe(1);
    });

    it('should match if include alias', () => {
        ([
            ['$alias', '/alias/file.js', 1],
            ['$alias.js', '/alias/js/file.js', 1],
            ['$alias/path', '/alias/path/file.js', 1],
            ['path/$alias', '/path/$alias/file.js', 1],
        ]).forEach(item => {
            const match = new Match(option, item[0]);
            expect(match.test(item[1])).toEqual(item[2]);
        });
    });

    it('should match if include module', () => {
        const match = new Match(option, '@module');
        expect(match.test('/moduleA/file.js')).toEqual(1);
        expect(match.test('/moduleB/file.js')).toEqual(1);
        expect((new Match(option, '@module/path')).test('/modulePath/file.js')).toEqual(1);
    });

    it('should match with path nesting', () => {
        ([
            [{ pathA: true }, '/pathA/file.js', 1],
            [{ pathB: {} }, '/path/file', -1],
            [{ pathC: { a: true } }, '/pathC/a/', 1],
            [{ pathC: { b: false } }, '/pathC/b/', 0],
            [{ pathD: 'subpath' }, '/pathD/subpath/file.js', 1],
            [{ pathE: 'file.js$' }, '/pathE/file.js', 1],
            [{ 'pathF$': true }, '/pathF', 1],
            [{ 'pathG$': 'subpath' }, '/pathG$/subpath/file.js', 1],
            [{ 'path/subpath': true }, '/path/subpath/', 1],
            [[ ['path'] ], '/path/file.js', 1]
        ]).forEach(item => {
            const match = new Match(option, item[0]);
            expect(match.test(item[1])).toBe(item[2]);
        });
    });

    it('should match with path nesting if include minimatch/regexp/alias/module', () => {
        ([
            [{ '-/path/file.js': true }, '/path/file.js', 1],
            [{ '-path': 'subpath' }, '/-path/subpath/file.js', 1],
            [{ 'path': '-subpath' }, '/path/-subpath/file.js', 1],
            [{ '~path': true }, '/path/subpath/file.js', 1],
            [{ '~path': 'subpath' }, '/~path/subpath/file.js', 1],
            [{ 'path': '~subpath' }, '/path/~subpath/file.js', 1],
            [{ '$alias': true }, '/alias/file.js', 1],
            [{ 'path': '$alias' }, '/path/$alias/file.js', 1],
            [{ '@common': true }, '/lib/file.js', 1],
            [{ '@common': { 'path': true } }, '/common/path/file.js', 1],
            [{ 'path': { '@common': true } }, '/path/@common/file.js', 1]
        ]).forEach(item => {
            const match = new Match(option, item[0]);
            expect(match.test(item[1])).toEqual(item[2]);
        });
    });

    it('should toString', () => {
        expect((new Match(option, ['path'])).toString()).toEqual('/path/');
    });

    describe('relation', () => {
        it('should match with relation', () => {
            const match = new Match(option, 'path:subpath');
            expect(match.test('/path/subpath/file.js')).toEqual(1);
        });

        it('should match with relation if include separation', () => {
            const match = new Match(option, 'path:a,b');
            expect(match.test('/path/a/file.js')).toEqual(1);
            expect(match.test('/path/b/file.js')).toEqual(1);
        });

        it('should match with relation if not exist separation', () => {
            const match = new Match(option, 'path:');
            expect(match.test('/path/file.js')).toEqual(1);
        });

        it('should match once in multiple relation', () => {
            const match = new Match(option, 'path:a,b:c,d');
            expect(match.test('/path/a/file.js')).toEqual(1);
            expect(match.test('/path/b:c/file.js')).toEqual(1);
            expect(match.test('/path/d/file.js')).toEqual(1);
        });
    });

    describe('negation', () => {
        it('should not match if include negation', () => {
            ([
                [{ '!pathA': true }, '/pathA/file.js', 0],
                [{ 'pathC': { '!a': true } }, '/pathC/a/file.js', 0],
                [{ 'pathC': { '!b': false } }, '/pathC/b/file.js', 0],
                [{ '!pathC': { '!c': true } }, '/pathC/c/file.js', 0],
                [{ '!pathC': { '!d': false } }, '/pathC/d/file.js', 0],
                [{ 'pathD': '!subpath' }, '/pathD/subpath/file.js', 0],
                [ '!@module' , '/moduleA/file.js', 0]
            ]).forEach(item => {
                const match = new Match(option, item[0]);
                expect(match.test(item[1])).toEqual(item[2]);
            });
        });

        it('should not match when separation include negation', () => {
            const match = new Match(option, 'path:a,!b');
            expect(match.test('/path/a/file.js')).toEqual(1);
            expect(match.test('/path/b/file.js')).toEqual(0);
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
