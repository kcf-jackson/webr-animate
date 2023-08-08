import { Console } from 'https://webr.r-wasm.org/latest/webr.mjs';

const select = (x, n = 0) => n == -1 ?
    document.querySelectorAll(x) :
    document.querySelectorAll(x)[n];


// var term = new Terminal();
//         term.open(document.getElementById('terminal'));
//         term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')



class Terminal {
    constructor(options) {
        this.el = options.el;
        this.dom = select(this.el);
        this.console = new Console({
            stdout: line => this.dom.append(line + '\n'),
            stderr: line => this.dom.append(line + '\n'),
            prompt: p => this.dom.append(p),
        });
        this.console.run();

        /* Write to the webR console using the ``stdin()`` method */
        let input = document.getElementById('input');
        globalThis.sendInput = () => {
            this.console.stdin(input.value);
            console.log(input);
            document.getElementById('out').append(input.value + '\n');
            input.value = "";
        }

        /* Send input on Enter key */
        input.addEventListener(
            "keydown",
            // Ctrl+Enter sends input
            (evt) => {
                if (evt.ctrlKey && evt.key === "Enter") globalThis.sendInput();
            }
        );


    }

    write() {
    }
}


export {
    Terminal
}
