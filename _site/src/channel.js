import { PubSub } from './pubsub.js';

class Channel {
    constructor() {
        this.registry = [];
        this.PubSub = new PubSub();
    }

    on(from, event, { subscriber, callback }) {
        this.registry.push({ from, subscriber, event, callback });
        from.PubSub.subscribe(event, callback.bind(subscriber));
    }
}

export {
    Channel
}
