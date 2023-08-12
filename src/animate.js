import { PubSub } from './pubsub.js';

class Animate {
    constructor(env) {
        this.env = env;
        this.device = animate.animate();
        this.pubsub = new PubSub();
        this.pubsub.subscribe('animate', (msg) => {
            console.log(msg);
            this.get_data()
                .then(x => console.log(Value(x.message)))
        });
    }

    update(msg) {
        // console.log("Message received", msg);
        this.pubsub.publish('animate', msg);
    }

    get_data() {
        return this.env
            .toJs({ depth: 1 })
            .then(x => x.values[x.names.indexOf('data')])
            .then(x => x.toJs({ depth: 0 }));
    }

    run(x) {
        this.device.record(x);
        this.device.dispatch(x);
    }
}


function catchAnimate(x) {  // x := {result, output, error}
    if (x.result) {
        x.output
            .map(x => x.data)
            .filter(x => x.includes('animate::'))
            .forEach(x => this.update(x));
    }
    return x;  // continuation
}


/*
This function is needed to unpack the element returned by 'webr'.
'webr' currently returns a leaf node as an object with keys 'type', 'names' and 
'values'. For example, 2 is returned as {type: 'double', names: [], values: [2]}.
The function unpacks the data for consumption by the animate function.
*/
const Value = (obj) => {
    // If Array, loop through and convert each element
    if (Array.isArray(obj)) {
        return obj.map(Value);
    }

    // if Object, loop through and convert each value
    if (typeof obj === 'object' && obj !== null) {
        // if it has keys 'type', 'names' and 'values', then extract the values
        if (obj.hasOwnProperty('type') && obj.hasOwnProperty('names') && obj.hasOwnProperty('values')) {
            return obj.values.map(Value);
        } else {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = Value(obj[key]);
                return acc;
            }, {});
        }
    }

    // Otherwise, return as is
    return obj;
}


export {
    Animate,
    catchAnimate,
}
