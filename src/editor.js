import { PubSub } from "./pubsub.js";

class Editor {
    constructor(el, options) {
        this.el = el || "body";
        this.options = Object.assign({ width: "400px", height: "200px" }, options)
        this.id = "editor-" + uid();
        this.PubSub = new PubSub();

        // Create a div container to hold the editor
        // - Check if the parent element exists
        let parent = document.querySelector(this.el);
        if (parent === null) {
            return console.error("Element not found:", this.el);
        }
        // - If so, create the container
        let container = document.createElement("div");
        let div = document.createElement("div");
        div.id = this.id;
        for (let key in this.options) {
            div.style[key] = this.options[key];
        }
        // - Create the submit button
        let submit_btn = document.createElement("button");
        submit_btn.innerText = "source";
        submit_btn.addEventListener("click", () => {
            let code = this.editor.getValue().replaceAll("\r\n", "\n");
            this.PubSub.publish("submit", code);
        })
        // - Append the elements to the parent
        container.appendChild(div);
        container.appendChild(submit_btn);
        parent.appendChild(container);


        // Create the editor in the div container
        this.editor = ace.edit(this.id);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/r");


        // Enable hotkeys
        this.editor.commands.addCommand({
            name: 'submit',
            bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S' },
            exec: () => {
                let code = this.editor.getValue().replaceAll("\r\n", "\n");
                this.PubSub.publish("submit", code);
            }
        });
    }
}

const uid = () => Math.random().toString(36).slice(2);

export {
    Editor
}
