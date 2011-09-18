(function (document, window, JSON, Math) {

  var

    $ = function (id) {
      return document.getElementById(id);
    },

    body = document.body,

    markup = $('markup'),

    bitlyLimit = 15,

    hashifyMe = 'http://markdown-slide.herokuapp.com/',

    hashifyMeLen = hashifyMe.length,

    lastEditorValue,

    lastSavedDocument,

    maxHashLength = 2048 - hashifyMe.length,

    preferredWidth = (function (match) {
      match = /(?:^|; )w=(\d+?)(?:;|$)/.exec(document.cookie);
      return match? +match[1]: -1;
    }()),

    presentationModeSpecified = function () {
      return /[?;]mode:presentation(;|$)/.test(documentComponents()[2]);
    },

    pushStateExists = window.history && history.pushState,

    returnFalse = function () { return false; },

    windowWidth,

    convert = new Showdown('datetimes', 'abbreviations').convert,

    encode = Hashify.encode,

    decode = function (text) {
      try {
        return Hashify.decode(text);
      } catch (error) {
        if (error instanceof URIError) return '# ' + error;
        else throw error;
      }
    },

    documentComponents = function () {
      var match = /^#!\/([^?]*)(\?.*)?$/.exec(location.hash);
      return match || [null, location.pathname.substr(1), location.search];
    },

    documentHash = function () {
      return documentComponents()[1].substring(2);
    },

    highlight = (function (prettyPrint, nodeList) {
      nodeList = document.getElementsByTagName('code');
      return function () {
        var i = nodeList.length;
        while (i--) nodeList[i].className = 'prettyprint';
        prettyPrint();
      };
    }(prettyPrint)),

    // logic borrowed from https://github.com/jquery/jquery
    parseJSON = function (data) {
      if (typeof data !== 'string' || !data) {
        return null;
      }
      data = data.replace(/^\s+|\s+$/g, '');
      if (
        /^[\],:{}\s]*$/
          .test(
            data
              .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
              .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g, ']')
              .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
          )
      ) return JSON && JSON.parse? JSON.parse(data): new Function('return ' + data)();
      throw new SyntaxError('Invalid JSON');
    },

    prettifyInUse = function () {
      return !/[?;]prettify:no(;|$)/.test(documentComponents()[2]);
    },

    queryString = function (presentationMode) {
      var pairs = [], text;

      if (presentationMode) pairs.push('mode:presentation');
      if (!prettifyInUse()) pairs.push('prettify:no');

      text = pairs.join(';');
      return text? '?' + text: text;
    },

    sendRequest = (function (corsNotSupported, text) {
      corsNotSupported = function () {
        setLocation(encode(text));
        render(text, true);
      };
      text = [
        "# I'm sorry, Dave",
        '',
        'Your browser appears not to support',
        '[cross-origin resource sharing][1].',
        '',
        '',
        '[1]: http://en.wikipedia.org/wiki/Cross-Origin_Resource_Sharing'
      ].join('\n');

      return function (action, params, success) {
        var
          json,
          request = new XMLHttpRequest();

        try {
          request.open('GET',
            'http://api.bitly.com/v3/' + action + '?login=davidchambers&' +
            'apiKey=R_20d23528ed6381ebb614a997de11c20a&' + params
          );
        } catch (error) {
          if (
            error.code === 1012 || // NS_ERROR_DOM_BAD_URI
            /^Access is denied\.\r\n$/.test(error.message)) {
            corsNotSupported();
            return;
          }
          throw error;
        }
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            if (request.status === 200) {
              json = parseJSON(request.responseText);
              if (json.status_code === 200) {
                success(json.data);
              } else {
                console.log('bit.ly – "' + json.status_txt.toLowerCase().replace(/_/g, ' ') + '" :\\');
              }
            }
          }
        };
        try {
          request.send();
        } catch (error) {
          if (error.message !== 'Security violation') throw error;
          // Opera
          corsNotSupported();
        }
      };
    }()),

    sendShortenRequests = function (arg) {
      var
        lastRequests = typeof arg === 'string',
        paths = lastRequests? [arg + queryString(), arg + queryString(true)]: arg,
        yetToReturn = paths.length,
        i = yetToReturn,
        list = [],
        bind = function (index) {
          return function (data) {
            list[index] = lastRequests? data: data.hash;
            if (!--yetToReturn) {
              lastRequests?
                // Select the document's presentation mode short URL
                // if its canonical URL contains "?mode:presentation".
                setShortUrl(list[+presentationModeSpecified()]):
                sendShortenRequests('unpack:' + list);
            }
          };
        };

      while (i--) {
        sendRequest('shorten', 'longUrl=' + hashifyMe + paths[i], bind(i));
      }
    },

    setLocation = (function () {
      return;
      var
        counter = $('counter'),
        caution = maxHashLength,
        danger = 2083 - (hashifyMe + '#!/' + queryString(true)).length;

      return function (hash, arg) {
        var
          len = hash.length,
          path = '/' + hash,
          save = arg === true;

        if (typeof arg === 'string') path += arg;

        counter.innerHTML = len;
        counter.className =
          len > danger? 'danger': // too long for old versions of IE
          len > caution? 'caution': // too long to send to bit.ly
          '';
        shorten.style.display = hash === lastSavedDocument? 'none': 'block';

        if (pushStateExists) {
          history[save?'pushState':'replaceState'](null, null, path);
        } else {
          path = '/#!' + path;
          // Since `location.replace` overwrites the current history entry,
          // saving a location to history is not simply a matter of calling
          // `location.assign`. Instead, we must create a new history entry
          // and immediately overwrite it.

          // update current history entry
          location.replace(path);

          if (save) {
            // create a new history entry (to save the current one)
            location.hash = '#!/';
            // update the new history entry (to reinstate the hash)
            location.replace(path);
          }
        }
      };
    }()),

    render = (function (div) {
      div = document.createElement('div');
      return function (text, setEditorValue) {
        var
          position = text.length - 1,
          charCode = text.charCodeAt(position);
        if (0xD800 <= charCode && charCode < 0xDC00) {
          // In Chrome, if one attempts to delete a surrogate
          // pair character, only half of the pair is deleted.
          // We strip the orphan to avoid `encodeURIComponent`
          // throwing a `URIError`.
          text = text.substr(0, position);
          // normalize `editor.value`
          setEditorValue = true;
        }
        
        var baseHtml = convert(text);
        var pages = baseHtml.split("<hr />");
        var pagesHtml = "";
        for (idx in pages) {
          var page = pages[idx];
          pagesHtml += "<article>" + page + "</article>\n"
        }
        markup.innerHTML = pagesHtml;
        div.innerHTML = convert(text.match(/^.*$/m)[0]);
        document.title = div.textContent || 'Hashify';
        if (prettifyInUse()) highlight();
        return false;
      };
    }()),

    updateView = function (value) {
      render(value);
      //setLocation(encode(value));
    };

  // EVENT HANDLERS //

  var
    list,
    mask = $('mask'),
    hash = documentHash(),
    presentationMode = presentationModeSpecified(),
    search = queryString(presentationMode);

  if (/^[A-Za-z0-9+/=]+$/.test(hash)) {
    if (!pushStateExists && location.pathname !== '/') {
      location.replace('/#!/' + hash + search);
    }
    render(decode(hash), true);
  }
  
}(document, window, window.JSON, Math));