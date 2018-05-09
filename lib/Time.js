function Time() {
    this.times = {};
}

Time.prototype.get = function (type) {
    const duration = this.times[type] || [0, 0];
    return (duration[1] || 0) - duration[0]
};

Time.prototype.start = function (type) {
    this.times[type] = [Date.now()];
};

Time.prototype.end = function (type) {
    this.times[type] = (this.times[type] || [0]).concat(Date.now());
};


exports = module.exports = Time;
