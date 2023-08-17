const blue = (x) => `\x1b[34m${x}\x1b[0m`;

const select = (x, n = 0) => n == -1 ?
    document.querySelectorAll(x) :
    document.querySelectorAll(x)[n];

const log = (x) => {
    console.log(x);
    return x;
}

const hide = x => x.style.display = "none";

const show = x => x.style.display = "block";

const text_to_dom = (x) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(x, "text/html");
    return doc.body.firstChild;
}


// This is needed because WebR v0.1.2 does not support conversion of nested objects
function flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                const nested = flattenObject(obj[key], newKey);
                Object.assign(flattened, nested);
            } else {
                flattened[newKey] = obj[key];
            }
        }
    }

    return flattened;
}
// Example
// const nestedObject = {
//     person: {
//         name: { first: 'John', last: 'Doe' },
//         age: 30
//     },
//     address: { city: 'New York', zip: '10001' }
// };
// const flattened = flattenObject(nestedObject);
// console.log(flattened);


export {
    hide, show,
    text_to_dom,
    select,
    blue,
    log,
    flattenObject,
}
