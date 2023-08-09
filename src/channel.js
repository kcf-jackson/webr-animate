class Channel {
    constructor() {
        this.registry = [];
    }

    on(from, event, { subscriber, callback }) {
        this.registry.push({ from, subscriber, event, callback });
        from.PubSub.subscribe(event, callback.bind(subscriber));
    }
}

export {
    Channel
}
