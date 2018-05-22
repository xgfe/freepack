"use strict";

const path = require('path');
const rimraf = require('rimraf');
const { list } = require('./helpers/list');

const createDiff = require('../lib/createDiff');

const CASE_DIR = path.join(__dirname, '../');
const ROOT_DIR = path.join(CASE_DIR, './src');


describe('createDiff', () => {
    it('should create diff', () => {
        ['auto', 'tag:v0.0.1', 'branch:master'].forEach(tag => {
            const option = {
                root: ROOT_DIR,
                git: CASE_DIR,
                dir: path.join(__dirname, './.cache/createDiff'),
                tag: tag
            };
            cleanup(option.dir);
            expect(() => createDiff(option)).not.toThrow();
            cleanup(option.dir);
        });
    });

    it('should throw error when git repository not exist', () => {
        expect(() => createDiff({
            git: __dirname
        })).toThrow();
    });

    it('should throw error when option.tag invalid', () => {
        expect(() => createDiff({
            git: CASE_DIR
        })).toThrow();
        expect(() => createDiff({
            git: CASE_DIR,
            tag: 'string'
        })).toThrow();
    });

    it('should throw error when tag/branch not exist', () => {
        const option = {
            root: ROOT_DIR,
            git: CASE_DIR,
            dir: path.join(__dirname, './.cache/createDiff'),
            tag: 'tag:v0.0.0'
        };
        cleanup(option.dir);
        expect(() => createDiff(option)).toThrow();
        cleanup(option.dir);
    });

    function cleanup(dir) {
        rimraf.sync(dir);
    }
});
