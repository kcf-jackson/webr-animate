device$new(300, 300, id = "svg-1", root = "#plot")
attach(device)

id <- new_id(1:10)
print(id)

plot(1:10, 1:10, id = id)
event('#ID-5', 'click', print)
event('#plot', 'keydown', print)
