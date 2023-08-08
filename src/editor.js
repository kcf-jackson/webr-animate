class Editor {
    constructor(el, options) {
        this.el = el;
        this.options = Object.assign({ width: "400px", height: "200px" }, options)
        this.id = "editor-" + uid();

        // Create a div element to hold the editor
        let parent = document.querySelector(this.el);
        if (parent === null) {
            return console.error("Element not found:", this.el);
        }
        let div = document.createElement("div");
        div.id = this.id;
        for (let key in this.options) {
            div.style[key] = this.options[key];
        }
        parent.appendChild(div);

        // Create the editor
        this.editor = ace.edit(this.id);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/r");
    }
}

const uid = () => Math.random().toString(36).slice(2);

export {
    Editor
}
