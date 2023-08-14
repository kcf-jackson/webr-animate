const blue = (x) => `\x1b[34m${x}\x1b[0m`;

const log = (x) => {
    console.log(x);
    return x;
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
//         name: {
//             first: 'John',
//             last: 'Doe'
//         },
//         age: 30
//     },
//     address: {
//         city: 'New York',
//         zip: '10001'
//     }
// };
//
// const flattened = flattenObject(nestedObject);
// console.log(flattened);

export {
    blue,
    log,
    flattenObject,
}
