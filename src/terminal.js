import { PubSub } from "./pubsub.js";
import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';


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

        this.terminal = new Terminal();
        this.terminal.open(select(this.el));
        this.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')


        // prefix for new lines
        this.newline = this.options.newline;
        this.prefix = this.options.prefix;
        this.write(this.newline);
        this.write(this.prefix);
        this.current_line = this.prefix;


        // Enable hotkeys
        this.terminal.onKey(({ key, domEvent: ev }) => {
            if (ev.keyCode == 13) {  // Enter
                let command = this.current_line.slice(this.prefix.length);
                this.PubSub.publish("input", command);
            } else if (ev.keyCode == 8) {  // Backspace
                if (this.current_line.length > this.prefix.length) {
                    this.current_line = this.current_line.slice(0, -1);
                    this.write("\b \b");
                }
            } else if (ev.keyCode == 37 || ev.keyCode == 38 ||
                ev.keyCode == 39 || ev.keyCode == 40) {
            } else {
                this.current_line += key;
                this.write(key);
            }
        })

        // Enable paste
        this.terminal.textarea.addEventListener('paste', (ev) => {
            let data = ev.clipboardData.getData('text/plain');
            // this.write(data);
        })
    }

    write(x) {
        this.terminal.write(x);
    }

    paste(x) {

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


function echoInput(input) {
    if (this.options.echo) {
        this.write(input);
        this.write(this.newline);
        this.write(this.prefix);
        this.current_line = this.prefix;
    }
}


function writeResult(exec_result) {
    let { result, output } = exec_result;
    // console.log(result);

    if (output.length == 0) {
        this.write(this.newline);
        this.write(this.prefix);
        this.current_line = this.prefix;
        return;
    }

    output.forEach(x => {
        this.write(this.newline);
        this.write(x.data.trimEnd());
    });
    this.write(this.newline);
    this.write(this.prefix);
    this.current_line = this.prefix;
}


function writeError(error) {
    if (error.message.includes("unexpected end of input")) {
        this.current_line += "\n";
        this.write(this.newline);
        this.write("+ ");
        return;
    }

    if (error.message.includes("unexpected")) {
        this.current_line = this.prefix;
        this.write(this.newline);
        this.write(error.message.replace("<text>:", "Error: "));
        this.write(this.newline);
        this.write(this.prefix);
        return;
    }

    this.current_line = this.prefix;
    this.write(this.newline);
    this.write("Error: " + error.message);
    this.write(this.newline);
    this.write(this.prefix);
}


const select = (x, n = 0) => n == -1 ?
    document.querySelectorAll(x) :
    document.querySelectorAll(x)[n];


export {
    Console,
    DebugConsole,
    writeResult,
    writeError,
    echoInput,
}
