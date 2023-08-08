import { isRList } from 'https://webr.r-wasm.org/latest/webr.mjs';


class Kernel {
    constructor(webR) {
        this.webR = webR;
        this.shelter = new webR.Shelter();
    }

    run(code, callback) {
        console.log("run:", code);
        // Send code to R kernel
        this.shelter.then(shelter => {
            shelter.captureR(code).then(code_result => {
                const { result, output } = code_result;
                if (isRList(result)) {  // Extract value from webR RObject
                    result
                        .toObject({ depth: 0 })
                        .then(R_obj => {
                            let JS_obj = toObject(R_obj);
                            return callback(JS_obj);
                        })
                } else {
                    result.toJs().then(callback);  // Default
                }
            })
        })
    }
}


/*
This function is needed to unpack the element returned by 'webr'.
At the moment, 'webr' returns a leaf node as an object with keys 'type', 'names' and 
'values'. For example, 2 is returned as {type: 'double', names: [], values: [2]}.
The function unpack the data for consumption by the animate function.
*/
const toObject = (obj) => {
    // If Array, loop through and convert each element
    if (Array.isArray(obj)) {
        return obj.map(toObject);
    }

    // if Object, loop through and convert each value
    if (typeof obj === 'object' && obj !== null) {
        // if it has keys 'type', 'names' and 'values', then extract the values
        if (obj.hasOwnProperty('type') && obj.hasOwnProperty('names') && obj.hasOwnProperty('values')) {
            return obj.values.map(toObject);
        } else {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = toObject(obj[key]);
                return acc;
            }, {});
        }
    }

    // Otherwise, return the value
    return obj;
}


export {
    Kernel
}
