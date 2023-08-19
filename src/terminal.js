import { PubSub } from "./pubsub.js";
import { blue } from "./utils.js";


class Console {
    constructor(el, options = {}) {
        this.el = el;
        this.options = Object.assign({
            prefix: "> ",
            echo: true,
            newline: "\r\n"
        }, options);
        this.PubSub = new PubSub();
        this.history = [];
        this.history_index = 0;

        this.newline = this.options.newline;
        this.prefix = this.options.prefix;
        this.current_line = this.prefix;
        this.cache = "";

        this.terminal = new Terminal();
        this.terminal.open(select(this.el));
        this.write('R package "animate" ported to WebR.');
        this.write('\n');
        this.write(blue('The variables "device" and "io" are reserved. Please avoid writing to them.'));
        this.write(this.newline);
        this.write(this.prefix);


        // Enable hotkeys
        this.terminal.onKey(({ key, domEvent: ev }) => {
            if (ev.keyCode == 13) {  // Enter
                console.log("Enter: ", this.current_line);
                let command = this.current_line.slice(this.prefix.length);
                if (command.trim() == "") {
                    this.write(this.newline);
                    this.write(this.prefix);
                    this.current_line = this.prefix;
                    return;
                }
                this.history.push(command);
                this.history_index = this.history.length;
                this.PubSub.publish("input", command);
            } else if (ev.keyCode == 8) {  // Backspace
                if (this.current_line.length > this.prefix.length) {
                    this.current_line = this.current_line.slice(0, -1);
                    this.write("\b \b");
                }
            } // navigate history
            else if (ev.keyCode == 38 || ev.keyCode == 40) {
                if (this.history.length > 0) {
                    if (ev.keyCode == 38) {  // up
                        if (this.history_index > 0) {
                            this.history_index--;
                        } else {
                            return;
                        }
                    } else if (ev.keyCode == 40) {  // down
                        if (this.history_index < this.history.length - 1) {
                            this.history_index++;
                        } else {
                            return;
                        }
                    }
                    this.current_line = this.current_line.slice(0, this.prefix.length) +
                        this.history[this.history_index];
                    this.write("\x1b[2K\r");
                    this.write(this.current_line);
                }
            } // disable arrow keys
            else if (ev.keyCode == 37 || ev.keyCode == 39) {
            } // handle copy
            else if (ev.keyCode == 67 && ev.ctrlKey) {  // Ctrl+C
                ev.preventDefault();
                let selection = this.terminal.getSelection();
                if (selection) {
                    navigator.clipboard.writeText(selection)
                    // Check if copy succeeded
                    // .then(() => console.log('Text copied:', selection))
                    // .catch((error) => console.error('Copy failed:', error));
                } else {
                    this.PubSub.publish("interrupt");
                }
            } // handle paste
            else if (ev.keyCode == 86 && ev.ctrlKey) {  // Ctrl+V
                // console.log("paste");
                navigator.clipboard.readText()
                    .then(clipText => {
                        console.log(clipText);
                        this.paste(clipText);
                    })
            } else { // normal input
                this.current_line += key;
                this.write(key);
            }
        })
    }

    write(x) {
        x = x.replaceAll("\n", this.newline).replaceAll("\r\r", "\r")
        this.terminal.write(x);
    }

    paste(x) {
        this.write(x);
        this.current_line += x;
    }

    resizeRows(height) {
        let that = this;
        function fit_n_rows(height) {
            const cellHeight = that.terminal._core._renderService.dimensions.css.cell.height;
            return Math.floor(height / cellHeight);
        }
        let available_height = height ||
            parse_px(window.getComputedStyle(select(this.el)).height);
        let cols = this.terminal.cols;
        this.terminal.resize(cols, fit_n_rows(available_height))
    }

    resizeCols(width) {
        let that = this;
        function fit_n_cols(width) {
            const cellWidth = that.terminal._core._renderService.dimensions.css.cell.width;
            return Math.floor(width / cellWidth);
        }
        let available_width = width ||
            parse_px(window.getComputedStyle(select(this.el)).width);
        let nrows = this.terminal.rows;
        this.terminal.resize(fit_n_cols(available_width), nrows)
    }
}


class DebugConsole {
    constructor(options = {}) {
        this.options = Object.assign({
            prefix: "", echo: true, newline: null
        }, options);
        this.newline = this.options.newline;
        this.prefix = this.options.prefix;
        this.current_line = this.prefix;
    }

    write(x) {
        x && console.log(x);
    }
}


function writeResult({ type: type, data: output }) {
    this.write(this.newline);
    this.write(output);
    if (type == "prompt" && this.cache != "") {
        this.write(this.cache.slice(this.prefix.length));
        this.current_line = this.cache;
        this.cache = ""
        return;
    }
    this.current_line = output;
    return;
}

const select = (x, n = 0) => n == -1 ?
    document.querySelectorAll(x) :
    document.querySelectorAll(x)[n];

const parse_px = x => parseInt(x.replace("px", ""));


export {
    Console,
    DebugConsole,
    writeResult,
}
