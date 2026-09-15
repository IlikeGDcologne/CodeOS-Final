const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("CodeOSDesktop", {

    isDesktopApp: true,

    version: "0.1.0",

    chooseFolder() {
        return ipcRenderer.invoke("codeos:choose-folder");
    },

    createFolder(root, relativePath) {
        return ipcRenderer.invoke(
            "codeos:create-folder",
            root,
            relativePath
        );
    },

    createFile(root, relativePath, content = "") {
        return ipcRenderer.invoke(
            "codeos:create-file",
            root,
            relativePath,
            content
        );
    },

    readFile(root, relativePath) {
        return ipcRenderer.invoke(
            "codeos:read-file",
            root,
            relativePath
        );
    },

    writeFile(root, relativePath, content) {
        return ipcRenderer.invoke(
            "codeos:write-file",
            root,
            relativePath,
            content
        );
    },

    listFiles(root, relativeDirectory = "") {
        return ipcRenderer.invoke(
            "codeos:list-files",
            root,
            relativeDirectory
        );
    },

    openFile(root, relativePath) {
        return ipcRenderer.invoke(
            "codeos:open-file",
            root,
            relativePath
        );
    },

    openWorkspace(nativePath) {
        return ipcRenderer.invoke(
            "codeos:open-workspace",
            nativePath
        );
    },

    runCDX(nativePath) {
        return ipcRenderer.invoke(
            "codeos:run-cdx",
            nativePath
        );
    },

    readAbsoluteCDX(absolutePath) {
        return ipcRenderer.invoke(
            "codeos:read-absolute-cdx",
            absolutePath
        );
    },

    readNativeImage(cdxPath, imageName) {
    return ipcRenderer.invoke(
        "codeos:read-native-image",
        cdxPath,
        imageName
    );
},

    createNativeFromWorkspace(workspaceFile) {
        return ipcRenderer.invoke(
            "codeos:create-native-from-workspace",
            workspaceFile
        );
    },

    deleteCDX(root, relativePath) {
        return ipcRenderer.invoke(
            "codeos:delete-cdx",
            root,
            relativePath
        );
    },

    writeNativeImage(root, relativePath, dataUrl) {
        return ipcRenderer.invoke(
            "codeos:write-native-image",
            root,
            relativePath,
            dataUrl
        );
    },

});