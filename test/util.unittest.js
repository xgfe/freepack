"use strict";

const date = require('../lib/util/date');
const uuid = require('../lib/util/uuid');


describe('util', () => {
    it('date', () => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(0);
        d.setFullYear(2000);
        d.setHours(12);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);

        expect(date.string(d, 'yyyyMMddhhmmssSS')).toBe('20000101120000000');
        expect(date.string(d, 'yyyy/M/d')).toBe('2000/1/1');
        expect(date.string(d, 'hh:mm:ss')).toBe('12:00:00');
    });

    it('uuid', () => {
        expect(uuid.pattern.test(uuid())).toBe(true);
    });
});
