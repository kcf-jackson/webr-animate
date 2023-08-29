# Sokoban
source("engine.R")
source("render_alt.R")  # uses game assets by Kenney Vleugels (Kenney.nl) under CC0.

# Create the initial game board
game <- new.env()
game$level <- 1
game$board <- load_database("database.txt", level = game$level)
game$background <- background(game$board)
game$end_game <- FALSE
print(game$board)

# Initialise `animate`
# device <- animate::animate$new(500, 500)
device$new(500, 500, root = "#plot", id = "SVG-1")
attach(device)
draw_background(game$background)
draw_board(game$board)
add_reset_button()
add_level_button()

# Set up WASD control
event("#plot", "keydown", function(evt) {
  if (!game$end_game) {
    if (evt$keyCode == 87) move <- "up"
    if (evt$keyCode == 83) move <- "down"
    if (evt$keyCode == 65) move <- "left"
    if (evt$keyCode == 68) move <- "right" 
    game$board <- update_board(game$board, move)
    draw_board(game$board)
    if (check_end_game(game$board)) {
      end_game()
      game$end_game <- TRUE
    }
  }
})

event("#reset-text", "click", function(evt) {
  game$board <- load_database("database.txt", level = game$level)
  game$background <- background(game$board)
  game$end_game <- FALSE
  draw_background(game$background)
  draw_board(game$board)
  remove(id = "end-game")
  remove(id = "end-game-text")
})

event("#level-text", "click", function(evt) {
  game$level <- sample(1000, 1)
  game$board <- load_database("database.txt", level = game$level)
  game$background <- background(game$board)
  game$end_game <- FALSE
  draw_background(game$background)
  draw_board(game$board)
  remove(id = "end-game")
  remove(id = "end-game-text")
})
