"use strict";

const ignoreFilter = require('../lib/ignoreFilter');

const stat = file => ({ isFile: () => !!file });

describe('ignoreFilter', () => {
    it('should create ignore function', () => {
        let ignore;
        expect(() => {
            ignore = ignoreFilter([]);
        }).not.toThrow();
        expect(ignore).toEqual(expect.any(Function));
    });

    it('should not ignore any file', () => {
        const ignore = ignoreFilter([]);
        expect(ignore(`/path`, stat(false))).toBe(false);
    });

    it('should not ignore the directory', () => {
        const ignore = ignoreFilter(['path']);
        expect(ignore(`/path`, stat(false))).toBe(false);
    });

    it('should ignore the absolute file path', () => {
        const ignore = ignoreFilter(['/file.js']);
        expect(ignore('/file.js', stat(true))).toBe(true);
        expect(ignore('/path/file.js', stat(true))).toBe(false);
    });

    it('should ignore all match file path', () => {
        const ignore = ignoreFilter(['file.js']);
        expect(ignore('/file.js', stat(true))).toBe(true);
        expect(ignore('/path/file.js', stat(true))).toBe(true);
    });
});
