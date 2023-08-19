# webr x animate

This is an experiment to manually port the [animate](https://github.com/kcf-jackson/animate) R package to [webR](https://github.com/r-wasm/webr/).

The goal is to have a (partially) working version of the `animate` package in the browser until the original package can be compiled natively to WebAssembly and loaded by webR. This is a temporary solution, and not intended for production use.



## A fun example - Sokoban





## Notes


1. Interactive events work well, and it can be a lot of fun to play with!

    2048 example here with code link


    ### Usage

    The variable `io` is reserved for the webr-animate package to capture mouse and keyboard events. Here is a simple example:


    #### Mouse events

    ```
    # Setup device
    attach(device)
    new(400, 400, id = 'svg-1', root = '#plot')  # there is a div with id 'plot' in the HTML

    # Create the base plot
    par(xlim = c(0, 10), ylim = c(0, 10))  # use static range
    plot(1:10, 1:10, id = 1:10)

    # Update plot when clicked
    event('#plot', 'click', function(io) {  # the `io` argument must be present
        points(1:10, sample(10), id = 1:10, transition = TRUE)
    })
    ```


    #### Keyboard events

    Using the same example, you can listen for the "Enter" key press event instead of the mouse click event:


    ```
    # Setup device
    attach(device)
    new(400, 400, id = 'svg-1', root = '#plot')  # there is a div with id 'plot' in the HTML

    # Create the base plot
    par(xlim = c(0, 10), ylim = c(0, 10))  # use static range
    plot(1:10, 1:10, id = 1:10)

    # Update plot when "Enter" is pressed
    event('#plot', 'keypress', function(io) {  # the `io` argument must be present
        if (io$event$key == 'Enter') {
            points(1:10, sample(10), id = 1:10, transition = TRUE)
        }
    })
    ```


2. While the usage is the same, there are a couple of discrepancies between the original package and this port. In `webr-animate`, you initialise the device with:
    ```
    device$new(width = 600, height = 600, id = "svg-1", root = "#plot")
    attach(device)
    ```

    unlike the case in `animate`: 
    ```
    device <- animate$new(width = 600, height = 600, id = "svg-1", root = "#plot")
    attach(device)
    ```

    **Note that the `device` and the `io` variables are reserved**, so please do not write to them (though feel free to inspect them). 


3. Only keyframes animation is supported at the moment; frame-by-frame animation is not. 

    To my knowledge, there isn't a way to make a JavaScript call that accesses the global scope from the R code (as the code execution runs on the worker thread[Note 1]), and also it seems the JavaScript side cannot access the [binded variable](https://docs.r-wasm.org/webr/latest/convert-js-to-r.html#binding-objects-to-an-r-environment) while R is executing, so the data are locked until the end of the R execution. If anyone knows how to do any of the above, please open an issue and let me know. Thank you.

    [Note 1] I tried establishing a channel between the worker thread and the global using `postMessage` but failed. Also, for future reference, `eval_js` runs with its own scope.
