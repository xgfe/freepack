"use strict";

const date = require('../lib/util/date');
const uuid = require('../lib/util/uuid');


describe('util', () => {
    it('date', () => {
        const d = new Date('2000-01-01T12:00:00.000+0800');
        expect(date.string(d, 'yyyyMMddhhmmssSS')).toBe('20000101120000000');
        expect(date.string(d, 'yyyy/M/d')).toBe('2000/1/1');
        expect(date.string(d, 'hh:mm:ss')).toBe('12:00:00');
    });

    it('uuid', () => {
        expect(uuid.pattern.test(uuid())).toBe(true);
    });
});
