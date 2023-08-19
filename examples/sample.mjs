import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';
const webR = new WebR();
await webR.init();
console.log(webR);


import { Kernel } from '../src/kernel.mjs';
let kernel = new Kernel(webR);


import { Editor, IntegratedEditor } from '../src/editor.js';
// let editor = new Editor("#editor", { width: "900px", height: "300px" });
let ieditor = new IntegratedEditor("#editor");
// let editor = ieditor.editor;


import { Console, writeResult } from '../src/terminal.js';
let term = new Console("#terminal", { echo: false });
term.terminal.resize(80, 16);
term.resizeRows();


import { Channel } from '../src/channel.js';
let channel = new Channel();


import { Animate, catchAnimate } from '../src/animate.js';
let device = new Animate(await new webR.REnvironment({}));
await webR.objs.globalEnv.bind('device', device.env);


import { blue } from '../src/utils.js'


channel.on(ieditor, "source-file", {
    subscriber: kernel,
    callback: function ({ filename, content: code }) {
        let cterm = term;
        // Handle non-empty current line
        cterm.cache = cterm.current_line;
        cterm.write('\x1b[2K\r');
        cterm.write(cterm.prefix);
        cterm.write('source("~/.active-document")');
        this.run(code);
    }
})

channel.on(term, "interrupt", {
    subscriber: kernel,
    callback: function () {
        this.interrupt();
    }
})

channel.on(term, "input", {
    subscriber: kernel,
    callback: function (code) {
        this.run(code);
    }
})

channel.on(kernel, "output", {
    subscriber: term,
    callback: function (output) {
        switch (output.type) {
            case 'stdout':
            case 'stderr':
            case 'prompt':
                let new_output = catchAnimate.bind(device)(output);
                new_output && writeResult.bind(this)(new_output);
                break;
            default:
                console.warn(`Unhandled output type: ${output.type}.`);
        }
    }
})

channel.on(device, "on-event", {
    subscriber: kernel,
    callback: function (code) {
        let cterm = term, cache;  // dterm;
        // Handle non-empty current line
        cache = cterm.current_line.slice(cterm.prefix.length);
        cterm.write('\x1b[2K\r');
        cterm.write(cterm.prefix);
        cterm.write(cterm.newline);
        cterm.write(blue('Web browser event triggered.'));
        this.run(code);
    }
})


// Define the animate bridging functions
fetch('../package/R/webr-animate.R')
    .then(response => response.text())
    .then(x => x.replaceAll("\r\n", "\n"))
    .then(text => webR.evalR(text))

// fetch('../package/R/webr-example.R')
//     .then(response => response.text())
//     .then(x => x.replaceAll("\r\n", "\n"))
//     .then(text => editor.editor.insert(text))


// Resize terminal and editor on window resize
window.addEventListener('resize', () => {
    term.resizeRows();
    ieditor.resizeRows();
});




globalThis.kernel = kernel;
globalThis.ieditor = ieditor;
// globalThis.editor = editor;
globalThis.term = term;
globalThis.channel = channel;
globalThis.webR = webR;
globalThis.device = device;


// Utility functions
const inspect = x => x.toJs().then(console.log);
globalThis.inspect = inspect;
