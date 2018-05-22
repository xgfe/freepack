"use strict";

const ignoreFilter = require('../lib/ignoreFilter');

const stat = file => ({ isFile: () => !!file });

describe('ignoreFilter', () => {
    it('should create ignore fn and not ignore any file', () => {
        const ignore = ignoreFilter();
        expect(ignore(`/path/date-${Date.now()}.js`, stat(true))).toBe(false);
    });

    it('should throw error when rules have non-string', () => {
        expect(() => ignoreFilter(['rule', ''])).toThrow();
    });

    it('should throw error when rules have empty element', () => {
        expect(() => ignoreFilter(['rule', true])).toThrow();
    });

    it('should not ignore the directory', () => {
        const ignore = ignoreFilter(['path']);
        expect(ignore(`/path`, stat(false))).toBe(false);
        expect(ignore(`/path/file`, stat(false))).toBe(false);
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
