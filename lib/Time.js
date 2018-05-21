"use strict";


function Time(name) {
    this._name = this.name(name);
    this._time0 = {}; // time begin
    this._time1 = {}; // time end
}

Time.prototype.name = function(name) {
    return name && typeof name === 'string'
        ? name
        : (this._name || 'default');
};

Time.prototype.get = function(name) {
    name = this.name(name);
    return this._time1[name] && this._time0[name]
        ? Math.max(this._time1[name] - this._time0[name], 0)
        : 0;
};

Time.prototype.total = function () {
    let total = 0;
    this.list().forEach(item => {
        total += item[1];
    });
    return total;
};

Time.prototype.list = function() {
    return Object.keys(this._time1).map(name => (
        [name, this.get(name)]
    ));
};

Time.prototype.begin = function(name) {
    this._time0[this.name(name)] = Date.now();
};

Time.prototype.end = function(name) {
    this._time1[this.name(name)] = Date.now();
};


exports = module.exports = Time;
