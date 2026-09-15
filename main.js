const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    shell
} = require("electron");

const fs = require("fs/promises");
const path = require("path");
const os = require("os");


/* =========================================================
   👾 CODEOS DESKTOP
========================================================= */

let mainWindow = null;


/* =========================================================
   🔐 ALLOWED FILE TYPES
========================================================= */

const ALLOWED_EXTENSIONS = new Set([
    ".cdx",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".ico"
]);


function isAllowedFile(filePath) {

    return ALLOWED_EXTENSIONS.has(
        path.extname(filePath).toLowerCase()
    );

}


/* =========================================================
   🛡️ SAFE PATH CHECK
========================================================= */

function safeResolve(root, target) {

    const absoluteRoot =
        path.resolve(root);

    const absoluteTarget =
        path.resolve(
            absoluteRoot,
            target
        );

    if (
        absoluteTarget !== absoluteRoot &&
        !absoluteTarget.startsWith(
            absoluteRoot + path.sep
        )
    ) {

        throw new Error(
            "Access denied: path is outside the selected CodeOS folder."
        );

    }

    return absoluteTarget;

}


/* =========================================================
   📁 CREATE WINDOW
========================================================= */

function createCodeOSWindow() {

    mainWindow =
        new BrowserWindow({

            width: 1440,
            height: 900,

            minWidth: 1000,
            minHeight: 650,

            title: "CodeOS",

            backgroundColor: "#080b12",

            show: false,

            webPreferences: {

                preload:
                    path.join(
                        __dirname,
                        "preload.js"
                    ),

                contextIsolation: true,

                nodeIntegration: false,

                sandbox: true

            }

        });


    mainWindow.loadFile(
        path.join(
            __dirname,
            "..",
            "index.html"
        )
    );


    mainWindow.once(
        "ready-to-show",
        () => {

            mainWindow.show();

        }
    );


    mainWindow.webContents.setWindowOpenHandler(
        ({ url }) => {

            if (
                url.startsWith("http://") ||
                url.startsWith("https://")
            ) {

                shell.openExternal(url);

                return {
                    action: "deny"
                };

            }

            return {
                action: "allow"
            };

        }
    );


    mainWindow.webContents.on(
        "will-navigate",
        (event, url) => {

            if (
                url.startsWith("http://") ||
                url.startsWith("https://")
            ) {

                event.preventDefault();

                shell.openExternal(url);

            }

        }
    );


    mainWindow.on(
        "closed",
        () => {

            mainWindow = null;

        }
    );

}


/* =========================================================
   📁 CHOOSE REAL CODEOS FOLDER
========================================================= */

ipcMain.handle(
    "codeos:choose-folder",
    async () => {

        const result =
            await dialog.showOpenDialog(
                mainWindow,
                {

                    title:
                        "Choose CodeOS Project Folder",

                    defaultPath:
                        path.join(
                            os.homedir(),
                            "Documents"
                        ),

                    properties: [
                        "openDirectory",
                        "createDirectory"
                    ]

                }
            );


        if (
            result.canceled ||
            !result.filePaths.length
        ) {

            return {
                canceled: true
            };

        }


        return {
            canceled: false,
            path:
                result.filePaths[0]
        };

    }
);


/* =========================================================
   📂 CREATE REAL FOLDER
========================================================= */

ipcMain.handle(
    "codeos:create-folder",
    async (
        event,
        root,
        relativePath
    ) => {

        try {

            const target =
                safeResolve(
                    root,
                    relativePath
                );

            await fs.mkdir(
                target,
                {
                    recursive: false
                }
            );

            return {
                success: true,
                path: target
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.message
            };

        }

    }
);


/* =========================================================
   📄 CREATE CDX FILE
========================================================= */

ipcMain.handle(
    "codeos:create-file",
    async (
        event,
        root,
        relativePath,
        content = ""
    ) => {

        try {

            const target =
                safeResolve(
                    root,
                    relativePath
                );


            if (
                !isAllowedFile(target)
            ) {

                throw new Error(
                    "CodeOS can only create .cdx or image files."
                );

            }


            if (
                await fileExists(target)
            ) {

                throw new Error(
                    "File already exists."
                );

            }


            await fs.writeFile(
                target,
                String(content),
                "utf8"
            );


            return {
                success: true,
                path: target
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.message
            };

        }

    }
);


/* =========================================================
   📖 READ CDX / IMAGE
========================================================= */

