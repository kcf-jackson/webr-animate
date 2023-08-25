const blue = (x) => `\x1b[34m${x}\x1b[0m`;
const hide = x => x.style.display = "none";
const show = x => x.style.display = "block";

const select = (x, n = 0) => n == -1 ?
    document.querySelectorAll(x) :
    document.querySelectorAll(x)[n];

const log = (x) => {
    console.log(x);
    return x;
}

const text_to_dom = (x) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(x, "text/html");
    return doc.body.firstChild;
}

function saveTextToFile(text, filename) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle function
function throttle(func, limit) {
    let lastCallTime = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCallTime >= limit) {
            func.apply(this, args);
            lastCallTime = now;
        }
    };
}


export {
    hide, show,
    text_to_dom,
    select,
    blue,
    log,
    saveTextToFile,
    flattenObject,
    debounce,
    throttle
}
