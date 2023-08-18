import { FilesManager, randomString } from "./files.js";
import { PubSub } from "./pubsub.js";
import { TabsManager } from "./tabs.js";
import { text_to_dom } from "./utils.js";


class IntegratedEditor {
    constructor(el, options) {
        this.el = el || "body";
        this.options = options;
        this.PubSub = new PubSub();
        this.init_UI();

        this.fs = new FilesManager("/home/web_user");
        this.tabs = new TabsManager(".editors-panel", { width: "100%", height: "100%" });
        this._file_counter = 0;
        this.init_events();
    }

    init_UI() {
        // Initialise the UI
        let parent = document.querySelector(this.el);
        if (parent === null) {
            return console.error("Element not found:", this.el);
        }

        // Add Modal
        let modal = text_to_dom(`
            <dialog class="modal fade" id="modal-new-file" tabindex="-1" aria-labelledby="modal-new-file-label" aria-hidden="true">
            <div class="modal-dialog">
                <button type="button" class="btn btn-close" data-bs-dismiss="modal" aria-label="Close">
                <i class="fas fa-times"></i>
                </button>
                <div id="local-loader" class="loader">
                    <span>Load from local files</span>
                    <input type="file" id="file-input" name="file-input" />
                </div>
                <div id="url-loader" class="loader">
                    <span>Load from URL</span>
                    <input type="text" id="url-input" name="url-input" />
                </div>
                <div id="examples-loader" class="loader">
                    <span>Load examples</span>
                    <select id="examples-select" name="examples-select">
                    <option value="">None</option>
                    </select>
                </div>
                <button class="btn btn-sm btn-primary btn-load" id="btn-load-url">Load</button>
                <span class="notes">(If more than 1 option is active, the bottom one will be loaded.)</span>
                <hr>
                <div id="csv loader" class="loader">
                    <span>Load CSV</span>
                    <input type="file" id="csv-input" name="csv-input" />
                </div>
                <button class="btn btn-sm btn-primary btn-load" id="btn-load-csv">Load</button>
            </div>
            </dialog>
        `);
        modal.querySelector("button.btn-close").addEventListener("click", () => modal.close());
        modal.querySelector("#btn-load-url").addEventListener("click", () => {
            let file = modal.querySelector("#file-input").files[0];
            let url = modal.querySelector("#url-input").value;
            let example = modal.querySelector("#examples-select").value;
            if (file || url || example) {
                if (example) {

                } else if (url) {
                    fetch(url)
                        .then(response => response.text())
                        .then(data => {
                            let filename = url.split("/").pop();
                            let encoded_data = (new TextEncoder()).encode([data]);
                            this.newFileEvent(filename, encoded_data);
                        })
                } else if (file) {

                }
                modal.close();
            }
        });
        modal.querySelector("#btn-load-csv").addEventListener("click", () => {
            let file = modal.querySelector("#csv-input").files[0];
            if (file) {
                this.loadCSV(file);
                modal.close();
            }
        });


        // Wrap the dialog for absolute positioning
        let modal_div = text_to_dom(`<div></div>`);
        modal_div.className = "modal-wrapper";
        modal_div.style.position = "relative";
        modal_div.appendChild(modal);
        parent.appendChild(modal_div);

        // Add container
        let container = document.createElement("div");
        container.className = "integrated-editor";

        // - Files panel
        let div = document.createElement("div");
        div.className = "files-panel";
        div.innerHTML = `
            <div class="files-panel-header">
                <span>Files</span>
                <button class="btn btn-sm btn-primary" id="btn-new-file">
                <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-sm btn-primary" id="btn-open-file">
                <i class="fas fa-folder-open"></i>
                </button>
            </div>
            <div class="files-panel-body">
            </div>
        `;
        div.querySelector("#btn-new-file")
            .addEventListener("click", () => this.newFileEvent());
        div.querySelector("#btn-open-file")
            .addEventListener("click", (evt) => {
                let rect = evt.target.getBoundingClientRect();
                modal.style.left = `${rect.left}px`;
                modal.style.top = `${rect.top + rect.height}px`;
                // Toggle modal
                if (modal.open) {
                    modal.close()
                } else {
                    modal.show()
                }
            });

        // - Editors panel
        let div2 = document.createElement("div");
        div2.className = "editors-panel";
        container.appendChild(div);
        container.appendChild(div2);
        parent.appendChild(container);
    }

