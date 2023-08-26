# Source this file to start the game.
#
# See Original @ https://github.com/kcf-jackson/animate#13-2048
# Reference: https://play2048.co/
# Font: The "Minecraft" font is by NubeFonts @ https://www.fontspace.com/minecraft-ten-font-f40317
source("board_engine.R")
source("board_plot.R")
source("animate_effect.R")
w <- 600
h <- 700
device$new(w, h, id = "svg-1", root = "#plot")  # The element '#plot' is created for you.
attach(device)

board <- init_board(4)
print_board(board)

setup_board(board, w, h)
draw_board(board)
add_game_panel()

add_keyboard_control()  # Keyboard 'W','A','S','D' keys
