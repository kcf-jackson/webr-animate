import { Editor } from "./editor.js";
import { text_to_dom, hide, show } from "./utils.js";


class TabsManager {
    constructor(el, options = {}) {
        this.el = el || "body";
        this.options = options;
        this.root = null;
        this.init_UI();

        this.open_tabs = [];  // := [{name, content, kernel, dom}]
        this.active_tab = -1;
    }

    init_UI() {
        // Initialise the UI
        let parent = document.querySelector(this.el);
        if (parent === null) {
            return console.error("Element not found:", this.el);
        }

        let container = text_to_dom("<div class='tabs-manager'></div>");

        let tabs_panel = text_to_dom(`<div class="tabs-panel">            
            <div class="tabs-panel-body"></div>
        </div>`);

        let editors_panel = text_to_dom(`<div class="inner-editors-panel"></div>`);

        container.appendChild(tabs_panel);
        container.appendChild(editors_panel);
        parent.appendChild(container);
        this.root = container;
    }



    get length() {
        return this.open_tabs.length;
    }

    get current_tab() {
        return this.open_tabs[this.active_tab];
    }

    findTabIndex(name) {
        return this.open_tabs.findIndex((el) => el.name === name);
    }

    isActiveTab(name) {
        return this.findTabIndex(name) === this.active_tab;
    }

    isTabOpen(name) {
        return this.findTabIndex(name) !== -1;
    }

    select(x) {
        return this.root.querySelector(x);
    }

    selectAll(x) {
        return this.root.querySelectorAll(x);
    }



    openTab(name, content = "") {
        // if opened and active, then do nothing
        if (this.isTabOpen(name) && this.isActiveTab(name)) return;

        // if opened and not active, then make active
        if (this.isTabOpen(name) && !this.isActiveTab(name)) {
            this.setActiveTab(name);
            return;
        }

        // if not opened, then open
        // - deactivate the active tab headers
        Array.from(this.selectAll(".tab.active"))
            .forEach((el) => el.classList.remove("active"));

        // - create a new active tab header
        let tab_header = text_to_dom(`<div class="tab active">
            <span>${name}</span>
            <button class="btn btn-sm btn-primary" id="btn-close-tab" data-tab-name="${name}">
            <i class="fas fa-times cross"></i>
            </button>
        </div>`);

        tab_header
            .addEventListener("click", () => {
                let name = tab_header.querySelector("span").innerText;
                this.setActiveTab(name);
            });

        tab_header.querySelector("#btn-close-tab")
            .addEventListener("click", () => {
                let name = tab_header.querySelector("span").innerText;
                this.closeTab(name);
            });

        // - add the new tab header to the tabs panel
        this.select(".tabs-panel-body").appendChild(tab_header);


        // - hide all the tab bodies
        Array.from(this.selectAll(".tab-body"))
            .forEach(hide);

        // - create and add a new tab body
        let tab_body = new Editor(".inner-editors-panel", this.options);
        tab_body.root.classList.add("tab-body");
        tab_body.editor.insert(content);

        // - add the new tab to the open tabs list
        let data = { name, header: tab_header, body: tab_body };
        this.open_tabs.push(data);


        // - set the new tab as active
        this.setActiveTab(name);
    }

    closeTab(name) {
        let idx = this.findTabIndex(name);
        if (idx === -1) return;

        // remove the tab header from the tabs panel
        this.open_tabs[idx].header.remove();

        // remove the tab body and editor from the editors panel
        this.open_tabs[idx].body.root.remove();
        this.open_tabs.splice(idx, 1);
        if (idx < this.active_tab) {
            this.active_tab--;
        }

        // set the active tab to the last one
        if (idx == this.active_tab) {
            if (idx >= this.length) {
                idx--;
            }
            if (idx == -1) return;

            let last_tab = this.open_tabs[idx].name;
            this.setActiveTab(last_tab);
        }
    }

    setActiveTab(name) {
        let idx = this.findTabIndex(name);
        if (idx === -1) return;
        this.active_tab = idx;

        // Deactivate the active tab headers
        Array.from(this.selectAll(".tab.active"))
            .forEach((el) => el.classList.remove("active"));

        // Make the clicked tab active
        this.open_tabs[idx].header.classList.add("active");

        // Hide all the tab bodies
        Array.from(this.selectAll(".tab-body"))
            .forEach(hide);

        // Show the editor
        show(this.open_tabs[idx].body.root);
    }

    renameTab(old_filename, filename) {
        if (!this.isTabOpen(old_filename)) return;

        let ind = this.findTabIndex(old_filename);
        this.open_tabs[ind].name = filename;
        this.open_tabs[ind].header.querySelector("span").innerText = filename;
    }
}

export {
    TabsManager
}
