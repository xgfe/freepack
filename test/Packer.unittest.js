"use strict";

const path = require('path');
const rimraf = require('rimraf');
const fsExtra = require('fs-extra');

const Packer = require('../lib/Packer');
const Bundle = require('../lib/Bundle');
const VAR = require('../lib/VAR');


const PROJECT_DIR = path.join(__dirname, '../');
const CASE_NEWEST_DIR = path.join(__dirname, './cases/newest');
const CASE_STABLE_DIR = path.join(__dirname, './cases/file');


describe('Packer', () => {
    let option;
    let packer;

    beforeEach(() => {
        option = {
            root: CASE_NEWEST_DIR,
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
        cleanup(packer.cache)
    });

    it('should create Packer', () => {
        expect(() => {
            packer = new Packer(option);
        }).not.toThrow();
    });

    it('should clean packer cache', () => {
        packer = new Packer(option);
        expect(() => packer.clean()).not.toThrow();
    });

    describe('init', () => {
        it('should create all bundle', () => {
            packer = new Packer(option);
            expect(() => packer.init()).not.toThrow();
            expect(packer.newest).toBeInstanceOf(Bundle);
            expect(packer.stable).toBeInstanceOf(Bundle);
        });

        it('should create newest bundle', () => {
            packer = new Packer(option);
            expect(() => packer.createNewest()).not.toThrow();
            expect(packer.newest).toBeInstanceOf(Bundle);
        });

        it('should create stable bundle', () => {
            packer = new Packer(option);
            expect(() => packer.createStable()).not.toThrow();
            expect(packer.stable).toBeInstanceOf(Bundle);
        });

        it('should create stable bundle by git', () => {
            option.diff = undefined;
            option.git = [ PROJECT_DIR, '', 'branch:master' ];
            packer = new Packer(option);
            expect(() => packer.createStable()).not.toThrow();
        });
    });

    describe('diff', () => {
        it('should diff bundle', () => {
            packer = new Packer(option);
            packer.init();
            expect(() => packer.diff()).not.toThrow();
        });

        it('should diff result', () => {
            packer = new Packer(option);
            packer.init();
            packer.diff();
            expect(packer.difference.length).toBeGreaterThan(0);
        });

        it('should diff empty if root is same as diff', () => {
            option.root = option.diff = CASE_NEWEST_DIR;
            packer = new Packer(option);
            packer.init();
            packer.diff();
            packer.difference.forEach(diff => {
                expect(diff.type).toEqual(VAR.DIFF_TYPE.UPDATE);
            });
        });

        it('should throw error if not step by step to diff', () => {
            packer = new Packer(option);
            expect(() => packer.diff()).toThrow();
        });
    });

    describe('match', () => {
        it('should match', () => {
            packer = new Packer(option);
            packer.init();
            packer.diff();
            expect(() => packer.match()).not.toThrow();
        });

        it('should match exist', () => {
            packer = new Packer(option);
            packer.init();
            packer.diff();
            packer.match();
            expect(packer.resource.length).toBeGreaterThan(0);
        });
    });

    describe('pack', () => {
        const newest = path.join(__dirname, './.cache/pack');

        beforeEach(() => {
            cleanup(newest);
            fsExtra.copySync(CASE_NEWEST_DIR, newest);
            option.root = newest;
        });

        afterEach(() => {
            cleanup(newest);
        });

        it('should pack', () => {
            packer = new Packer(option);
            packer.init();
            packer.diff();
            packer.match();
            expect(() => packer.pack()).not.toThrow();
        });

        it('should pack all', () => {
            option.release = '~.*';
            packer = new Packer(option);
            packer.init();
            packer.diff();
            packer.match();
            expect(() => packer.pack()).not.toThrow();
        });

        it('should run', done => {
            packer = new Packer(option);
            expect(() => packer.run(self => {
                expect(self).toEqual(packer);
                done();
            })).not.toThrow();
        });

        it('should throw error when run without callback', () => {
            packer = new Packer(option);
            expect(() => packer.run()).toThrow();
        });

        it('should throw error if not step by step to pack', () => {
            packer = new Packer(option);
            expect(() => packer.pack()).toThrow();
        });
    });

    function cleanup(dir) {
        rimraf.sync(dir);
    }
});
