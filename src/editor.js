import { FilesManager } from "./files.js";
import { PubSub } from "./pubsub.js";
import { TabsManager } from "./tabs.js";

class IntegratedEditor {
    constructor(el, options) {
        this.el = el || "body";
        this.options = options;
        this.PubSub = new PubSub();

        this.fs = new FilesManager(dir = "/home/web_user");
        this.tabs = new TabsManager();

        this.open_tabs = [];
        this.active_tab = 0;
        this.list_files = [];
        this._file_counter = 0;

        this.initUI();
        let editor = new Editor(".editors-panel", { width: "100%", height: "100%" })
        this.open_tabs.push(editor);
    }

    initUI() {
        // Initialise the UI
        let parent = document.querySelector(this.el);
        if (parent === null) {
            return console.error("Element not found:", this.el);
        }

        let container = document.createElement("div");
        container.className = "integrated-editor";

        let div = document.createElement("div");
        div.className = "files-panel";
        div.innerHTML = `
            <div class="files-panel-header">
                <span>Files</span>
                <button class="btn btn-sm btn-primary" id="btn-new-file">New</button>
            </div>
            <div class="files-panel-body">
            </div>
        `;
        div.querySelector("#btn-new-file")
            .addEventListener("click", () => this.newFileEvent());

        let div2 = document.createElement("div");
        div2.className = "editors-panel";
        container.appendChild(div);
        container.appendChild(div2);
        parent.appendChild(container);
    }

    get editor() {
        return this.open_tabs[this.active_tab];
    }


    // Control via the UI
    async newFileEvent(ev) {
        // add a div to the files panel
        let div = document.createElement("div");
        div.className = "file";

        let filename = `script_${this._file_counter++}.R`;
        div.setAttribute("data-file-name", filename);

        div.innerHTML = `
            <span class="file-name">${filename}</span>
            <button class="btn btn-sm btn-primary btn-close-file">x</button>
        `;
        div.querySelector(".btn-close-file").addEventListener("click", (ev) => this.deleteFileEvent(ev));
        div.querySelector(".file-name").addEventListener("click", (ev) => this.openFileEvent(ev));
        // div.querySelector(".file-name").addEventListener("dblclick", () => this.renameFile());
        document.querySelector(".files-panel-body").appendChild(div);

        // add a file in webR
        // await this.newFile(filename);
        // await this.openFile(filename);
    }

    async deleteFileEvent(ev) {
        let tab = ev.target.parentElement;
        let filename = tab.getAttribute("data-file-name");
        let file_ind = this.list_files.indexOf(filename);
        if (file_ind > -1) {
            this.list_files.splice(file_ind, 1);
            this.open_tabs.splice(file_ind, 1);
        }
        tab.remove();
        // await this.deleteFile(file_path(this._home_directory, filename));
    }

    async openFileEvent(ev) {
    }


    // Interact with the file system


    // Interact with the editor
    async setActiveTab(tab) {
    }
}



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
