(function() {
  var Controller, root;
  Controller = (function() {
    function Controller($, hashify, showdown) {
      var controller;
      this.hashify = hashify;
      this.showdown = showdown;
      this.md = $("#markdown");
      this.converter = new showdown.converter;
      controller = this;
      this.md.keyup(function() {
        if (controller.lastEditorValue !== (controller.lastEditorValue = this.value)) {
          return controller.updateView(controller.lastEditorValue);
        }
      });
      this.hashify.editor(this.md[0], false, this.updateView);
    }
    Controller.prototype.updateView = function(value) {
      this.render(value);
      this.setLocation(this.hashify.encode(value));
      return this.lastEditorValue = value;
    };
    Controller.prototype.render = function(value) {
      var pageHtml, slideHtml;
      pageHtml = (function() {
        var _i, _len, _ref, _results;
        _ref = this.converter.makeHtml(value).split("<hr />");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          slideHtml = _ref[_i];
          console.log(slideHtml);
          _results.push("<article>" + slideHtml + "</article>");
        }
        return _results;
      }).call(this);
      return $("#markup").html(pageHtml.join(''));
    };
    Controller.prototype.setLocation = function(hash, arg) {};
    return Controller;
  })();
  root = typeof exports !== "undefined" && exports !== null ? exports : window;
  root.Controller = Controller;
}).call(this);
