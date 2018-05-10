function Time() {
    this.times = {};
}

Time.prototype.get = function (type) {
    if (type) {
        const duration = this.times[type] || [0, 0];
        return (duration[1] || 0) - duration[0];
    } else {
        const children = Object.keys(this.times).map(key => ([key, this.get(key)]));
        let total = 0;
        children.forEach(child => {
            total += child[1]
        });
        return {
            total: total,
            children: children
        }
    }
};

Time.prototype.start = function (type) {
    this.times[type] = [Date.now()];
};

Time.prototype.end = function (type) {
    this.times[type] = (this.times[type] || [0]).concat(Date.now());
};


exports = module.exports = Time;
