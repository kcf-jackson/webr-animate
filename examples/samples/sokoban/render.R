# 'animate' plotting functions
draw_board <- function(x) {
  g0 <- expand.grid(1:nrow(x), 1:ncol(x))
  bars(g0[,2], 1 + ncol(x) - g0[,1], bg = color_map(x), w = 1, h = 1, id = 1:nrow(g0))
}

color_map <- function(x) {
  legend <- c(" " = "lightgray", "#" = "darkgray", "P" = "yellow", "TP" = "lightyellow", 
              "B" = "brown", "T" = "darkgreen", "TB" = "darkred")
  as.vector(legend[as.vector(x)])
}

end_game <- function() {
  fade(bars, 0, 0.73)(1, 1, 5, 5, id = "end-game", bg = "#eee4da")
  text(x = 0.2, y = 0.5, "You won!", id = "end-game-text", 
       xlim = c(0, 1), ylim = c(0, 1), style = list("font-size" = "60px", "font-family" = "Minecraft"))
}

add_reset_button <- function() {
  par(xlim = c(0, 5), ylim = c(0, 5))
  bars(0, 5.05, 0.8, 0.3, id = "reset-btn", bg = "#eee4da",
       style = list("stroke" = "black", "stroke-width" = "1px", "cursor" = "pointer"))
  text(x = 0.05, y = 5.1, "Reset", id = "reset-text",
       style = list("font-size" = "20px", "font-family" = "Minecraft", "cursor" = "pointer", "user-select" = "none"))
  par(xlim = NULL, ylim = NULL)
}

add_level_button <- function() {
  par(xlim = c(0, 5), ylim = c(0, 5))
  bars(0.85, 5.05, 1.725, 0.3, id = "level-btn", bg = "#eee4da",
       style = list("stroke" = "black", "stroke-width" = "1px", "cursor" = "pointer"))
  text(x = 0.9, y = 5.1, "Random Level", id = "level-text",
       style = list("font-size" = "20px", "font-family" = "Minecraft", "cursor" = "pointer", "user-select" = "none"))
  par(xlim = NULL, ylim = NULL)
}


# Custom animation
custom_transition <- function(f, from, to) {
  function(...) {
    attr <- names(from)
    # From
    args <- list(...)
    args$transition <- NULL
    args[[attr]] <- append(from[[attr]], args[[attr]])
    do.call(f, args)
    # To
    args <- list(...)
    if (is.null(args$transition)) {
      args$transition <- TRUE
    }
    args[[attr]] <- append(to[[attr]], args[[attr]])
    do.call(f, args)
  }
}

fade <- function(f, from = 0, to = 1) {
  custom_transition(f,
                    from = list(style = list(opacity = from)),
                    to = list(style = list(opacity = to)))
}
