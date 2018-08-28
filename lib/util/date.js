exports.string = function(date, dateFormat) {
    var dateObjectParsed = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        day: date.getDay(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds()
    };
    var regs = {
        'M+': dateObjectParsed.month,
        'd+': dateObjectParsed.date,
        'h+': dateObjectParsed.hour,
        'm+': dateObjectParsed.minute,
        's+': dateObjectParsed.second,
        'q+': Math.floor((dateObjectParsed.month + 2) / 3),
    };
    if (/(y+)/.test(dateFormat)) {
        var year = '000' + Math.abs(dateObjectParsed.year);
        dateFormat = dateFormat.replace(RegExp.$1, year.substr(year.length - 4));
    }
    if (/(S+)/.test(dateFormat)) {
        var millisecond = '00' + dateObjectParsed.millisecond;
        dateFormat = dateFormat.replace(RegExp.$1, millisecond.substr(millisecond.length - 3));
    }
    for (var reg in regs) {
        if (new RegExp('(' + reg + ')').test(dateFormat)) {
            dateFormat = dateFormat.replace(RegExp.$1, RegExp.$1.length === 1 ? regs[reg] : ('00' + regs[reg]).substr(String(regs[reg]).length));
        }
    }
    return dateFormat;
};
