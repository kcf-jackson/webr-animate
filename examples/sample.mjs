import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';
const webR = new WebR();
await webR.init();
console.log(webR);


import { Kernel } from '../src/kernel.js';
let kernel = new Kernel(webR);
// kernel.run("2+2", x => console.log(x));
// kernel.run("list(x = 1, y = 2)", console.log);
// kernel.run("x <- ", console.log);

import { Editor } from '../src/editor.js';
let editor = new Editor("body", { width: "400px", height: "200px" });


import { Console } from '../src/terminal.js';
let term = new Console("#terminal");


import { Channel } from '../src/channel.js';
let channel = new Channel();
// channel.on(editor, "submit", {
//     subscriber: term,
//     callback: function (code) {
//         this.stdin(code.trimEnd());
//     }
// })

channel.on(editor, "submit", {
    subscriber: kernel,
    callback: function (code) {
        this.run(code)
    }
})

channel.on(term, "input", {
    subscriber: kernel,
    callback: function ({ command, valid, invalid }) {
        this.run(command, valid, invalid)
    }
})


globalThis.kernel = kernel;
globalThis.editor = editor;
globalThis.term = term;
globalThis.channel = channel;
globalThis.webR = webR;
