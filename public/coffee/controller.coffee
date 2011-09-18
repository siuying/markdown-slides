class Controller
  constructor: ($, @hashify, @showdown, @prettyPrint) ->
    @editor = $("#markdown")
    @converter = new showdown.converter
    
    controller = this
    @editor.keyup ->
      if controller.lastEditorValue != controller.lastEditorValue = this.value
        controller.updateView(controller.lastEditorValue)
      return false

    @hashify.editor @editor[0], false, @editor[0].onkeyup
  
  updateView: (value) ->
    @render(value)
    @setLocation(@hashify.encode(value))
    @lastEditorValue = value
    false

  render: (value) ->  
    # Render markdown
    pageHtml = for slideHtml in @converter.makeHtml(value).split("<hr />")
      "<article>#{slideHtml}</article>"
    $("#markup").html(pageHtml.join(''))

    # Prettify Code
    $("#markup").find("code").addClass('prettyprint')
    prettyPrint()
    
  setLocation: (hash, arg) ->

root = exports ? window
root.Controller = Controller