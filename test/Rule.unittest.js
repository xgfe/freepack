"use strict";

const path = require('path');

const Rule = require('../lib/Rule');


describe('Rule', () => {
    let option;

    beforeEach(() => {
        option = {
            dot: false,
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

    it('should instantiation Rule', () => {
        expect(() => new Rule('/path', option)).not.toThrow();
    });

    describe('regexp rule', () => {
        it('should test correct', () => {
            const rule = new Rule('~path', option);
            expect(rule.test('path')).toBe(true);
            expect(rule.test('/parent/path/file.js')).toBe(true);
        });
    });

    describe('minimatch rule', () => {
        it('should test correct', () => {
            const rule = new Rule('-/path/**/*', option);
            expect(rule.test('/path')).toBe(false);
            expect(rule.test('/path/file.js')).toBe(true);
            expect(rule.test('/path/subpath/file.js')).toBe(true);
            expect(rule.test('/parent/path/file.js')).toBe(false);
        });
    });

    describe('path rule', () => {
        it('should test correct for directory rule', () => {
            const rule = new Rule('/path', option);
            expect(rule.test('/path')).toBe(false);
            expect(rule.test('/path/file.js')).toBe(true);
            expect(rule.test('/path/subpath/file.js')).toBe(true);
            expect(rule.test('/parent/path/file.js')).toBe(false);
        });

        it('should test correct for file rule', () => {
            const rule = new Rule('/file.js$', option);
            expect(rule.test('/path')).toBe(false);
            expect(rule.test('/file.js')).toBe(true);
            expect(rule.test('/file.js/path')).toBe(false);
            expect(rule.test('/path/file.js')).toBe(false);
        });

        it('should be same as rule without `/`', () => {
            expect((new Rule('path', option)).toString()).toBe((new Rule('/path', option)).toString());
            expect((new Rule('path.js', option)).toString()).toBe((new Rule('/path.js', option)).toString());
            expect((new Rule('path.js$', option)).toString()).toBe((new Rule('/path.js$', option)).toString());
        });
    });

    describe('negation', () => {
        it('should can get negation', () => {
            expect((new Rule('path', option)).negation).toBe(false);
            expect((new Rule('!path', option)).negation).toBe(true);
        });
    });

    it('toString', () => {
        expect((new Rule('!path', option)).toString()).toEqual('!/path/');
        expect((new Rule('/path', option)).toString()).toBeDefined();
        expect((new Rule('-path', option)).toString()).toBeDefined();
        expect((new Rule('~path', option)).toString()).toBeDefined();
    });
});
