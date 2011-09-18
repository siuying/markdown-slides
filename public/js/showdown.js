(function() {
  var Showdown, Text, blocks, char2hex, encodeEmailAddress, escapeCharacters_callback, extensions, hashElement, level, processListItems, processors, titles, urls, writeAnchorTag, writeImageTag;
  var __slice = Array.prototype.slice, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  urls = {};
  titles = {};
  blocks = [];
  level = 0;
  extensions = [];
  Showdown = function() {
    extensions = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.extensions = extensions;
  };
  if (typeof window !== "undefined" && window !== null) {
    window.Showdown = Showdown;
  }
  if (typeof exports !== "undefined" && exports !== null) {
    exports.Showdown = Showdown;
  }
  Showdown.Text = function() {
    return Text;
  };
  processors = [];
  Showdown.register = function(name, preprocessor, processor) {
    return processors.push([name, preprocessor, processor]);
  };
  Showdown.prototype.convert = function(text) {
    urls = {};
    titles = {};
    blocks = [];
    return new Text(text).replace(/~/g, '~T').replace(/\$/g, '~D').replace(/\r\n?/g, '\n').detab().trim(/^ +$/mg).before('\n\n').after('\n\n').hashHtmlBlocks().preprocess().stripLinkDefinitions().runBlockGamut().unescapeSpecialChars().replace(/~D/g, '$$').replace(/~T/g, '~').after('\n').value;
  };
  Text = (function() {
    function Text(value) {
      this.value = value;
    }
    Text.prototype.cond = function(cond, fn1, fn2) {
      if (cond) {
        fn1.call(this);
      } else {
        if (fn2 != null) {
          fn2.call(this);
        }
      }
      return this;
    };
    Text.prototype.before = function(text) {
      return this.set(text + this.value);
    };
    Text.prototype.after = function(text) {
      return this.set(this.value + text);
    };
    Text.prototype.replace = function(pattern, repl) {
      return this.set(this.value.replace(pattern, repl));
    };
    Text.prototype.trim = function(pattern) {
      if (pattern == null) {
        pattern = /^\n+|\n+$/g;
      }
      return this.replace(pattern, '');
    };
    Text.prototype.quot = function() {
      return this.replace(/"/g, '&quot;');
    };
    Text.prototype.set = function(text) {
      this.value = text;
      return this;
    };
    Text.prototype.log = function() {
      console.log(this.value);
      return this;
    };
    Text.prototype.toString = function() {
      return this.value;
    };
    Text.prototype.preprocess = function() {
      var index, name, preprocessor, _len, _ref;
      for (index = 0, _len = processors.length; index < _len; index++) {
        _ref = processors[index], name = _ref[0], preprocessor = _ref[1];
        if (__indexOf.call(extensions, name) >= 0) {
          processors[index][3] = preprocessor.call(this);
        }
      }
      return this;
    };
    Text.prototype.process = function() {
      var data, name, preprocessor, processor, _i, _len, _ref;
      for (_i = 0, _len = processors.length; _i < _len; _i++) {
        _ref = processors[_i], name = _ref[0], preprocessor = _ref[1], processor = _ref[2], data = _ref[3];
        if (__indexOf.call(extensions, name) >= 0) {
          processor.call(this, data);
        }
      }
      return this;
    };
    Text.prototype.stripLinkDefinitions = function() {
      return this.replace(/^\x20{0,3}\[(.+)\]:[\x20\t]*\n?[\x20\t]*<?(\S+?)>?[\x20\t]*\n?[\x20\t]*(?:(\n*)["(](.+?)[")][\x20\t]*)?(?:\n+|\Z)/gm, function(_, m1, m2, m3, m4) {
        m1 = m1.toLowerCase();
        urls[m1] = new Text(m2).encodeAmpsAndAngles().value;
        if (m3) {
          return m3 + m4;
        }
        if (m4) {
          titles[m1] = new Text(m4).quot().value;
        }
        return '';
      });
    };
    Text.prototype.hashHtmlBlocks = function() {
      return this.replace(/\n/g, '\n\n').replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[\x20\t]*(?=\n+))/gm, hashElement).replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[\x20\t]*(?=\n+)\n)/gm, hashElement).replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashElement).replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, hashElement).replace(/\n\n/g, '\n');
    };
    Text.prototype.runBlockGamut = function() {
      var key;
      key = new Text('<hr />').hashBlock().value;
      return this.doHeaders().replace(/^[ ]{0,3}([*_-])[ ]?(?:\1[ ]?){2,}[ \t]*$/gm, key).doLists().doCodeBlocks().doBlockQuotes().hashHtmlBlocks().formParagraphs();
    };
    Text.prototype.runSpanGamut = function() {
      return this.doCodeSpans().escapeSpecialCharsWithinTagAttributes().encodeBackslashEscapes().doImages().doAnchors().doAutoLinks().encodeAmpsAndAngles().doItalicsAndBold().replace(/[ ]{2,}\n/g, ' <br />\n').process();
    };
    Text.prototype.escapeSpecialCharsWithinTagAttributes = function() {
      return this.replace(/<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>/gi, function(match) {
        return new Text(match).replace(/(.)<\/?code>(?=.)/g, '$1`').escapeCharacters('\\`*_');
      });
    };
    Text.prototype.doAnchors = function() {
      return this.replace(/\[((?:\[[^\]]*\]|[^\[\]])*)\]\x20?(?:\n\x20*)?\[(.*?)\]()()()()/g, writeAnchorTag).replace(/\[((?:\[[^\]]*\]|[^\[\]])*)\]\([\x20\t]*()<?(.*?)>?[\x20\t]*(([\x27\x22])(.*?)\5[\x20\t]*)?\)/g, writeAnchorTag).replace(/\[([^\[\]]+)\]()()()()()/g, writeAnchorTag);
    };
    Text.prototype.doImages = function() {
      return this.replace(/!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\]()()()()/g, writeImageTag).replace(/!\[(.*?)\]\s?\([\x20\t]*()<?(\S+?)>?[\x20\t]*(([\x27\x22])(.*?)\5[\x20\t]*)?\)/g, writeImageTag);
    };
    Text.prototype.doHeaders = function() {
      var sub;
      sub = function(text, tag) {
        return new Text(text).runSpanGamut().before("<" + tag + ">").after("</" + tag + ">").hashBlock();
      };
      return this.replace(/^(?![ ]{0,3}-[ \t])(.+)[ \t]*\n(?:(=+)|-+)[ \t]*\n+/gm, function(_, m1, h1) {
        return sub(m1, h1 ? 'h1' : 'h2');
      }).replace(/^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm, function(_, m1, m2) {
        return sub(m2, 'h' + m1.length);
      });
    };
    Text.prototype.doLists = function() {
      return this.after('~0').cond(level, function() {
        return this.replace(/^\x20{0,3}(?:([*+-])|\d+[.])[\x20\t]+[^\r]+?(?:~0|\n{2,}(?=\S)(?![\x20\t]*(?:[*+-]|\d+[.])[\x20\t]+))/gm, function(list, unordered) {
          var result, tag;
          tag = unordered ? 'ul' : 'ol';
          result = processListItems(list.replace(/\n{2,}/g, '\n\n\n'));
          return "<" + tag + ">\n" + (result.replace(/\s+$/, '')) + "\n</" + tag + ">\n";
        });
      }, function() {
        return this.replace(/(\n\n|^\n?)(\x20{0,3}(?:([*+-])|\d+[.])[\x20\t]+[^\r]+?(?:~0|\n{2,}(?=\S)(?![\x20\t]*(?:[*+-]|\d+[.])[\x20\t]+)))/g, function(_, runup, list, unordered) {
          var tag;
          tag = unordered ? 'ul' : 'ol';
          list = list.replace(/\n{2,}/g, '\n\n\n');
          return "" + runup + "<" + tag + ">\n" + (processListItems(list)) + "</" + tag + ">\n";
        });
      }).trim(/~0/);
    };
    Text.prototype.doCodeBlocks = function() {
      return this.replace(/(?:\n\n|^)((?:(?:\x20{4}|\t).*\n+)+)(\n*\x20{0,3}[^\x20\t\n]|$)/g, function(_, codeblock, nextChar) {
        return new Text(codeblock).outdent().encodeCode().detab().trim().before('<pre><code>').after('\n</code></pre>').hashBlock().after(nextChar);
      });
    };
    Text.prototype.hashBlock = function() {
      return this.set("\n\n~K" + (blocks.push(this.value.trim()) - 1) + "K\n\n");
    };
    Text.prototype.doCodeSpans = function() {
      return this.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function(_, m1, m2, c) {
        return new Text(c).trim(/(^[ \t]+|[ \t]+$)/g).encodeCode().before(m1 + '<code>').after('</code>');
      });
    };
    Text.prototype.encodeCode = function() {
      return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').escapeCharacters('*_{}[]\\');
    };
    Text.prototype.doItalicsAndBold = function() {
      return this.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, '<strong>$2</strong>').replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, '<em>$2</em>');
    };
    Text.prototype.doBlockQuotes = function() {
      return this.replace(/(^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+/gm, function(blockquote) {
        return new Text(blockquote).trim(/^[ \t]*>[ \t]?/gm).trim(/^[ \t]+$/gm).runBlockGamut().before('<blockquote>\n').after('\n</blockquote>').hashBlock();
      });
    };
    Text.prototype.formParagraphs = function() {
      var grafs, grafsOut, index, str, value, _i, _len, _len2;
      grafs = this.value.trim().split(/\n{2,}/g);
      grafsOut = [];
      for (_i = 0, _len = grafs.length; _i < _len; _i++) {
        str = grafs[_i];
        if (/~K\d+K/g.test(str)) {
          grafsOut.push(str);
        } else if (/\S/.test(str)) {
          grafsOut.push(new Text(str).runSpanGamut().replace(/^([ \t]*)/g, '<p>').after('</p>'));
        }
      }
      for (index = 0, _len2 = grafsOut.length; index < _len2; index++) {
        value = grafsOut[index];
        while (/~K(\d+)K/.test(grafsOut[index])) {
          grafsOut[index] = grafsOut[index].replace(/~K\d+K/, blocks[RegExp.$1].replace(/\$/g, '$$$$'));
        }
      }
      return this.set(grafsOut.join('\n\n'));
    };
    Text.prototype.encodeAmpsAndAngles = function() {
      return this.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, '&amp;').replace(/<(?![a-z\/?\$!])/gi, '&lt;');
    };
    Text.prototype.encodeBackslashEscapes = function() {
      return this.replace(/\\(\\)/g, escapeCharacters_callback).replace(/\\([`*_{}\[\]()>#+-.!])/g, escapeCharacters_callback);
    };
    Text.prototype.doAutoLinks = function() {
      return this.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi, '<a href="$1">$1</a>').replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, function(_, m1) {
        return encodeEmailAddress(new Text(m1).unescapeSpecialChars().value);
      });
    };
    Text.prototype.unescapeSpecialChars = function() {
      return this.replace(/~E(\d+)E/g, function(_, m1) {
        return String.fromCharCode(parseInt(m1, 10));
      });
    };
    Text.prototype.outdent = function() {
      return this.replace(/^(\t|[ ]{1,4})/gm, '~0').trim(/~0/g);
    };
    Text.prototype.detab = function() {
      return this.replace(/\t(?=\t)/g, '    ').replace(/\t/g, '~A~B').replace(/~B(.+?)~A/g, function(_, leadingText) {
        var numSpaces;
        numSpaces = 4 - leadingText.length % 4;
        if (numSpaces > 0) {
          leadingText += new Array(numSpaces + 1).join(' ');
        }
        return leadingText;
      }).replace(/~A/g, '    ').trim(/~B/g);
    };
    Text.prototype.escapeCharacters = function(charsToEscape) {
      return this.replace(new RegExp("([" + (charsToEscape.replace(/[[\\\]]/g, '\\$&')) + "])", 'g'), escapeCharacters_callback);
    };
    return Text;
  })();
  hashElement = function(_, blockText) {
    blockText = new Text(blockText).replace(/\n\n/g, '\n').trim(/^\n|\n+$/g);
    return "\n\n~K" + (blocks.push(blockText) - 1) + "K\n\n";
  };
  writeAnchorTag = function(match, link_text, link_id, url, m5, m6, title) {
    link_id = link_id.toLowerCase();
    if (!url) {
      link_id || (link_id = link_text.toLowerCase().trim(/[ ]?\n/g));
      url = '#' + link_id;
      if (urls[link_id] === void 0) {
        if (/\(\s*\)$/m.test(match)) {
          url = '';
        } else {
          return match;
        }
      } else {
        url = urls[link_id];
        if (titles[link_id] !== void 0) {
          title = titles[link_id];
        }
      }
    }
    return new Text(url).escapeCharacters('*_').before('<a href="').cond(title, function() {
      return this.after('" title="' + new Text(title).quot().escapeCharacters('*_'));
    }).after('">' + link_text + '</a>');
  };
  writeImageTag = function(match, alt_text, link_id, url, m5, m6, title) {
    link_id = link_id.toLowerCase();
    if (url === '') {
      if (link_id === '') {
        link_id = alt_text.toLowerCase().replace(/[ ]?\n/g, ' ');
      }
      url = '#' + link_id;
      if (urls[link_id] === void 0) {
        return match;
      }
      url = urls[link_id];
      title = titles[link_id];
    }
    return new Text(url).escapeCharacters('*_').before('<img src="').after('" alt="' + new Text(alt_text).quot() + '"').cond(title, function() {
      return this.after(' title="' + new Text(title).quot().escapeCharacters('*_') + '"');
    }).after(' />');
  };
  processListItems = function(list_str) {
    level++;
    list_str = ("" + (list_str.replace(/\n{2,}$/, '\n')) + "~0").replace(/(\n)?(^[\x20\t]*)(?:[*+-]|\d+[.])[\x20\t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[\x20\t]+))/gm, function(_, leading_line, leading_space, item) {
      return new Text(item).outdent().cond(leading_line || /\n{2,}/.test(item), function() {
        return this.runBlockGamut();
      }, function() {
        return this.doLists().trim(/\n$/).runSpanGamut();
      }).before('<li>').after('</li>\n');
    });
    level--;
    return list_str.replace(/~0/g, '');
  };
  char2hex = function(chr) {
    var dec, hexDigits;
    dec = chr.charCodeAt(0);
    hexDigits = '0123456789ABCDEF';
    return hexDigits.charAt(dec >> 4) + hexDigits.charAt(dec & 15);
  };
  encodeEmailAddress = function(addr) {
    var encode;
    encode = [
      function(chr) {
        return "&#" + (chr.charCodeAt(0)) + ";";
      }, function(chr) {
        return "&#x" + (char2hex(chr)) + ";";
      }
    ];
    addr = ("mailto:" + addr).replace(/./g, function(chr) {
      var r;
      switch (chr) {
        case ':':
          return chr;
        case '@':
          return encode[+(Math.random() > 0.5)](chr);
        default:
          r = Math.random();
          if (r > 0.9) {
            return chr;
          } else {
            return encode[+(r > 0.45)](chr);
          }
      }
    });
    return "<a href=\"" + addr + "\">" + (addr.replace(/.+:/, '')) + "</a>";
  };
  escapeCharacters_callback = function(_, chr) {
    return "~E" + (chr.charCodeAt(0)) + "E";
  };
}).call(this);