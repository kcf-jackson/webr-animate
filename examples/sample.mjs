import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';
const webR = new WebR();
await webR.init();
console.log(webR);


import { Kernel } from '../src/kernel.js';
let kernel = new Kernel(webR);
kernel.run("2+2", x => console.log(x));
kernel.run("list(x = 1, y = 2)", console.log);


import { Editor } from '../src/editor.js';
let editor = new Editor();


import { Terminal } from '../src/terminal.js';
let terminal = new Terminal({ el: "#terminal" });
