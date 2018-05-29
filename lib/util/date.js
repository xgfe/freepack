/**
 * 标准日期格式
 * dateString
 *   <±>yyyy-MM-dd(T| )hh:mm:ss(±08:00|±0800|±08|Z)
 *   <±>yyyy-MM-dd(T| )hh:mm:ss
 */

// <->\d+
var REG_TIMESTAMP = /^-?\d+$/;
// <±>yyyy-MM-ddThh:mm:ss(±08:00|±0800|±08|Z)
var REG_DATE = /^[+-]?\d+-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}|[+-]\d{2}:\d{2}|[+-]\d{4})$/;
// <±>yyyy-MM-ddThh:mm:ss
var REG_DATE_LOCALE = /^[+-]?\d+-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?$/;
// <±>yyyy-MM-dd
var REG_DATE_DATE = /^[+-]?\d+-\d{2}-\d{2}$/;
// ±08:00|±0800|±08|Z
var REG_TIMEZONE = /^(Z|[+-]\d{2}|[+-]\d{2}:\d{2}|[+-]\d{4})$/;

var STRING_DATE_FORMAT = 'y-MM-dd';
var DEFAULT_DATE_FORMAT = 'y-MM-dd hh:mm:ss';
var LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset();

function getTimeZone(timezoneOffset) {
  // TODO 获取 时区缩写
  return timezoneOffset;
}

function formatTime(time) {
  return String(time < 10 ? '0' + time : time);
}

function toUTCString(dateString) {
  if (typeof dateString === 'string') {
    dateString = dateString.replace(' ', 'T')
    if (REG_DATE.test(dateString)) {
      return dateString;
    } else if (REG_DATE_LOCALE.test(dateString)) {
      return dateString + parseTimezoneOffset(LOCAL_TIMEZONE_OFFSET);
    } else if (REG_DATE_DATE.test(dateString)) {
      return dateString + 'T00:00:00' + parseTimezoneOffset(LOCAL_TIMEZONE_OFFSET);
    } else {
      return '';
    }
  } else {
    return '';
  }
}

function parseTimezone(timezone) {
  if (!REG_TIMEZONE.test(timezone)) return 0;
  // ±08:00 | ±0800 | ±08 | Z
  return  timezone === 'Z' ? 0 : -1 * Number(timezone.substr(0, 1) + '1') * ( Number(timezone.substr(1, 2)) * 60 + Number(timezone.substr(Math.max(timezone.length - 2, 3), 2)) );
}

function parseTimezoneOffset(timezoneOffset, split) {
  if (!timezoneOffset) return 'Z';
  var offset = timezoneOffset > 0 ? '-' : '+';
  var hour = formatTime(Math.abs(parseInt(timezoneOffset / 60, 10)));
  var minute = formatTime(Math.abs(timezoneOffset % 60))
  return [offset, hour, split ? ':' : '', minute].join('');
}

function parseDateString(dateString) {
  dateString = toUTCString(dateString);
  if (!dateString) return null;
  var dateArr = dateString.split('T');
  var yyMMdd = dateArr[0].split('-');
  var hhmmss = dateArr[1].substr(0, 8).split(':');
  var Sz = dateArr[1].substr(8);
  var z = Sz;
  var S = 0;
  var matchS = Sz.match(/^\.\d+/);
  if (matchS) {
    z = Sz.replace(matchS[0], '');
    S = matchS[0].replace('.', '');
  }
  return {
    year: Number(yyMMdd[0]),
    month: Number(yyMMdd[1]),
    date: Number(yyMMdd[2]),
    hour: Number(hhmmss[0]),
    minute: Number(hhmmss[1]),
    second: Number(hhmmss[2]),
    millisecond: Number(S),
    timezone: z,
    timezoneOffset: parseTimezone(z)
  };
}

/**
 * 更换日期时区
 * @param  {Date}   date  日期
 * @param  {Timezone} timezone 时区偏移量
 * timezone
 *   Number     TimezoneOffset  -480                    偏移分钟
 *   String     Timezone        ±0800 | Z              时区
 *   false      OriginTimezone  DATE_TIMEZONE_OFFSET    dateString时区 | dateNumber/dateObject -> 本地时区
 *   other      LocalTimezone   LOCAL_TIMEZONE_OFFSET   本地时区
 */
function parse(date, timezone) {
  var dateObject = object(date);
  if (!dateObject) return null;

  var timezoneOffset = timezone;
  if (typeof timezoneOffset !== 'number') {
    if (typeof timezoneOffset === 'string') {
      timezoneOffset = parseTimezone(dateFormat);
    } else if (timezoneOffset === false) {
      var dateParsed = typeof date === 'string' ? parseDateString(date) : null;
      if (dateParsed) {
        timezoneOffset = dateParsed.timezoneOffset;;
      } else {
        timezoneOffset = LOCAL_TIMEZONE_OFFSET;
      }
    } else {
      timezoneOffset = LOCAL_TIMEZONE_OFFSET;
    }
  }

  dateObject.setTime(dateObject.getTime() - timezoneOffset * 60000);

  return {
    year: dateObject.getUTCFullYear(),
    month: dateObject.getUTCMonth() + 1,
    date: dateObject.getUTCDate(),
    day: dateObject.getUTCDay(),
    hour: dateObject.getUTCHours(),
    minute: dateObject.getUTCMinutes(),
    second: dateObject.getUTCSeconds(),
    millisecond: dateObject.getUTCMilliseconds(),
    timezone: parseTimezoneOffset(timezoneOffset, true),
    timezoneOffset: timezoneOffset
  };
}

