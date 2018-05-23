"use strict";

const path = require('path');
const fsExtra = require('fs-extra');
const { cleanup } = require('./helpers/cleanup');

const freepack = require('../lib/freepack');
const version = require('../package.json').version;
const Packer = require('../lib/Packer');


const CASE_NEWEST_DIR = path.join(__dirname, './cases/newest');
const CASE_STABLE_DIR = path.join(__dirname, './cases/file');


describe('freepack', () => {
    const newest = path.join(__dirname, './.cache/pack');
    let option;

    beforeEach(() => {
        cleanup(newest);
        fsExtra.copySync(CASE_NEWEST_DIR, newest);

        option = {
            root: newest,
            diff: CASE_STABLE_DIR,
            release: [],
            ignore: [],
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

    afterEach(() => {
        cleanup(newest);
    });

    it('should freepack', () => {
        expect(() => freepack(option, () => {})).not.toThrow();
    });

    it('should diff', () => {
        expect(() => freepack.diff(option)).not.toThrow();
    });

    it('should test', () => {
        expect(() => freepack.test(option)).not.toThrow();
    });

    describe('packer', () => {
        it('should create packer', () => {
            expect(freepack.packer(option)).toBeInstanceOf(Packer);
        });

        it('should create packer by default option', () => {
            option.release = undefined;
            option.alias = undefined;
            option.module = undefined;
            expect(freepack.packer(option)).toBeInstanceOf(Packer);
        });

        it('should throw error', () => {
            expect(() => {freepack.packer()}).toThrow();
        });
    });

    it('return version', () => {
        expect(freepack.version).toEqual(version);
    });
});
