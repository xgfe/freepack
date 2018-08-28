"use strict";

const path = require('path');

const VARIABLE = require('../lib/variable');

const validateOption = require('../lib/validateOption');


describe('validateOption', () => {
    it('should generate default option', () => {
        let option;
        expect(() => {
            option = validateOption({
                diff: 'path'
            });
        }).not.toThrow();
        expect(option).toEqual(expect.any(Object));
        expect(option.diff).toBe('path');
        expect(option.context).toBe('');
        expect(option.src).toBe('src');
        expect(option.output).toBe('bundle');
        expect(option.match).toBe(VARIABLE.MATCH_MODE.NORMAL);
        expect(option.strict).toBe(false);
        expect(option.release).toEqual(expect.any(Array));
        expect(option.alias).toEqual(expect.any(Object));
        expect(option.module).toEqual(expect.any(Object));
        expect(option.symbol).toEqual(expect.any(Object));
        expect(option.symbol).toHaveProperty('negation');
        expect(option.symbol).toHaveProperty('relation');
        expect(option.symbol).toHaveProperty('separation');
        expect(option.symbol).toHaveProperty('file');
        expect(option.symbol).toHaveProperty('regexp');
        expect(option.symbol).toHaveProperty('match');
        expect(option.symbol).toHaveProperty('alias');
        expect(option.symbol).toHaveProperty('module');
        expect(option.ignore).toEqual(expect.any(Array));
        expect(option.dot).toBe(false);
        expect(option.backup).toBe('freepack-[date]');
    });

    it('should generate custom option', () => {
        let option = {
            diff: 'git',
            context: 'c',
            src: 's',
            output: 'o',
            match: VARIABLE.MATCH_MODE.STRICT,
            strict: true,
            release: ['rule'],
            alias: { common: 'common' },
            module: { module: [] },
            symbol: {
                negation: '!',
                relation: '@',
                separation: '#',
                file: '!',
                regexp: '%',
                match: '^',
                alias: '&',
                module: '*',
            },
            ignore: ['.cache'],
            dot: true,
            backup: false,
        };
        expect(validateOption(option)).toEqual(option);
    });

    describe('validate option', () => {
        it('should throw error when `diff` invalid', () => {
            expect(() => validateOption()).toThrow();
            expect(() => validateOption({
                diff: true
            })).toThrow();
        });

        ['context', 'src', 'output', 'match', 'module', 'backup'].forEach(key => {
            it(`should throw error when \`${key}\` invalid`, () => {
                let option = { diff: 'git' };
                option[key] = true;
                expect(() => validateOption(option)).toThrow();
            });
        });

        it('should throw error when `alias` invalid', () => {
            expect(() => validateOption({ diff: 'git', alias: true })).toThrow();
            expect(() => validateOption({ diff: 'git', alias: { foo: '' } })).toThrow();
            expect(() => validateOption({ diff: 'git', alias: { foo: true } })).toThrow();
        });

        it('should throw error when `symbol` invalid', () => {
            expect(() => validateOption({ diff: 'git', symbol: true })).toThrow();
            expect(() => validateOption({
                diff: 'git',
                symbol: {
                    negation: '1',
                    relation: '2',
                    separation: '3',
                    file: '4',
                    regexp: '5',
                    match: '6',
                    alias: '7',
                }
            })).toThrow();
            expect(() => validateOption({
                diff: 'git',
                symbol: {
                    negation: '1',
                    relation: '2',
                    separation: '3',
                    file: '4',
                    regexp: '5',
                    match: '6',
                    alias: '7',
                    module: 'module',
                }
            })).toThrow();
            expect(() => validateOption({
                diff: 'git',
                symbol: {
                    negation: '1',
                    relation: '2',
                    separation: '3',
                    file: '4',
                    regexp: '5',
                    match: '6',
                    alias: '7',
                    module: '7',
                }
            })).toThrow();
        });

        it('should throw error when `ignore` invalid', () => {
            expect(() => validateOption({ diff: 'git', ignore: true })).toThrow();
            expect(() => validateOption({ diff: 'git', ignore: [ '' ] })).toThrow();
            expect(() => validateOption({ diff: 'git', ignore: [ true ] })).toThrow();
        });
    });
});
