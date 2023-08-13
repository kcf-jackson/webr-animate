animate$Message <- function(type, message) {
  list(type = type, message = message)
}
animate$send <- function(msg) {
  print(msg)
}
animate$data <- list()
animate$svg <- function(width = 800, height = 600, ...) {
  msg <- animate$Message("fn_init_svg", list(width = width, height = height, ...))
  l <- length(animate$data)
  animate$data[[l + 1]] <- msg
  animate$send(paste("animate::svg", l, sep = "-"))
}
animate$points <- function(x, y, ...) {
  msg <- animate$Message("fn_points", list(x = x, y = y, ...))
  l <- length(animate$data)
  animate$data[[l + 1]] <- msg
  animate$send(paste("animate::points", l, sep = "-"))
}
animate$svg(id = "svg-1", width = 500, height = 300, root = "#plot")
animate$points(1:10, 1:10)

# for (i in 1:3) {
#   animate$points(1:3, 1:3 + i)
# }


device <- animate()

library(animate)
device <- animate$new(width = 500, height = 300)  # takes ~0.5s
device$plot(1:10, 1:10)
device$points(1:10, 10 * runif(10), bg = "red")
device$lines(1:100, sin(1:100 / 10 * pi / 2))
device$clear()


# Workflow
# Initialisation
# - JS initiate device
# - R initiate device reference
# Plotting 
# - R calls save data and announce message
# - Message are watched
# - 