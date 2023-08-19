import { PubSub } from './pubsub.js';
import { log, flattenObject } from './utils.js';

class Animate {
    constructor(env, io) {
        this.env = env;
        this.device = animate.animate();
        let root = this;
        this.device.event = (param) => {
            console.log("Setting up event listener: " + param.event_name)
            d3.selectAll(param.selector)
                .on(param.event, function (d) {
                    let result = {
                        type: "user_event",
                        param: param,
                        data: d,
                        event: getEventData(d3.event),
                        keyCode: d3.event.keyCode,
                        mouse: d3.mouse(this)
                    };
                    // console.log(result);
                    (new webR.RList(flattenObject(result)))
                        .then(x => webR.objs.globalEnv.bind('io', x))
                        .then(() => webR.evalR('io = device$unflattenObject(io)'))
                        .then(() => {
                            let code = `device$event_handlers[["${param.event_name}"]](io)`;
                            root.PubSub.publish('on-event', code);
                        });
                    return true;
                })
        }
        this.PubSub = new PubSub();
        this.PubSub.subscribe('animate', (msg) => {
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
        this.PubSub.publish('animate', msg);
    }

    get_data() {
        return this.env
            .toJs({ depth: 1 })
            .then(x => x.values[x.names.indexOf('data')])
            .then(x => x.toArray({ depth: 1 }));
    }

    run(x) {
        x = JSON.parse(JSON.stringify(x), remap_args);
        this.device.record(x);
        this.device.dispatch(x);
    }
}

const get_id = input => {
    const pattern = /-(\d+)"$/;
    const match = input.match(pattern);
    return match && parseInt(match[1]);
}


function getEventData(event) {
    if (event instanceof PointerEvent) {
        return getPointerEventData(event);
    }
    if (event instanceof KeyboardEvent) {
        return getKeyboardEventData(event);
    }
    console.error("Unknown event type: " + event);
}

function getPointerEventData(event) {
    return {
        class: "PointerEvent",
        type: event.type,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        pageX: event.pageX,
        pageY: event.pageY,
        button: event.button,
        buttons: event.buttons,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
    };
}

function getKeyboardEventData(event) {
    return {
        class: "KeyboardEvent",
        type: event.type,
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        charCode: event.charCode,
        location: event.location,
        repeat: event.repeat,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
    };
}


function catchAnimate(x) {  // x := output
    // console.log(x);
    if (x.type == "stdout" && x.data.includes('animate::')) {
        this.update(x.data);
        return null;
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
            if (!keys) return {};

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


function remap_args(k, v) {
    if (k == "pch") { this["shape"] = v }
    else if (k == "col") { this["stroke"] = v }
    else if (k == "bg") { this["fill"] = v }
    else if (k == "cex") { this["size"] = v }
    else if (k == "lwd") { this["stroke-width"] = v }
    else if (k == "lty") { this["stroke-dasharray"] = v }
    else if (k == "lend") { this["stroke-linecap"] = v }
    else if (k == "ljoin") { this["stroke-linejoin"] = v }
    else if (k == "lmitre") { this["stroke-miterlimit"] = v }
    else if (k == "labels") { this["text"] = v }
    else { return (v) }
}


export {
    Animate,
    catchAnimate,
}
