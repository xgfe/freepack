"use strict";

const path = require('path');
const rimraf = require('rimraf');
const { list } = require('./helpers/list');

const createDiff = require('../lib/createDiff');

const PROJECT_DIR = path.join(__dirname, '../');
const CACHE_DIR = path.join(__dirname, '.cache', Date.now().toString());


describe('createDiff', () => {
    it('should create diff', () => {
        ['', 'v0.0.1', 'master'].forEach(tag => {
            cleanup(CACHE_DIR);
            expect(() => createDiff(CACHE_DIR, PROJECT_DIR, tag)).not.toThrow();
            cleanup(CACHE_DIR);
        });
    });

    it('should throw error when git repository not exist', () => {
        expect(() => createDiff(CACHE_DIR, __dirname)).toThrow();
    });

    it('should throw error when branch not exist', () => {
        cleanup(CACHE_DIR);
        expect(() => createDiff(CACHE_DIR, PROJECT_DIR, '______')).toThrow();
        expect(() => createDiff(CACHE_DIR, PROJECT_DIR, 'v0.0.0')).toThrow();
        cleanup(CACHE_DIR);
    });

    function cleanup(dir) {
        rimraf.sync(dir);
    }
});
