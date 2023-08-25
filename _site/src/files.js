import { PubSub } from "./pubsub.js";

class FilesManager {
    constructor(dir = "/home/web_user") {
        this.files = [];
        this.PubSub = new PubSub();

        this._home_directory = dir;  // once set, it cannot be changed
        this.PubSub.subscribe("new-file", x => console.log("New file:", x));
        this.PubSub.subscribe("delete-file", x => console.log("Delete file:", x));
        this.PubSub.subscribe("rename-file", ({ from: old_name, to: new_name }) => console.log("Rename file:", old_name, "=>", new_name));
        this.PubSub.subscribe("open-file", x => console.log("Open file:", x));
    }

    _addFile(file) {
        this.files.push(file);
    }

    _removeFile(file) {
        let idx = this.files.indexOf(file);
        if (idx == -1) return;
        this.files.splice(idx, 1);
    }

    _renameFile(old_name, new_name) {
        let idx = this.files.indexOf(old_name);
        if (idx == -1) return;
        this.files[idx] = new_name;
    }

    // Interact with webR
    async listFiles(path = "~", flatten = true, depth = 9999, full_names = false) {
        let epath = (path.startsWith("~")) ?
            path.replace("~", this._home_directory) :
            path;
        let files = await webR.FS.lookupPath(epath);
        if (!flatten) return files;

        let fs = flattenPaths(files, '', depth);
        if (full_names) {
            console.log("Full names not implemented yet.")
            //     fs.forEach(f => f.name = file_path(epath, f.name));   // TODO
        }
        return fs;
    }

    async newFile(path, data = [], home = true) {
        let full_path = home ? file_path(this._home_directory, path) : path;
        await webR.FS.writeFile(full_path, new Uint8Array(data));
        this._addFile(full_path);
        this.PubSub.publish("new-file", full_path);
    }

    async deleteFile(path, home = true) {
        let full_path = home ? file_path(this._home_directory, path) : path;
        await webR.FS.unlink(full_path);
        this._removeFile(full_path);
        this.PubSub.publish("delete-file", full_path);
    }

    async openFile(path, raw = false, home = true) {
        let full_path = home ? file_path(this._home_directory, path) : path;
        let content = await webR.FS.readFile(full_path);
        let result = raw ? content : (new TextDecoder).decode(content);
        this.PubSub.publish("open-file", result);
        return result;
    }

    async renameFile(from, to, home = true) {
        let data = await this.openFile(from, true, home);
        await this.newFile(to, data, home);
        await this.deleteFile(from, home);

        this._renameFile(from, to);
        this.PubSub.publish("rename-file", { from: from, to: to });
    }

    async fileExists(path, home = true) {
        let result;
        try {
            result = await this.listFiles(path);
            return result.length > 0;
        } catch (e) {
            return false;
        }
    }
}


const file_path = (dir, fname) => {
    if (dir == '') return fname;
    return dir.endsWith("/") ? dir + fname : dir + "/" + fname;
}


const flattenPaths = (node, currentPath = '', depth = 9999) => {
    const paths = [];
    let contents = node.contents;

    node.name = file_path(currentPath, node.name);
    node.contents = node.contents.length;
    paths.push(node)

    if (Array.isArray(contents) && depth > 0) {
        for (const child_node of contents) {
            paths.push(...flattenPaths(child_node, node.name, depth - 1));
        }
    }
    return paths;
}


const randomString = (n = 30) => {
    let data = ["\"" + Math.random().toString(36).substring(2, n) + "\""];
    return (new TextEncoder()).encode(data);
}


export {
    FilesManager,
    randomString,
}
