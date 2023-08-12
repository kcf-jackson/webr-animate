import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';
const webR = new WebR();
await webR.init();
console.log(webR);


import { Kernel } from '../src/kernel.mjs';
let kernel = new Kernel(webR);


import { Editor } from '../src/editor.js';
let editor = new Editor("#editor", { width: "900px", height: "300px" });


import { Console, DebugConsole, writeResult, writeError, echoInput } from '../src/terminal.js';
let term = new Console("#terminal", { echo: false });
// let dterm = new DebugConsole();


import { Channel } from '../src/channel.js';
let channel = new Channel();


import { Animate, catchAnimate } from '../src/animate.js';
let device = new Animate(await new webR.REnvironment({}));
await webR.objs.globalEnv.bind('animate', device.env);


channel.on(editor, "submit", {
    subscriber: kernel,
    callback: function (code) {
        let cterm = term, cache;
        // Handle non-empty current line
        cterm.write('\x1b[2K\r');
        cterm.write(cterm.prefix);
        cterm.write('source("~/.active-document")');
        cache = cterm.current_line.slice(cterm.prefix.length);

        // console.log(JSON.stringify(code));
        this.run(code)
            .then(catchAnimate.bind(device))
            .then(writeResult.bind(cterm))
            .catch(writeError.bind(cterm))
            .finally(() => {
                cterm.current_line = cterm.prefix + cache;
                cterm.write(cache)
            });
    }
})

channel.on(term, "input", {
    subscriber: kernel,
    callback: function (code) {
        let cterm = term;  // dterm;
        echoInput.bind(cterm)(code);

        this.run(code)
            .then(writeResult.bind(cterm))
            .catch(writeError.bind(cterm));
    }
})




globalThis.kernel = kernel;
globalThis.editor = editor;
globalThis.term = term;
globalThis.channel = channel;
globalThis.webR = webR;
globalThis.device = device;


// Utility functions
const inspect = x => x.toJs().then(console.log);
globalThis.inspect = inspect;