ipcMain.handle(
    "codeos:read-file",
    async (
        event,
        root,
        relativePath
    ) => {

        try {

            const target =
                safeResolve(
                    root,
                    relativePath
                );


            if (
                !isAllowedFile(target)
            ) {

                throw new Error(
                    "File type not allowed."
                );

            }


            const stats =
                await fs.stat(
                    target
                );


            if (
                !stats.isFile()
            ) {

                throw new Error(
                    "Not a file."
                );

            }


            const extension =
                path.extname(
                    target
                ).toLowerCase();


            /* ==========================================
               TEXT CDX
            ========================================== */

            if (
                extension === ".cdx" ||
                extension === ".svg"
            ) {

                const content =
                    await fs.readFile(
                        target,
                        "utf8"
                    );

                return {
                    success: true,
                    type: "text",
                    content,
                    path: target,
                    size:
                        stats.size
                };

            }


            /* ==========================================
               BINARY IMAGE
            ========================================== */

            const buffer =
                await fs.readFile(
                    target
                );


            const mimeTypes = {

                ".png":
                    "image/png",

                ".jpg":
                    "image/jpeg",

                ".jpeg":
                    "image/jpeg",

                ".gif":
                    "image/gif",

                ".webp":
                    "image/webp",

                ".bmp":
                    "image/bmp",

                ".ico":
                    "image/x-icon"

            };


            const mime =
                mimeTypes[extension] ||
                "application/octet-stream";


            return {

                success: true,

                type: "image",

                path: target,

                size:
                    stats.size,

                dataURL:
                    `data:${mime};base64,${buffer.toString("base64")}`

            };

        } catch (error) {

            return {

                success: false,

                message:
                    error.message

            };

        }

    }
);


/* =========================================================
   ✏️ EDIT CDX FILE
========================================================= */

ipcMain.handle(
    "codeos:write-file",
    async (
        event,
        root,
        relativePath,
        content
    ) => {

        try {

            const target =
                safeResolve(
                    root,
                    relativePath
                );


            if (
                path.extname(
                    target
                ).toLowerCase() !== ".cdx"
            ) {

                throw new Error(
                    "Only .cdx files can be edited."
                );

            }


            await fs.writeFile(
                target,
                String(content),
                "utf8"
            );


            return {
                success: true,
                path: target
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.message
            };

        }

    }
);


/* =========================================================
   📋 LIST ALLOWED FILES
========================================================= */

ipcMain.handle(
    "codeos:list-files",
    async (
        event,
        root,
        relativeDirectory = "."
    ) => {

        try {

            const directory =
                safeResolve(
                    root,
                    relativeDirectory
                );


            const entries =
                await fs.readdir(
                    directory,
                    {
                        withFileTypes:
                            true
                    }
                );


            const results = [];


            for (
                const entry of entries
            ) {

                if (
                    entry.isDirectory()
                ) {

                    results.push({

                        name:
                            entry.name,

                        type:
                            "directory"

                    });

                    continue;

                }


                if (
                    isAllowedFile(
                        entry.name
                    )
                ) {

                    const absolutePath =
                        path.join(
                            directory,
                            entry.name
                        );

                    const stats =
                        await fs.stat(
                            absolutePath
                        );

                    results.push({

                        name:
                            entry.name,

                        type:
                            "file",

                        size:
                            stats.size

                    });

                }

            }


            return {

                success: true,
                files: results

            };

        } catch (error) {

            return {

                success: false,

                message:
                    error.message

            };

        }

    }
);


/* =========================================================
   🖼️ OPEN IMAGE / FILE WITH OS
========================================================= */

ipcMain.handle(
    "codeos:open-file",
    async (
        event,
        root,
        relativePath
    ) => {

        try {

            const target =
                safeResolve(
                    root,
                    relativePath
                );


            if (
                !isAllowedFile(target)
            ) {

                throw new Error(
                    "File type not allowed."
                );

            }


            const error =
                await shell.openPath(
                    target
                );


            return {

                success:
                    !error,

                message:
                    error || ""

            };

        } catch (error) {

            return {

                success: false,

                message:
                    error.message

            };

        }

    }
);


/* =========================================================
   💻 OPEN CODEOS WORKSPACE
========================================================= */

ipcMain.handle(
    "codeos:open-workspace",
    async (
        event,
        nativePath
    ) => {

        if (!mainWindow) {

            return {
                success: false,
                message:
                    "CodeOS window is unavailable."
            };

        }


        const workspacePath =
            path.join(
                __dirname,
                "..",
                "workspace.html"
            );


        try {

            const { pathToFileURL } =
                require("url");


            const url =
                pathToFileURL(
                    workspacePath
                ).href +
                "?nativeFile=" +
                encodeURIComponent(
                    nativePath
                );


            await mainWindow.loadURL(
                url
            );


            return {
                success: true
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.message
            };

        }

    }
);


/* =========================================================
   ▶️ OPEN CODEOS RUNNER
========================================================= */

ipcMain.handle(
    "codeos:run-cdx",
    async (
        event,
        nativePath
    ) => {

        if (!mainWindow) {

            return {
                success: false,
                message:
                    "CodeOS window is unavailable."
            };

        }


        const runnerPath =
            path.join(
                __dirname,
                "..",
                "run.html"
            );


        try {

            const { pathToFileURL } =
                require("url");


            const url =
                pathToFileURL(
                    runnerPath
                ).href +
                "?nativeFile=" +
                encodeURIComponent(
                    nativePath
                );


            await mainWindow.loadURL(
                url
            );


            return {
                success: true
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.message
            };

        }

    }
);


