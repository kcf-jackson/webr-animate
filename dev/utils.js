import { isRList } from 'https://webr.r-wasm.org/latest/webr.mjs';


async function is_JS_call({ result, output }) {
    if (!isRList(result)) {
        return Promise.resolve(false);
    }

    let x = await result.toObject({ depth: 0 });
    return Promise.resolve(Value(x).type == ".JS");
}


async function is_animate_call({ result, output }) {
    let is_JS = await is_JS_call({ result, output });
    if (!is_JS) {
        return Promise.resolve(false);
    }

    let x = await result.toObject({ depth: 0 });
    return Promise.resolve(Value(x).package == "animate");
}


/*
This function is needed to unpack the element returned by 'webr'.
At the moment, 'webr' returns a leaf node as an object with keys 'type', 'names' and 
'values'. For example, 2 is returned as {type: 'double', names: [], values: [2]}.
The function unpack the data for consumption by the animate function.
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
    is_JS_call,
    is_animate_call,
    Value
}
