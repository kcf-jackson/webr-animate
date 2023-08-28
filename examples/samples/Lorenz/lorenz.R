# Lorenz system
# source: https://kcf-jackson.github.io/animate/

device$new(600, 600, root = "#plot", id = "SVG-1")
attach(device)
clear()  # in case you are running the file multiple times

# Set up the Lorenz system
sigma <- 10
beta <- 8 / 3
rho <- 28
x <- y <- z <- 1
xs <- x
ys <- y
zs <- z
dt <- 0.015

for (i in 1:2000) {
  # Euler's method
  dx <- sigma * (y - x) * dt
  dy <- (x * (rho - z) - y) * dt
  dz <- (x * y - beta * z) * dt
  x <- x + dx
  y <- y + dy
  z <- z + dz
  xs <- c(xs, x)
  ys <- c(ys, y)
  zs <- c(zs, z)

  # Plot the x-y solution plane
  par(xlim = c(-30, 30), ylim = c(-30, 40))  # Use static range
  plot(x, y, id = "moving-pt")
  lines(xs, ys, id = "trajectory")
  Sys.sleep(0.025)
}

# Change to x-z solution plane
plot(x, z, id = "moving-pt", xlim = c(-30, 30), ylim = range(zs), transition = TRUE)
lines(xs, zs, id = "trajectory", xlim = c(-30, 30), ylim = range(zs), transition = TRUE)
