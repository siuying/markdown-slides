(function() {
  var Showdown, Text, re, safe, stripAbbrDefs, wrap, wrapAbbrs;
  re = /\n?^\x20{0,3}\*\[(.+?)\]\x20?:\x20?(.*?)[\x20\t]*$/gm;
  Showdown = (typeof exports !== "undefined" && exports !== null ? exports : this).Showdown;
  Text = Showdown.Text();
  safe = function(text) {
    return new Text(text).encodeAmpsAndAngles();
  };
  wrap = function(abbr, full) {
    if (full) {
      full = safe(full).quot().replace(/>/g, '&gt;');
      return "<abbr title=\"" + full + "\">" + (safe(abbr)) + "</abbr>";
    } else {
      return "<abbr>" + (safe(abbr)) + "</abbr>";
    }
  };
  stripAbbrDefs = function() {
    var abbrsHash, abbrsList, bucket, buckets, _i, _len;
    buckets = [];
    abbrsHash = {};
    this.replace(re, function(_, abbr, full) {
      var _name;
      if (!(abbr in abbrsHash)) {
        (buckets[_name = abbr.length] || (buckets[_name] = [])).push(abbr);
        abbrsHash[abbr] = full;
      }
      return '';
    });
    abbrsList = [];
    for (_i = 0, _len = buckets.length; _i < _len; _i++) {
      bucket = buckets[_i];
      if (bucket) {
        abbrsList = bucket.concat(abbrsList);
      }
    }
    return [abbrsList, abbrsHash];
  };
  wrapAbbrs = function(_arg) {
    var abbr, abbrsHash, abbrsList, full, _i, _len;
    abbrsList = _arg[0], abbrsHash = _arg[1];
    for (_i = 0, _len = abbrsList.length; _i < _len; _i++) {
      abbr = abbrsList[_i];
      full = abbrsHash[abbr];
      this.replace(/[^<>]+(?=<(?!\/abbr>)|$)/g, function(head) {
        var index, substr, tail;
        tail = '';
        while (~(index = head.lastIndexOf(abbr))) {
          substr = head.substr(index);
          if (!/\w/.test(head.charAt(index - 1)) && !/\w/.test(head.charAt(index + abbr.length))) {
            substr = substr.replace(abbr, wrap(abbr, full));
          }
          tail = substr + tail;
          head = head.substr(0, index);
        }
        return head + tail;
      });
    }
  };
  Showdown.register('abbreviations', stripAbbrDefs, wrapAbbrs);
}).call(this);