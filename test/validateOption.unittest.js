"use strict";

const path = require('path');

const validateOption = require('../lib/validateOption');

const CASE_NEWEST_DIR = path.join(__dirname, './cases/newest');
const CASE_STABLE_DIR = path.join(__dirname, './cases/file');


describe('validateOption', () => {
    let option;

    beforeEach(() => {
        option = {
            root: CASE_NEWEST_DIR,
            diff: CASE_STABLE_DIR,
            dot: undefined,
            release: undefined,
            match: undefined,
            ignore: undefined,
            alias: { alias: 'alias' },
            module: { module: 'module' },
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

    it('should validate option', () => {
        expect(() => validateOption(option)).not.toThrow();
    });

    it('should validate option if diff from git', () => {
        option.diff = '';
        option.git = ['', '', ''];
        expect(() => validateOption(option)).not.toThrow();
    });

    describe('invalid', function () {
        it('option.root required', () => {
            option.root = undefined;
            expect(() => validateOption(option)).toThrow();
        });

        it('option.diff or option.git required', () => {
            option.diff = undefined;
            option.git = undefined;
            expect(() => validateOption(option)).toThrow();
        });

        it('option.git format', () => {
            option.diff = undefined;
            option.git = 'str';
            expect(() => validateOption(option)).toThrow();
        });

        it('option.alias value must be exsit string', () => {
            option.alias = { alias: true };
            expect(() => validateOption(option)).toThrow();

            option.alias = { alias: '' };
            expect(() => validateOption(option)).toThrow();
        });

        it('option.alias must be object if exist', () => {
            option.alias = true;
            expect(() => validateOption(option)).toThrow();
        });

        it('option.module must be object if exist', () => {
            option.module = true;
            expect(() => validateOption(option)).toThrow();
        });

        it('option.symbol can\'t repeat', () => {
            option.symbol = { regexp: '-', match: '-' };
            expect(() => validateOption(option)).toThrow();
        });

        it('option.symbol must be a character', () => {
            option.symbol = { regexp: '' };
            expect(() => validateOption(option)).toThrow();
        });
    });
});
