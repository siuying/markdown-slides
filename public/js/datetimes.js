(function() {
  var Showdown, Text, re, stripTimeDefs, wrap, wrapTimes;
  re = /\n?^\x20{0,3}\*\[(.+?)\]\x20?:\x20?(\d{4}-(?:0[1-9]|1[012])-(?:0[1-9]|[12]\d|3[01]))(?:\x20((?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?)\x20(?:(GMT|UTC)|([+-])((?:0|1)?\d|2[0-3])(?::([0-5]\d))?))?(\x20pubdate)?[\x20\t]*$/gm;
  Showdown = (typeof exports !== "undefined" && exports !== null ? exports : this).Showdown;
  Text = Showdown.Text();
  wrap = function(text, datetime, pubdate) {
    var output;
    output = "<time datetime=\"" + datetime;
    if (pubdate) {
      output += '" pubdate="pubdate';
    }
    return output + ("\">" + (new Text(text).encodeAmpsAndAngles()) + "</time>");
  };
  stripTimeDefs = function() {
    var bucket, buckets, timesHash, timesList, _i, _len;
    buckets = [];
    timesHash = {};
    this.replace(re, function(_, text, date, time, utc, sign, hours, minutes, pubdate) {
      var datetime, _name;
      if (!(text in timesHash)) {
        (buckets[_name = text.length] || (buckets[_name] = [])).push(text);
        datetime = date;
        if (utc) {
          sign = '+';
          hours = '00';
        }
        if (sign) {
          if (hours.length === 1) {
            hours = "0" + hours;
          }
          datetime += "T" + time + sign + hours + ":" + (minutes || '00');
        }
        timesHash[text] = wrap(text, datetime, pubdate);
      }
      return '';
    });
    timesList = [];
    for (_i = 0, _len = buckets.length; _i < _len; _i++) {
      bucket = buckets[_i];
      if (bucket) {
        timesList = bucket.concat(timesList);
      }
    }
    return [timesList, timesHash];
  };
  wrapTimes = function(_arg) {
    var text, timesHash, timesList, _i, _len;
    timesList = _arg[0], timesHash = _arg[1];
    for (_i = 0, _len = timesList.length; _i < _len; _i++) {
      text = timesList[_i];
      this.replace(/[^<>]+(?=<(?!\/time>)|$)/g, function(head) {
        var index, substr, tail;
        tail = '';
        while (~(index = head.lastIndexOf(text))) {
          substr = head.substr(index);
          if (!/\w/.test(head.charAt(index - 1)) && !/\w/.test(head.charAt(index + text.length))) {
            substr = substr.replace(text, timesHash[text]);
          }
          tail = substr + tail;
          head = head.substr(0, index);
        }
        return head + tail;
      });
    }
  };
  Showdown.register('datetimes', stripTimeDefs, wrapTimes);
}).call(this);