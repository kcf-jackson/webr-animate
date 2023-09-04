# Run this script at where it is stored
tgz_file <- fire::CLI_VAR("jsonlite_1.8.7.tgz", "tgz")
filename <- tools::file_path_sans_ext(basename(tgz_file))
filename <- strsplit(filename, split = "_")[[1]]
pkg_name <- filename[1]
version <- filename[2]
message("Processing package: ", pkg_name, " version: ", version)

untar(tgz_file)
file_list <- list.files(pkg_name, recursive = TRUE, full.names = FALSE)
jsonlite::write_json(file_list, paste0(pkg_name, ".json"))