/**
 * 获取日期对象
 * @param  {Number/String/Object} date  日期
 * @param  {Boolean} utc  当date为日期字符串时，此日期是否为世界协调时
 * @return {Object}      日期对象
 */
function object(date) {
  var dateObject = new Date();
  dateObject.setTime(0);
  if (date instanceof Date) {
    dateObject.setTime(date);
    return dateObject;
  } else if (typeof date === 'number' || ( typeof date === 'string' && REG_TIMESTAMP.test(date) )) {
    dateObject.setTime(Number(date));
    return dateObject;
  } else if (typeof date === 'string') {
    var dateParsed = parseDateString(date);
    if (!dateParsed) return null;
    dateObject.setUTCFullYear(dateParsed.year);
    dateObject.setUTCMonth(dateParsed.month - 1);
    dateObject.setUTCDate(dateParsed.date);
    dateObject.setUTCHours(dateParsed.hour);
    dateObject.setUTCMinutes(dateParsed.minute);
    dateObject.setUTCSeconds(dateParsed.second);
    dateObject.setUTCMilliseconds(dateParsed.millisecond);
    dateObject.setTime(dateObject.getTime() + dateParsed.timezoneOffset * 60000);
    return dateObject;
  } else {
    return null;
  }
}

function number(date) {
  var dateObject = object(date);
  return dateObject ? dateObject.getTime() : 0;
}

/**
 * 更换日期时区
 * @param  {Date}   date  日期
 * @param  {Timezone} timezone 时区偏移量
 * @return {String}          日期字符串
 * timezone
 *   Number     TimezoneOffset  -480                    偏移分钟
 *   String     Timezone        ±0800 | Z              时区
 *   false      OriginTimezone  DATE_TIMEZONE_OFFSET    dateString时区 | dateNumber/dateObject -> 本地时区
 *   other      LocalTimezone   LOCAL_TIMEZONE_OFFSET   本地时区
 */
function string(date, dateFormat, timezone) {
  var dateObject = object(date);
  if (!dateObject) return '';

  var timezoneOffset = timezone;
  if (typeof dateFormat === 'string') {
    if (REG_TIMEZONE.test(dateFormat) ) {
      timezoneOffset = parseTimezone(dateFormat);
      dateFormat = DEFAULT_DATE_FORMAT;
    }
  } else {
    timezoneOffset = dateFormat;
    dateFormat = DEFAULT_DATE_FORMAT;
  }

  var dateObjectParsed = parse(dateObject, timezoneOffset);
  if (!dateObjectParsed) return '';
  // TODO regs的匹配规则优化
  var regs = {
    'M+': dateObjectParsed.month,
    'd+': dateObjectParsed.date,
    'h+': dateObjectParsed.hour,
    'm+': dateObjectParsed.minute,
    's+': dateObjectParsed.second,
    'q+': Math.floor((dateObjectParsed.month + 2) / 3),
    't': getTimeZone(dateObjectParsed.timezoneOffset)
  };
  // TODO 公元前，时区等信息
  if (/(y+)/.test(dateFormat)) {
    var era = dateObjectParsed.year < 0 ? '-' : ''
    var year = '000' + Math.abs(dateObjectParsed.year);
    dateFormat = dateFormat.replace(RegExp.$1, era + ( RegExp.$1.length === 1 ? Number(year) : year.substr(year.length - 4) ));
  }
  if (/(S+)/.test(dateFormat)) {
    var millisecond = '00' + dateObjectParsed.millisecond;
    dateFormat = dateFormat.replace(RegExp.$1, RegExp.$1.length === 1 ? Number(millisecond) : millisecond.substr(millisecond.length - 3));
  }
  if (/(z+)/.test(dateFormat)) {
    dateFormat = dateFormat.replace(RegExp.$1, RegExp.$1.length === 1 ? dateObjectParsed.timezone.replace(':', '') : dateObjectParsed.timezone);
  }
  for (var reg in regs) {
    if (new RegExp('(' + reg + ')').test(dateFormat)) {
      dateFormat = dateFormat.replace(RegExp.$1, RegExp.$1.length == 1 ? regs[reg] : ('00' + regs[reg]).substr(String(regs[reg]).length));
    }
  }
  return dateFormat;
}

function stringDate(date, timezone) {
  return string(date, STRING_DATE_FORMAT, timezone)
}


function diff(dateA, dateB) {
  var dateAObject = object(dateA);
  var dateBObject = object(dateB);
  if (!dateAObject || !dateBObject) return 0;
  var diffMillseconds = Math.abs(dateAObject - dateBObject);
  var millisecond = diffMillseconds;
  var second = millisecond / 1000;
  var minute = second / 60;
  var hour = minute / 60;
  var day = hour / 24;
  return {
    day: day,
    hour: hour,
    minute: minute,
    second: second,
    millisecond: millisecond,
    toString: function(format) {
      return day > 0
        ? Math.ceil(day) + '天'
        : hour > 0
          ? Math.ceil(hour) + '时'
          : minute > 0
            ? Math.ceil(minute) + '分'
            : Math.max(Math.ceil(second), 1) + '秒'
    }
  };
}

exports.number = number;
exports.string = string;
exports.stringDate = stringDate;
exports.object = object;
exports.parse = parse;
exports.diff = diff;
exports.parseTimezoneOffset = parseTimezoneOffset;
