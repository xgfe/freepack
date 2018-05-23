"use strict";

const path = require('path');

const Bundle = require('../lib/Bundle');


describe('Bundle', () => {
    const dir = path.join(__dirname, './cases/file');

    it('should create Bundle', () => {
        const bundle = new Bundle(dir, {
            type: undefined,
            ignore: undefined,
        });

        const files = bundle.getFile();
        const directories = bundle.getDirectory();

        const f_expect = ['/index.js', '/lib/a.js', '/lib/b.js'];
        const d_expect = ['/lib/'];

        expect(files.length).toBeGreaterThanOrEqual(3);
        expect(directories.length).toBeGreaterThanOrEqual(1);
        expect(files.map(item => item.path)).toEqual(expect.arrayContaining(f_expect));
        expect(directories.map(item => item.path)).toEqual(expect.arrayContaining(d_expect));
        expect(files.map(item => item.absolute)).toEqual(
            expect.arrayContaining(f_expect.map(item => path.join(dir, item)))
        );
        expect(directories.map(item => item.absolute)).toEqual(
            expect.arrayContaining(d_expect.map(item => path.join(dir, item)))
        );

        const directory = directories[0];
        expect(directory.bundle).toBeInstanceOf(Bundle);
        expect(directory.stat).toBeDefined();
    });

    it('should ignore all file and directory', () => {
        const bundle = new Bundle(dir, {
            type: 'ignore',
            ignore: (path, stat) => {
                expect(path).toBeDefined();
                expect(stat).toBeDefined();
                return true;
            }
        });
        expect(bundle.getFile()).toHaveLength(0);
        expect(bundle.getDirectory()).toHaveLength(0);
    });

    it('should same as the second get', () => {
        const bundle = new Bundle(dir, {
            type: undefined,
            ignore: undefined,
        });
        expect(bundle.getCategory('file')).toEqual(bundle.getCategory('file'));
    });

    it('should get empty array by not valid type', () => {
        const bundle = new Bundle(dir, {
            type: undefined,
            ignore: undefined,
        });
        expect(bundle.getCategory()).toHaveLength(0);
        expect(bundle.getCategory('unknow')).toHaveLength(0);
    });
});
