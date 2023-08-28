# Sokoban
source("engine.R")
source("render.R")

# Create the initial game board
game <- new.env()
game$board <- load_board("test_level.txt")
game$end_game <- FALSE
print(game$board)

# Initialise `animate`
# device <- animate::animate$new(500, 500)
device$new(500, 500, root = "#plot", id = "SVG-1")
attach(device)
draw_board(game$board)
add_reset_button()

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
  game$board <- load_board("test_level.txt")
  game$end_game <- FALSE
  draw_board(game$board)
  remove(id = "end-game")
  remove(id = "end-game-text")
})
