import { PubSub } from "./pubsub.js";
import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

class Console {
    constructor(el, options) {
        this.el = el;
        this.options = options;
        this.PubSub = new PubSub();

        this.terminal = new Terminal();
        this.terminal.open(select(this.el));
        this.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
        this.write('\n> ')
        this.current_line = "> ";

        this._webR = new WebR().init();

        // Enable hotkeys
        this.terminal.onKey(({ key, domEvent: ev }) => {
            if (ev.keyCode == 13) {  // Enter
                let command = this.current_line.slice(2);
                let that = this;
                this.PubSub.publish("input", {
                    command: command,
                    valid: (code_result) => {
                        let { result, output } = code_result;
                        console.log(result);

                        if (output.length == 0) {
                            that.write("\n> ");
                            that.current_line = "> ";
                            return;
                        }

                        output.forEach(x => {
                            that.write("\n");
                            that.write(x.data.trimEnd());
                        });
                        that.write("\n> ");
                        that.current_line = "> ";
                    },
                    invalid: (error) => {
                        if (error.message.includes("unexpected end of input")) {
                            that.current_line += "\n";
                            that.write("\n+ ");
                            return;
                        }

                        if (error.message.includes("unexpected")) {
                            that.current_line = "> ";
                            that.write("\n");
                            that.write(error.message.replace("<text>:", "Error: "));
                            that.write("\n> ");
                            return;
                        }

                        that.current_line = "> ";
                        that.write("\n");
                        that.write("Error: " + error.message);
                        that.write("\n> ");
                    }
                })
            } else if (ev.keyCode == 8) {  // Backspace
                if (this.current_line.length > 2) {
                    this.current_line = this.current_line.slice(0, -1);
                    this.write("\b \b");
                }
            } else if (ev.keyCode == 37 || ev.keyCode == 38 || ev.keyCode == 39 || ev.keyCode == 40) {
            } else {
                this.current_line += key;
                this.write(key);
            }
        })

        this.terminal.textarea.addEventListener('paste', (ev) => {
            let data = ev.clipboardData.getData('text/plain');
            this.stdin(data);
        })
    }

    // stdin(x) {
    //     let lines = x.split("\n");

    //     if (lines.length == 1 && lines[0] == x) {
    //         this.current_line += x;
    //         this.write(x);
    //         return;
    //     }

    //     lines.forEach(command => {
    //         this.current_line += command;
    //         this.write(command);
    //         let that = this;
    //         this.PubSub.publish("input", {
    //             command: command,
    //             valid: (result) => {
    //                 that.current_line = "> ";
    //                 that.write("\n> ");
    //                 that.stdin(result);
    //             },
    //             invalid: () => {
    //                 that.current_line += "\n";
    //                 that.write("\n+ ");
    //             }
    //         })
    //     })
    // }

    write(x) {
        x = x.replaceAll("\n", "\r\n");
        this.terminal.write(x);
    }
}


const select = (x, n = 0) => n == -1 ?
    document.querySelectorAll(x) :
    document.querySelectorAll(x)[n];


export {
    Console
}
