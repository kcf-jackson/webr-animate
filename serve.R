library(httpuv)

mjs_handler <- function(req) {
  # message("Handling mjs")
  # print(names(req))
  path <- req$PATH_INFO
  file_path <- file.path(".", path)
  if (file.exists(file_path)) {
    file_content <- readLines(file_path, warn = FALSE)
    response <- list(
      status = 200,
      headers = list("Content-Type" = "application/javascript"),
      body = paste(file_content, collapse = "\n")
    )
  } else {
    response <- response <- list(
      status = 404,
      headers = c("Content-Type" = "text/plain"),
      body = "Not Found"
    )
  }
  return(response)
}

runServer(host = "127.0.0.1", port = 8080,
  app = list(
    call = mjs_handler,
    staticPaths = list(
      "/" = staticPath(
        ".",
        headers = list(
          "Cross-Origin-Opener-Policy" = "same-origin",
          "Cross-Origin-Embedder-Policy" = "require-corp"
        )
      ),
      "/examples/main.mjs" = excludeStaticPath()
    )
  )
)
