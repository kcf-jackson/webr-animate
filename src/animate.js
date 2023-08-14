import { PubSub } from './pubsub.js';


class Animate {
    constructor(env) {
        this.env = env;
        this.device = animate.animate();
        this.pubsub = new PubSub();
        this.pubsub.subscribe('animate', (msg) => {
            console.log(msg);

            let ind = get_id(msg);
            this.get_data()
                .then(xs => xs[ind].toObject({ depth: 0 }))
                .then(x => Value(x))
                .then(log)
                .then(x => this.run(x))
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
            .then(x => x.toArray({ depth: 1 }));
    }

    run(x) {
        this.device.record(x);
        this.device.dispatch(x);
    }
}

const get_id = input => {
    const pattern = /-(\d+)"$/;
    const match = input.match(pattern);
    return match && parseInt(match[1]);
}


function catchAnimate(x) {  // x := {result, output, error}
    if (x.result) {
        console.log(x)
        x.output
            .filter(x => x.type == "stdout")
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
        if (obj.type == "character" || obj.type == "double" || obj.type == "integer" || obj.type == "logical") {
            return obj.values.length == 0 ? null :
                (obj.values.length == 1 ? obj.values[0] : obj.values);
        } else if (obj.type == "list") {
            let keys = obj.names;
            let values = obj.values;
            return keys.reduce((acc, key, i) => {
                acc[key] = Value(values[i]);
                return acc;
            }, {});
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


const log = (x) => {
    console.log(x);
    return x;
}


export {
    Animate,
    catchAnimate,
}
