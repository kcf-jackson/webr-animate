# Device definition
device$Message <- function(type, message) {
  list(type = type, message = message)
}

device$send <- function(msg) {
  l <- length(device$data)
  device$data[[l + 1]] <- msg
  call_id <- gsub(msg$type, pattern = "fn_", replacement = "", fixed = TRUE)
  print(sprintf("animate::%s-%s", call_id, l))
}

device$data <- list()
device$event_handlers <- list()

# Drawing primitives
device$new_id <- function (x, prefix = "ID", sep = "-") {
    paste(prefix, seq_along(x), sep = sep)
}

device$new <- function(width = 800, height = 600, ...) {
  device$send(device$Message("fn_init_svg", list(width = width, height = height, ...)))
}

device$points <- function(x, y, ...) {
  device$send(device$Message("fn_points", list(x = x, y = y, ...)))
}

device$bars = function(x, y, w, h, ...) {
  device$send(device$Message("fn_bars", list(x = x, y = y, w = w, h = h, ...)))
}

device$objects = function(x, y, w, h, content, ...) {
  device$send(device$Message("fn_objects", list(x = x, y = y, w = w, h = h, content = content, ...)))
}

device$plot = function(x, y, type = "p", ...) {
  device$send(device$Message("fn_plot", list(x = x, y = y, type = type, ...)))
}

device$lines = function(x, y, ...) {
  device$send(device$Message("fn_lines", list(x = x, y = y, ...)))
}

device$abline = function(a, b, h, v, ...) {
  if (xor(missing(a), missing(b))) {
    stop("Error in abline: invalid a=, b= specification. a and b must be present/absent together.")
  }
  # General lines specified with intercept and slope
  if (!missing(a) && !missing(b)) {
    args <- list(x = c(0, 1), y = c(a, a + b), xlim = c(0, 1), ...)
    device$send(device$Message("fn_lines", args))
  }
  # Horizontal lines
  if (!missing(h)) {
    for (y_intercept in h) {
      args <- list(x = c(0, 1), y = rep(y_intercept, 2), xlim = c(0, 1), ...)
      device$send(device$Message("fn_lines", args))
    }
  }
  # Vertical lines
  if (!missing(v)) {
    for (x_intercept in v) {
      args <- list(x = rep(x_intercept, 2), y = c(0, 1), ylim = c(0, 1), ...)
      device$send(device$Message("fn_lines", args))
    }
  }
}

device$axis = function(x, ...) {
  device$send(device$Message("fn_axis", list(data = x, ...)))
}

device$text = function(x, y, labels, ...) {
  device$send(device$Message("fn_text", list(x = x, y = y, labels = labels, ...)))
}

device$image = function(href, width, height, ...) {
  device$send(device$Message("fn_image", list(href = href, width = width, height = height, ...)))
}

device$set = function(device_id) {
  device$send(device$Message("fn_set", list(device_id = device_id)))
}

device$par = function(...) {
  args <- list(...)
  if (is.null(names(args)) || any(names(args) == "")) {
    stop("All graphical parameters must be named.")
  }
  device$send(device$Message("fn_par", args))
}

device$remove = function(id = NULL, selector = "*") {
  device$send(device$Message("fn_remove", list(selector = selector, id = id)))
}

device$clear = function() {
  device$send(device$Message("fn_clear", list()))
}

device$delete = function(id = NULL) {
  device$send(device$Message("fn_delete", list(id = id)))
}

device$event = function(selector, event_type, callback) {
  event_name <- paste0(selector, ":", event_type)
  device$event_handlers[[event_name]] <- callback
  device$send(device$Message("fn_event", list(selector = selector, event = event_type, event_name = event_name)))
}


device$chain = function(callback) {
  # event_name <- paste0("chained-transition-", private$event_counter)
  # private$event_counter <- private$event_counter + 1
  device$event_handlers[[event_name]] <- callback
  param <- list(event = "end", event_name = event_name)
  param
}


device$unflattenObject <- function(flatObj) {  
  nested_env_to_list <- function(x) {
    if (!is.environment(x)) {
      return(x)
    } else {
      for (v in names(x)) {
        x[[v]] <- nested_env_to_list(x[[v]])
      }
      return(as.list(x))
    }
  }
  
  nestedObj <- new.env()
  
  for (key in names(flatObj)) {
    value <- flatObj[[key]]
    
    keys <- strsplit(key, '.', fixed = TRUE)[[1]]
    if (length(keys) == 1) {
      nestedObj[[key]] <- value
      next
    }
    
    current <- nestedObj
    for (i in seq_along(keys)) {i
      cur_key <- keys[i]
      if (i == length(keys)) {
        current[[cur_key]] <- value
      } else {
        if (!(cur_key %in% names(current))) {
          current[[cur_key]] <- new.env()
        }
        current <- current[[cur_key]]
      }
    }
  }
  
  return(nested_env_to_list(nestedObj))
}
# # Example flattened object
# flattened <- list(
#   "person.name.first" = "John",
#   "person.name.last" = "Doe",
#   "person.age" = 30,
#   "address.city" = "New York",
#   "address.zip" = "10001"
# )
# nested <- unflattenObject(flattened)
# print(flattened)
# print(nested)




# # Examples
# device$new(id = "svg-1", width = 500, height = 300, root = "#plot")
# attach(animate)

# x <- c(0.5, 1, 0.5, 0, -0.5, -1, -0.5, 0)
# y <- c(0.5, 0, -0.5, -1, -0.5, 0, 0.5, 1)
# id <- paste0("ID-", 1:8)
# plot(x, y, id = id)

# # Transition (basic)
# shuffle <- c(8, 1:7)
# plot(x[shuffle], y[shuffle], id = id, transition = TRUE)  # Use transition
