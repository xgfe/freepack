"use strict";

const path = require('path');
const rimraf = require('rimraf');
const fsExtra = require('fs-extra');

const Packer = require('../lib/Packer');
const Bundle = require('../lib/Bundle');
const VARIABLE = require('../lib/variable');


const PROJECT_DIR = path.resolve(__dirname, '../');

describe('Packer', () => {
    let option;
    let packer;

    beforeEach(() => {
        option = {
            src: '',
            diff: path.resolve(__dirname, './cases/file'),
            context: path.resolve(__dirname, './cases/newest'),
            output: path.resolve(__dirname, './.cache/output-' + Date.now()),
            match: VARIABLE.MATCH_MODE.NORMAL,
            strict: false,
            release: [],
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
            },
            ignore: [],
            dot: false,
            backup: path.resolve(__dirname, './.cache/freepack-[backup]-[date:4]_[date]-[uuid:4]_[uuid]')
        };
    });

    afterEach(() => {
        packer && packer.cache && cleanup(packer.cache);
        packer && packer.output && cleanup(packer.output);
        packer && packer.backup && cleanup(packer.backup);
    });

    it('should create Packer', () => {
        expect(() => {
            packer = new Packer(option);
        }).not.toThrow();
    });

    it('should create all bundle', () => {
        packer = new Packer(option);
        expect(() => packer.init()).not.toThrow();
        expect(packer.newest).toBeInstanceOf(Bundle);
        expect(packer.stable).toBeInstanceOf(Bundle);
        expect(packer.bundle).toBeInstanceOf(Bundle);
    });

    it('should create all bundle by git', () => {
        packer = new Packer(Object.assign(option, {
            diff: 'git:master',
            context: PROJECT_DIR,
            backup: false
        }));
        expect(() => packer.init()).not.toThrow();
        expect(packer.newest).toBeInstanceOf(Bundle);
        expect(packer.stable).toBeInstanceOf(Bundle);
        expect(packer.bundle).toBeInstanceOf(Bundle);
    });

    it('should compare bundle', () => {
        packer = new Packer(option);
        packer.init();
        expect(() => packer.compare()).not.toThrow();
        expect(packer.difference.map(diff => ([diff.path, diff.type]))).toEqual([
            ['/index.js', VARIABLE.DIFF_TYPE.UPDATE],
            ['/lib/a.js', VARIABLE.DIFF_TYPE.UPDATE],
            ['/lib/c.js', VARIABLE.DIFF_TYPE.CREATE],
            ['/lib/b.js', VARIABLE.DIFF_TYPE.DELETE]
        ]);
    });

    it('should match with release rules', () => {
        packer = new Packer(Object.assign(option, {
            release: ['/index.js$', '!lib']
        }));
        packer.init();
        packer.compare();
        expect(() => packer.match()).not.toThrow();
        expect(packer.resource.map(r => ([r.path, r.file.bundle.type]))).toEqual([
            ['/index.js', 'newest'],
            ['/lib/a.js', 'stable'],
            ['/lib/b.js', 'stable']
        ]);
    });

    it('should pack', () => {
        packer = new Packer(option);

        fsExtra.copySync(packer.src, packer.output);

        packer.init();
        packer.compare();
        packer.match();
        expect(() => packer.pack()).not.toThrow();
    });

    it('should clean', () => {
        packer = new Packer(option);
        expect(() => packer.clean()).not.toThrow();
    });

    it('should run', done => {
        packer = new Packer(option);
        expect(() => packer.run(() => {
            done();
        })).not.toThrow();
    });

    describe('throw error', () => {
        it('throw error when uninitialized', () => {
            packer = new Packer(option);
            expect(() => packer.compare()).toThrow();
            expect(() => packer.pack()).toThrow();
        });

        it('throw error when diff not exist', () => {
            expect(() => new Packer(Object.assign(option, {
                diff: path.resolve(option.diff, 'not_exist')
            })).init()).toThrow();
        });

        it('throw error when src not include of context', () => {
            expect(() => new Packer(Object.assign(option, {
                src: path.resolve(option.context, '../')
            })).init()).toThrow();
        });

        it('throw error when src not exist', () => {
            expect(() => new Packer(Object.assign(option, {
                src: 'not_exist'
            })).init()).toThrow();
        });

        it('throw error when backup exist', () => {
            expect(() => new Packer(Object.assign(option, {
                backup: 'lib'
            })).init()).toThrow();
        });

        it('throw error when callback not exist', () => {
            expect(() => new Packer(option).run()).toThrow();
        });
    });

    function cleanup(dir) {
        rimraf.sync(dir);
    }
});