/* =========================================================
   HELPER
========================================================= */

async function fileExists(
    filePath
) {

    try {

        await fs.access(
            filePath
        );

        return true;

    } catch {

        return false;

    }

}


/* =========================================================
   START
========================================================= */

app.whenReady()
    .then(() => {

        createCodeOSWindow();


        app.on(
            "activate",
            () => {

                if (
                    BrowserWindow
                        .getAllWindows()
                        .length === 0
                ) {

                    createCodeOSWindow();

                }

            }
        );

    });


app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {

            app.quit();

        }

    }
);

/* =========================================================
   📄 READ ABSOLUTE CDX FILE FOR RUNNER
========================================================= */

ipcMain.handle(
    "codeos:read-absolute-cdx",
    async (
        event,
        absolutePath
    ) => {

        try {

            const resolved =
                path.resolve(
                    absolutePath
                );


            if (
                path.extname(
                    resolved
                ).toLowerCase() !==
                ".cdx"
            ) {

                throw new Error(
                    "Only .cdx files may be opened by the runner."
                );

            }


            const content =
                await fs.readFile(
                    resolved,
                    "utf8"
                );


            return {

                success: true,

                content

            };

        } catch (error) {

            return {

                success: false,

                message:
                    error.message

            };

        }

    }
);

ipcMain.handle(
    "codeos:read-native-image",
    async (event, cdxPath, imageName) => {

        try {

            const imageExtensions = new Set([
                ".png",
                ".jpg",
                ".jpeg",
                ".gif",
                ".webp",
                ".svg",
                ".bmp",
                ".ico"
            ]);

            const cdxDirectory =
                path.dirname(
                    path.resolve(cdxPath)
                );

            const imagePath =
                path.resolve(
                    cdxDirectory,
                    imageName
                );

            const extension =
                path.extname(
                    imagePath
                ).toLowerCase();

            if (!imageExtensions.has(extension)) {
                return {
                    success: false,
                    message:
                        "Only image files are allowed."
                };
            }

            /* Prevent escaping the CDX folder */
            const relative =
                path.relative(
                    cdxDirectory,
                    imagePath
                );

            if (
                relative.startsWith("..") ||
                path.isAbsolute(relative)
            ) {
                return {
                    success: false,
                    message:
                        "Image must be inside the CDX file's folder."
                };
            }

            const data =
                await fs.readFile(
                    imagePath
                );

            const mimeTypes = {
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".gif": "image/gif",
                ".webp": "image/webp",
                ".svg": "image/svg+xml",
                ".bmp": "image/bmp",
                ".ico": "image/x-icon"
            };

            return {
                success: true,
                data:
                    `data:${mimeTypes[extension]};base64,` +
                    data.toString("base64")
            };

        } catch (error) {

            console.error(
                "❌ Could not read native image:",
                error
            );

            return {
                success: false,
                message: error.message
            };
        }
    }
);


ipcMain.handle(
    "codeos:delete-cdx",
    async (event, root, relativePath) => {

        try {

            const target =
                safeResolve(
                    root,
                    relativePath
                );

            if (
                path.extname(target)
                    .toLowerCase() !== ".cdx"
            ) {
                return {
                    success: false,
                    message:
                        "Only .cdx files can be deleted with cdx delete."
                };
            }

            await fs.unlink(target);

            return {
                success: true,
                message:
                    `Deleted ${path.basename(target)}`
            };

        } catch (error) {

            return {
                success: false,
                message: error.message
            };

        }
    }
);

ipcMain.handle(
    "codeos:write-native-image",
    async (event, root, relativePath, dataUrl) => {

        try {

            const imageExtensions = new Set([
                ".png",
                ".jpg",
                ".jpeg",
                ".gif",
                ".webp",
                ".svg",
                ".bmp",
                ".ico"
            ]);

            const target =
                safeResolve(
                    root,
                    relativePath
                );

            const extension =
                path.extname(
                    target
                ).toLowerCase();

            if (
                !imageExtensions.has(
                    extension
                )
            ) {

                return {
                    success: false,
                    message:
                        "Only image files are allowed."
                };

            }

            if (
                typeof dataUrl !== "string" ||
                !dataUrl.startsWith("data:")
            ) {

                return {
                    success: false,
                    message:
                        "Invalid image data."
                };

            }

            const comma =
                dataUrl.indexOf(",");

            if (
                comma === -1
            ) {

                return {
                    success: false,
                    message:
                        "Invalid image data."
                };

            }

            const encoded =
                dataUrl.slice(
                    comma + 1
                );

            const buffer =
                Buffer.from(
                    encoded,
                    "base64"
                );

            await fs.writeFile(
                target,
                buffer
            );

            return {
                success: true
            };

        } catch (error) {

            console.error(
                "❌ Could not write native image:",
                error
            );

            return {
                success: false,
                message:
                    error.message
            };

        }
    }
);