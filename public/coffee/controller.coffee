class Controller
  constructor: ($, @hashify, @showdown) ->
    @md = $("#markdown")
    @converter = new showdown.converter
    
    controller = this
    @md.keyup ->
      if controller.lastEditorValue != controller.lastEditorValue = this.value
        controller.updateView(controller.lastEditorValue)

    @hashify.editor @md[0], false, @updateView
  
  updateView: (value) ->
    @render(value)
    @setLocation(@hashify.encode(value))
    @lastEditorValue = value
  
  render: (value) ->  
    pageHtml = for slideHtml in @converter.makeHtml(value).split("<hr />")
      console.log(slideHtml)
      "<article>#{slideHtml}</article>"
    $("#markup").html(pageHtml.join(''))

  setLocation: (hash, arg) ->

root = exports ? window
root.Controller = Controller