    init_events() {
        let that = this;
        this.tabs.PubSub.subscribe("source-file", ({ filename, content }) => {
            that.PubSub.publish("source-file", { filename, content });
        })
        this.tabs.PubSub.subscribe("save-file", data => {
            let encoded_data = (new TextEncoder()).encode([data.content]);
            that.fs.newFile(data.filename, encoded_data);
        })
        this.PubSub.subscribe("open-file-inbound", data => {
            console.log("Open File to be implemented")
        })
    }

    get editor() {
        return this.tabs.editor;
    }


    // Control via the UI
    async newFileEvent(filename, data) {
        // add a div to the files panel
        let div = document.createElement("div");
        div.className = "file";

        filename = filename || `script-${this._file_counter++}.R`;
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
        div.scrollIntoView(false);

        // add a file in webR
        data = data || randomString();
        await this.fs.newFile(filename, data);
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
            ev.target.removeAttribute("contentEditable");
            ev.target.removeAttribute("style");
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

    resizeRows(container_height, line_height) {
        this.tabs.open_tabs
            .forEach(tab => {
                tab.body.resizeRows(container_height, line_height);
            })
    }

    loadCSV(file) {
        console.log("Load CSV to be implemented")
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
        container.className = "editor-container";

        let editor_panel = document.createElement("div");
        editor_panel.id = this.id;
        for (let key in this.options) {
            editor_panel.style[key] = this.options[key];
        }
        // - Create the submit / source button
        let ctrl_panel = document.createElement("div");
        ctrl_panel.className = "editor-ctrl-panel";

        let submit_btn = document.createElement("button");
        submit_btn.innerText = "source";
        submit_btn.addEventListener("click", () => {
            let code = this.editor.getValue().replaceAll("\r\n", "\n");
            this.PubSub.publish("submit", code);
        })

        // - Create save button
        let save_btn = document.createElement("button");
        save_btn.innerText = "save";
        save_btn.addEventListener("click", () => {
            let code = this.editor.getValue().replaceAll("\r\n", "\n");
            this.PubSub.publish("save", code);

            // - Show a tick icon
            tick.style.display = "inline-block";
            tick.animate({ opacity: [1, 0] }, {
                duration: 2000, fill: "forwards", easing: "ease-in"
            });
        })

        // - Create Download all button
        let download_btn = document.createElement("button");
        download_btn.innerText = "download";
        download_btn.addEventListener("click", () => {
            let code = this.editor.getValue().replaceAll("\r\n", "\n");
            this.PubSub.publish("download", code);
        })

        // - Create a tick icon
        let tick = text_to_dom("<i class='fas fa-check'></i>");
        tick.style.display = "none";

        ctrl_panel.appendChild(submit_btn);
        ctrl_panel.appendChild(save_btn);
        ctrl_panel.appendChild(download_btn);
        ctrl_panel.appendChild(tick);


        // - Append the elements to the parent
        container.appendChild(editor_panel);
        container.appendChild(ctrl_panel);
        parent.appendChild(container);
        this.root = container;


        // Create the editor in the div container
        this.editor = ace.edit(this.id);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/r");
        this.editor.setFontSize("16px");
        this.resizeRows(undefined, 16);


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

    resizeRows(containerHeight, lineHeight) {
        let editor_root = this.root.closest("#editor");

        containerHeight = containerHeight ||
            (editor_root.clientHeight -
                editor_root.querySelector(".tabs-panel").clientHeight -
                this.root.querySelector(".editor-ctrl-panel").clientHeight);

        lineHeight = lineHeight ||
            this.editor.renderer.$textLayer.$lines.cells[0].element.clientHeight;

        let nrows = Math.floor(containerHeight / lineHeight);
        this.editor.setOptions({ maxLines: nrows, minLines: nrows });
    }
}

const uid = () => Math.random().toString(36).slice(2);




export {
    Editor,
    IntegratedEditor
}
