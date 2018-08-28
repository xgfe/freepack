"use strict";

const path = require('path');
const tar = require('tar');
const rimraf = require('rimraf');
const fsExtra = require('fs-extra');
const { list } = require('./helpers/list');

const uuid = require('../lib/util/uuid');
const createDiff = require('../lib/createDiff');


const GIT_DIR = function(cache_dir) {
    const srcDir = path.resolve(__dirname, './cases/git.tar.gz');
    const tarDir = cache_dir;
    fsExtra.mkdirpSync(tarDir);
    tar.x({ file: srcDir, C: tarDir, sync: true });
    return path.resolve(tarDir, 'git');
};


describe('createDiff', () => {
    let cache_dir;
    let tar_dir;
    let git_dir;

    beforeEach(() => {
        cache_dir = path.resolve(__dirname, '.cache', uuid());
        git_dir = GIT_DIR(cache_dir);
        tar_dir = path.resolve(cache_dir, 'tar');
    });

    afterEach(() => {
        cleanup(cache_dir);
    });

    it('should create diff auto', () => {
        expect(() => createDiff(tar_dir, git_dir)).not.toThrow();
    });

    it('should create diff by tag', () => {
        expect(() => createDiff(tar_dir, git_dir, 'v1.0.0')).not.toThrow();
    });

    it('should create diff by branch', () => {
        expect(() => createDiff(tar_dir, git_dir, 'master')).not.toThrow();
    });

    it('should throw error when git repository not exist', () => {
        expect(() => createDiff(tar_dir, __dirname)).toThrow();
    });

    it('should throw error when branch not exist', () => {
        expect(() => createDiff(tar_dir, git_dir, '______')).toThrow();
        expect(() => createDiff(tar_dir, git_dir, 'v0.0.0')).toThrow();
    });

    function cleanup(dir) {
        rimraf.sync(dir);
    }
});
