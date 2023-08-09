import { isRList } from 'https://webr.r-wasm.org/latest/webr.mjs';
import { PubSub } from "./pubsub.js";

class Kernel {
    constructor(webR, options) {
        this.webR = webR;
        this.shelter = new webR.Shelter();
        this.options = Object.assign({
            captureConditions: true,
            captureStreams: true,
            withAutoprint: true
        }, options)

        this.PubSub = new PubSub();

        // this.buffer = "";
        // this.read().then(console.log);
    }

    run(code, resolve = console.log, reject = error_handler) {
        this.shelter.then(shelter => {
            console.log("Executing:", code);
            shelter.captureR(code, this.options)
                .then(code_result => {
                    let { result, output } = code_result;

                    if (isRList(result)) {
                        return result.toObject({ depth: 0 })
                            .then(x => resolve({ result: Value(x), output: output }))
                    }

                    return result.toJs()
                        .then(x => resolve({ result: Value(x), output: output }))
                        .catch(error => resolve({ result: result, output: output }))
                })
                .catch(error => {
                    reject(error);
                })
        })
    }

    interrupt() {
        this.webR.interrupt();
    }

    // read() {
    //     // console.log("Enter");
    //     this.buffer = "";

    //     let readUntilPrompt = output => {
    //         // console.log("Reading");
    //         this.buffer += output.data + "\n";
    //         if (output && output.type != "prompt") {
    //             return this.webR.read().then(readUntilPrompt, readComplete);
    //         } else {
    //             return readComplete();
    //         }
    //     }

    //     let readComplete = () => {
    //         // console.log("Read complete.");
    //         return this.buffer;
    //     }

    //     return this.webR.read()
    //         .then(readUntilPrompt, readComplete)
    //         .catch(error => console.log("An error has occurred while reading the output.", error));
    // }
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


const error_handler = (error) => {
    console.log("Error: " + error.message);
    return error;
}


export {
    Kernel
}
