import { FilesManager, randomString } from "./files.js";
import { PubSub } from "./pubsub.js";
import { TabsManager } from "./tabs.js";

class IntegratedEditor {
    constructor(el, options) {
        this.el = el || "body";
        this.options = options;
        this.PubSub = new PubSub();

        this.init_UI();
        this.fs = new FilesManager("/home/web_user");
        this.tabs = new TabsManager(".editors-panel", { width: "100%", height: "100%" });
        this._file_counter = 0;
    }

    init_UI() {
        // Initialise the UI
        let parent = document.querySelector(this.el);
        if (parent === null) {
            return console.error("Element not found:", this.el);
        }

        let container = document.createElement("div");
        container.className = "integrated-editor";

        // Files panel
        let div = document.createElement("div");
        div.className = "files-panel";
        div.innerHTML = `
            <div class="files-panel-header">
                <span>Files</span>
                <button class="btn btn-sm btn-primary" id="btn-new-file">
                <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="files-panel-body">
            </div>
        `;
        div.querySelector("#btn-new-file")
            .addEventListener("click", () => this.newFileEvent());

        // Editors panel
        let div2 = document.createElement("div");
        div2.className = "editors-panel";
        container.appendChild(div);
        container.appendChild(div2);
        parent.appendChild(container);
    }

    init_events() {
    }

    get editor() {
        return this.tabs.editor;
    }


    // Control via the UI
    async newFileEvent(ev) {
        // add a div to the files panel
        let div = document.createElement("div");
        div.className = "file";

        let filename = `script-${this._file_counter++}.R`;
        div.setAttribute("data-file-name", filename);

        div.innerHTML = `
            <span class="file-name">${filename}</span>
            <button class="btn btn-sm btn-primary btn-close-file">
            <i class="fas fa-times cross"></i>
            </button>
        `;

        div.querySelector(".btn-close-file")
            .addEventListener("click", (ev) => this.deleteFileEvent(ev));

        div.querySelector(".file-name")
            .addEventListener("click", (ev) => this.openFileEvent(ev));

        div.querySelector(".file-name")
            .addEventListener("dblclick", (ev) => this.renameFileEvent(ev));

        document.querySelector(".files-panel-body").appendChild(div);

        // add a file in webR
        await this.fs.newFile(filename, randomString());
    }

    async deleteFileEvent(ev) {
        let label = ev.target.closest(".file");
        let filename = label.getAttribute("data-file-name");
        label.remove();
        await this.fs.deleteFile(filename);
    }

    async openFileEvent(ev) {
        let tab = ev.target.closest(".file");
        let filename = tab.getAttribute("data-file-name");
        let content = await this.fs.openFile(filename);
        await this.tabs.openTab(filename, content);
    }

    async renameFileEvent(ev) {
        ev.target.contentEditable = true;
        ev.target.focus();
        ev.target.style.cursor = "text";

        ev.target.addEventListener("keypress", (ev) => {
            if (ev.keyCode == 13) {
                ev.target.blur();
            }
        });

        ev.target.addEventListener("blur", async (ev) => {
            ev.target.contentEditable = false;
            ev.target.style.cursor = "pointer";
            let filename = ev.target.innerText,
                old_filename = ev.target.parentElement.getAttribute("data-file-name");
            if (filename == old_filename) {
                return;
            }
            // Check if the new filename already exists
            if (await this.fs.fileExists(filename)) {
                ev.target.innerText = old_filename;
                return alert("File already exists");
            }

            ev.target.parentElement.setAttribute("data-file-name", filename);
            await this.fs.renameFile(old_filename, filename);
            this.tabs.renameTab(old_filename, filename);
        });
    }
}




class Editor {
    constructor(el, options) {
        this.el = el || "body";
        this.options = Object.assign({ width: "400px", height: "200px" }, options)
        this.id = "editor-" + uid();
        this.PubSub = new PubSub();
        this.root = null;


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
        this.root = container;


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

        this.editor.commands.addCommand({
            name: 'save',
            bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
            exec: () => {
                let code = this.editor.getValue().replaceAll("\r\n", "\n");
                this.PubSub.publish("save", code);
            }
        });
    }
}

const uid = () => Math.random().toString(36).slice(2);




export {
    Editor,
    IntegratedEditor
}
