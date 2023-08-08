new_animate <- function() {
  Message <- function(type, message) {
    list(package = "animate", type = type, message = message)
  }
  send <- print
  svg <- function(width = 800, height = 600, ...) {
    send(Message("fn_init_svg", list(width = width, height = height, ...)))
  }
  structure(
    list(
      event_handlers = list(),
      svg = svg
    ),
    class = "animate"
  )
}
