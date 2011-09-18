(function() {
  var Controller, root;
  Controller = (function() {
    function Controller($, hashify, showdown, prettyPrint) {
      var controller;
      this.hashify = hashify;
      this.showdown = showdown;
      this.prettyPrint = prettyPrint;
      this.editor = $("#markdown");
      this.converter = new showdown.converter;
      controller = this;
      this.editor.keyup(function() {
        if (controller.lastEditorValue !== (controller.lastEditorValue = this.value)) {
          controller.updateView(controller.lastEditorValue);
        }
        return false;
      });
      this.hashify.editor(this.editor[0], false, this.editor[0].onkeyup);
    }
    Controller.prototype.updateView = function(value) {
      this.render(value);
      this.setLocation(this.hashify.encode(value));
      this.lastEditorValue = value;
      return false;
    };
    Controller.prototype.render = function(value) {
      var pageHtml, slideHtml;
      pageHtml = (function() {
        var _i, _len, _ref, _results;
        _ref = this.converter.makeHtml(value).split("<hr />");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          slideHtml = _ref[_i];
          _results.push("<article>" + slideHtml + "</article>");
        }
        return _results;
      }).call(this);
      $("#markup").html(pageHtml.join(''));
      $("#markup").find("code").addClass('prettyprint');
      return prettyPrint();
    };
    Controller.prototype.setLocation = function(hash, arg) {};
    return Controller;
  })();
  root = typeof exports !== "undefined" && exports !== null ? exports : window;
  root.Controller = Controller;
}).call(this);
