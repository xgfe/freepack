"use strict";

const path = require('path');

const Rule = require('../lib/Rule');


describe('Rule', () => {
    let option;

    beforeEach(() => {
        option = {
            alias: {},
            module: {},
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

    it('should match with string', () => {
        const rule = new Rule('/path', option);
        expect(rule.test('/path')).toBe(-1);
        expect(rule.test('/path/file.js')).toBe(1);
        expect(rule.test('/path/subpath/file.js')).toBe(1);
        expect(rule.test('/parent/path/file.js')).toBe(-1);
    });

    it('should match same path if not start with /', () => {
        const rule = new Rule('path', option);
        const sameRule = new Rule('/path', option);
        expect(rule.test('/path')).toBe(sameRule.test('/path'));
        expect(rule.test('/path/file.js')).toBe(sameRule.test('/path/file.js'));
        expect(rule.test('/path/subpath/file.js')).toBe(sameRule.test('/path/subpath/file.js'));
        expect(rule.test('/parent/path/file.js')).toBe(sameRule.test('/parent/path/file.js'));
    });

    it('should match one file', () => {
        const rule = new Rule('/file.js$', option);
        expect(rule.test('/file.js')).toBe(1);
        expect(rule.test('/file.js/a.js')).toBe(-1);
    });

    it('should match with string and include alias', () => {
        option.alias = {
            module: '/root/src'
        };
        const rule = new Rule('$module/path', option);
        expect(rule.test('/root/src/path/file.js')).toBe(1);
        expect(rule.test('/root/src/path/subpath/file.js')).toBe(1);
        expect((new Rule('$module', option)).test('/root/src/path/file.js')).toBe(1);
    });

    it('should throw error if alias not defined', () => {
        expect(() => new Rule('$module/path', option)).toThrow();
    });

    it('should match with regexp', () => {
        const rule = new Rule('~path', option);
        expect(rule.test('/path')).toBe(1);
        expect(rule.test('/parent/path/file.js')).toBe(1);
    });

    it('should match with minimatch', () => {
        const rule = new Rule('-/path/**/*', option);
        expect(rule.test('/path')).toBe(-1);
        expect(rule.test('/path/file.js')).toBe(1);
        expect(rule.test('/path/subpath/file.js')).toBe(1);
        expect(rule.test('/parent/path/file.js')).toBe(-1);
    });

    it('should not match with string if include negation', () => {
        const rule = new Rule('!/path', option);
        expect(rule.test('/path')).toBe(-1);
        expect(rule.test('/path/file.js')).toBe(0);
        expect(rule.test('/path/subpath/file.js')).toBe(0);
        expect(rule.test('/parent/path/file.js')).toBe(-1);
    });

    it('should not match with minimatch if include negation', () => {
        option.alias = {
            module: '/root/src'
        };
        const rule = new Rule('!$module/path', option);
        expect(rule.test('/root/src/path/file.js')).toBe(0);
    });

    it('should not match file if include negation', () => {
        const rule = new Rule('!file.js$', option);
        expect(rule.test('/file.js')).toBe(0);
        expect(rule.test('/path/file.js')).toBe(-1);
    });

    it('should not match with regexp if include negation', () => {
        const rule = new Rule('!~path', option);
        expect(rule.test('/path.js')).toBe(0);
    });

    it('should not match with minimatch if include negation', () => {
        const rule = new Rule('!-/path/**/*', option);
        expect(rule.test('/path/a.js')).toBe(0);
    });

    it('should not match with string if set negation', () => {
        const rule = new Rule('/path', option);

        expect(rule.test('/path/file.js')).toBe(1);

        rule.setNegation(true);
        expect(rule.test('/path/file.js')).toBe(0);

        rule.setNegation(false);
        expect(rule.test('/path/file.js')).toBe(1);
    });

    it('toString', () => {
        expect((new Rule('!path', option)).toString()).toEqual('!/path/');
        expect((new Rule('/path', option)).toString()).toBeDefined();
        expect((new Rule('-path', option)).toString()).toBeDefined();
        expect((new Rule('~path', option)).toString()).toBeDefined();
    });
});
