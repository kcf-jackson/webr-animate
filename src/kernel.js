import { PubSub } from './pubsub.js';

class Kernel {
    constructor(webR, options) {
        this.webR = webR;
        this.PubSub = new PubSub();
        this.#run();
    }

    run(code) {
        return this.webR.writeConsole(code);
    }

    interrupt() {
        this.webR.interrupt();
    }

    async #run() {
        for (; ;) {
            const output = await this.webR.read();
            this.PubSub.publish('output', output);
        }
    };
}

export {
    Kernel
}
