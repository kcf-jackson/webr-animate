# Game mechanics
# " ": Empty space
# "#": Obstacle or wall
# "P": Player
# "B": Box
# "T": Target spot

create_board <- function(width, height) {
  matrix(rep(" ", width * height), nrow = height, ncol = width)
}

load_board <- function(path) {
  lines <- readLines(path) |> 
    gsub(pattern = "_", replacement = " ") |> 
    strsplit("")
  w <- max(nchar(lines))
  if (!all(nchar(lines) == w)) {
    stop("Error: board must be rectanguler.")
  }
  do.call(rbind, lines)
}

load_database <- function(database, level = 1) {
  has_char <- \(x, c) c %in% strsplit(x, split = "")[[1]]
  replace_symbols <- function(lines) {
    result <- lines |>
      gsub(pattern = "@", replacement = "P", fixed = TRUE) |>
      gsub(pattern = "$", replacement = "B", fixed = TRUE) |>
      gsub(pattern = ".", replacement = "T", fixed = TRUE) |>
      strsplit(split = "")
    do.call(rbind, result)
  }
  db <- readLines(database)
  
  counter <- 0
  buffer <- c()
  for (line in db) {
    if (has_char(line, ";")) {
      if (counter == level) {
        return(replace_symbols(buffer))
      }
      counter <- counter + 1
      buffer <- c()
    } else {
      buffer <- c(buffer, line)
    }
  }
  return(replace_symbols(buffer))
}

get_player_position <- function(board) {
  player_position <- which(board == "P" | board == "TP", arr.ind = TRUE)
  list(x = player_position[2], y = player_position[1])
}

update_board <- function(board, direction) {
  player <- get_player_position(board)
  player_x <- player$x
  player_y <- player$y
  
  new_board <- board
  new_player_x <- player_x
  new_player_y <- player_y
  
  if (direction == "left") {
    new_player_x <- player_x - 1
  } else if (direction == "right") {
    new_player_x <- player_x + 1
  } else if (direction == "up") {
    new_player_y <- player_y - 1
  } else if (direction == "down") {
    new_player_y <- player_y + 1
  }
  # message(glue::glue("({player_x}, {player_y}) -> ({new_player_x}, {new_player_y})"))
  
  # Game logic
  is_valid_x <- \(x) 1 <= x && x <= ncol(board)
  is_valid_y <- \(y) 1 <= y && y <= nrow(board)
  
  # If the new position is invalid, do nothing and return the input position
  if (!is_valid_x(new_player_x) || !is_valid_y(new_player_y)) {
    return(board)
  } 
  
  # Now the position is valid
  cur_position <- board[player_y, player_x]
  new_position <- new_board[new_player_y, new_player_x]
  
  # If new position is wall, do nothing and return the input position
  if (new_position == "#") {
    return(board)
  }
  
  # If new position is space / target space, move there
  # - Need to handle the case in which player is currently on a target
  if (new_position %in% c(" ", "T")) {
    new_board[player_y, player_x] <- ifelse(cur_position == "TP", "T", " ")
    new_board[new_player_y, new_player_x] <- ifelse(new_position == " ", "P", "TP")
    return(new_board)  
  }
  
  # If new position is block
  if (new_position %in% c("B", "TB")) {
      # Calculate the new position of the box
      new_box_x <- new_player_x + (new_player_x - player_x)
      new_box_y <- new_player_y + (new_player_y - player_y)
      
      # Check if the new box position is valid before updating
      if (!is_valid_x(new_box_x) || !is_valid_y(new_box_y)) {
        return(board)
      }
      
      # Now the box position is valid
      cur_box_position <- new_position
      new_box_position <- new_board[new_box_y, new_box_x]
      
      # If the block is blocked by a wall or another block
      if (new_box_position %in% c("#", "B", "TB")) {
        return(board)
      }

      # Update the player old position, then box and player new position
      new_board[player_y, player_x] <- ifelse(cur_position == "TP", "T", " ")
      new_board[new_box_y, new_box_x] <- ifelse(new_box_position == "T", "TB", "B")
      new_board[new_player_y, new_player_x] <- ifelse(cur_box_position == "TB", "TP", "P")
  }
  
  return(new_board)
}

check_end_game <- function(board) {
  # game ends when all Ts are TBs.
  (sum(board == "T") + sum(board == "TP")) == 0
}

is_available <- function(x) {
  x != "#"
}
