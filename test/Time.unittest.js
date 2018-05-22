"use strict";

const Time = require('../lib/Time');

describe('Time', () => {
    it('should create Time and list with empty array', () => {
        const time = new Time();
        expect(time.list()).toEqual([]);
    });

    it('should set name as default', () => {
        const name = 'TEST_NAME';
        const time = new Time(name);
        expect(time.name()).toEqual(name);
    });

    it('should record time by default', () => {
        const time = new Time();
        time.begin();
        time.end();
        expect(time.get()).toBeGreaterThanOrEqual(0);
    });

    it('should record specified name time', () => {
        const time = new Time();
        const name = 'init';
        time.begin(name);
        time.end(name);
        expect(time.get(name)).toBeGreaterThanOrEqual(0);
    });

    it('should get the same time by name as specified and unspecified', () => {
        const time = new Time();
        time.begin();
        time.end();
        expect(time.get(time.name())).toEqual(time.get());
    });

    it('should record time greater than or equal to 0ms', () => {
        const time = new Time();
        time.begin();
        time.end();
        expect(time.get()).toBeGreaterThanOrEqual(0);
    });

    it('should record time equal to 0ms without end', () => {
        const time = new Time();
        time.begin();
        expect(time.get()).toEqual(0);
    });

    it('should record time equal to 0ms with end directly', () => {
        const time = new Time();
        time.end();
        expect(time.get()).toEqual(0);
    });

    const names = ['first', 'second', 'third'];
    const time = new Time();
    time.begin();
    time.end();
    names.forEach(name => time.begin(name));
    names.forEach(name => time.end(name));

    it('should list all time record', () => {
        const list = time.list();
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBe(4);
        expect(list.map(item => item[0])).toEqual(
            expect.arrayContaining(names.concat(time.name()))
        );
    });

    it('returns result of total time', () => {
        let total = 0;
        time.list().forEach(item => {
            total += item[1];
        });
        expect(time.total()).toEqual(total);
    });
});
