"use strict";

const path = require('path');

const freepack = require('../lib/freepack');
const Packer = require('../lib/Packer');
const VARIABLE = require('../lib/variable');


describe('freepack', () => {
    let option;

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

    it('should freepack', done => {
        expect(() => freepack(option, () => done())).not.toThrow();
    });

    it('should debug', () => {
        expect(() => freepack.debug(option)).not.toThrow();
    });

    it('should create packer', () => {
        expect(freepack.Packer).toBe(Packer);
    });
});
