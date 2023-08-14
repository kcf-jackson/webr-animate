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
        this.linebreak = -1;

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
                let command = this.current_line.slice(this.prefix.length);
                if (command.trim() == "") {
                    this.write(this.newline);
                    this.write(this.prefix);
                    this.current_line = this.prefix;
                    return;
                }
                if (this.linebreak >= 0) {
                    let new_part_only = this.current_line.slice(this.linebreak);
                    console.log(new_part_only);
                    this.linebreak = -1;
                    this.history.push(new_part_only);
                } else {
                    this.history.push(command);
                }
                this.history_index = this.history.length;
                // console.log(this.history);
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
                    this.current_line = (this.linebreak >= 0 ? "+ " : this.prefix) +
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
                }
            } // handle paste
            else if (ev.keyCode == 86 && ev.ctrlKey) {  // Ctrl+V
                // console.log("paste");
                navigator.clipboard.readText()
                    .then(clipText => {
                        console.log(clipText);
                        this.paste(clipText);
                    })
            } else {
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

    output = group("message")(output);
    output = group("stdout")(output);
    output = group("stderr")(output);
    // console.log(output);

    output.forEach(x => {
        this.write(this.newline);
        switch (x.type) {
            case "stdout":
            case "stderr":
                let text = x.data.map(x => x.trimEnd()).join("\n");
                writeOutputBlock.bind(this)(text);
                break;
            case "message":
                // console.log(x.data);
                Promise.all(x.data.map(extractMessage))
                    .then(xs => xs.join("\n\n"))
                    .then(x => writeOutputBlock.bind(this)(x))
                break;
            default:
                console.warn(`Unhandled output type: ${output.type}.`);
        }
    });

    function group(messageType) {
        return output => {
            let grouped_output = [];
            let message_group = { type: messageType, data: [] };
            output.forEach(x => {
                if (x.type == messageType) {
                    message_group.data.push(x.data);
                } else {
                    if (message_group.data.length > 0) {
                        grouped_output.push(message_group);
                        message_group = { type: messageType, data: [] };
                    }
                    grouped_output.push(x);
                }
            });
            if (message_group.data.length > 0) {
                grouped_output.push(message_group);
            }
            return grouped_output;
        }
    }

    async function extractMessage(x) {
        let x_obj = await x.toObject({ depth: 1 }),
            x_msg = x_obj.message,
            x_js = await x_msg.toJs({ depth: 0 }),
            x_val = x_js.values[0].trimEnd();
        return x_val;
    }

    function writeOutputBlock(x) {
        this.write(x);
        this.write(this.newline);
        this.write(this.prefix);
        this.current_line = this.prefix;
    }
}


function writeError(error) {
    if (error.message.includes("unexpected end of input")) {
        this.current_line += "\n";
        (typeof this.linebreak == 'number') && (this.linebreak = this.current_line.length);
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
