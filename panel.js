/* =========================================================
   👾 CODEOS DEVTOOLS PANEL
   Inspector + Live Code + Files
========================================================= */

"use strict";

console.log(
    "👾 CodeOS DevTools panel loaded."
);


/* =========================================================
   ELEMENTS
========================================================= */

const navItems =
    document.querySelectorAll(
        ".navItem"
    );

const views =
    document.querySelectorAll(
        ".view"
    );

const pageTitle =
    document.getElementById(
        "pageTitle"
    );

const statusDot =
    document.getElementById(
        "statusDot"
    );

const connectionText =
    document.getElementById(
        "connectionText"
    );

const projectName =
    document.getElementById(
        "projectName"
    );

const projectLocation =
    document.getElementById(
        "projectLocation"
    );

const fileCount =
    document.getElementById(
        "fileCount"
    );

const variableCount =
    document.getElementById(
        "variableCount"
    );

const spriteCount =
    document.getElementById(
        "spriteCount"
    );

const functionCount =
    document.getElementById(
        "functionCount"
    );

const currentFile =
    document.getElementById(
        "currentFile"
    );

const currentFileType =
    document.getElementById(
        "currentFileType"
    );

const codePreview =
    document.getElementById(
        "codePreview"
    );

const fileSelector =
    document.getElementById(
        "fileSelector"
    );

const selectedFileName =
    document.getElementById(
        "selectedFileName"
    );

const codeEditor =
    document.getElementById(
        "codeEditor"
    );

const saveStatus =
    document.getElementById(
        "saveStatus"
    );

const networkFileList =
    document.getElementById(
        "networkFileList"
    );

const fileSearch =
    document.getElementById(
        "fileSearch"
    );

const spriteGrid =
    document.getElementById(
        "spriteGrid"
    );

const stateGrid =
    document.getElementById(
        "stateGrid"
    );

const consoleBox =
    document.getElementById(
        "consoleBox"
    );


/* =========================================================
   STATE
========================================================= */

let runtimeData = {

    connected: false,
    project: null,
    files: [],
    variables: {},
    sprites: {},
    functions: [],
    output: ""

};


/* =========================================================
   ✏️ EDITOR STATE
========================================================= */

let editorDirty = false;

let editorFileName = null;


/* =========================================================
   NAVIGATION
========================================================= */

const titles = {

    inspector:
        "Inspector",

    code:
        "Code",

    files:
        "Files",

    sprites:
        "Sprites",

    state:
        "Runtime State",

    console:
        "Console"

};


navItems.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                navItems.forEach(
                    item =>
                        item.classList.toggle(
                            "active",
                            item ===
                            button
                        )
                );

                views.forEach(
                    section =>
                        section.classList.toggle(
                            "active",
                            section.id ===
                            `view-${view}`
                        )
                );

                pageTitle.textContent =
                    titles[view] ||
                    "CodeOS";

            }
        );

    }
);


/* =========================================================
   INSPECTED PAGE EVALUATION
========================================================= */

function evaluatePage(
    expression
) {

    return new Promise(
        resolve => {

            chrome.devtools
                .inspectedWindow
                .eval(
                    expression,
                    (
                        result,
                        exceptionInfo
                    ) => {

                        if (
                            exceptionInfo
                        ) {

                            console.error(
                                "❌ DevTools evaluation error:",
                                exceptionInfo
                            );

                            resolve({
                                success:
                                    false,

                                error:
                                    exceptionInfo
                            });

                            return;

                        }

                        resolve({
                            success:
                                true,

                            result

                        });

                    }
                );

        }
    );

}


/* =========================================================
   GET CODEOS RUNTIME
========================================================= */

async function inspectCodeOS() {

    const expression = `(() => {

        try {

            if (
                !window.CodeOSDevToolsAPI
            ) {

                return {
                    isCodeOS: false,
                    reason:
                        "CodeOS DevTools bridge not found."
                };

            }

            let runtimeVariables = {};

            let runtimeSprites = {};

            let runtimeFunctions = [];

            try {

                if (
                    typeof variables !==
                    "undefined"
                ) {

                    runtimeVariables =
                        JSON.parse(
                            JSON.stringify(
                                variables
                            )
                        );

                }

            } catch {}

            try {

                if (
                    typeof sprites !==
                    "undefined"
                ) {

                    runtimeSprites =
                        Object.keys(
                            sprites
                        ).reduce(
                            (
                                result,
                                key
                            ) => {

                                const sprite =
                                    sprites[key];

                                result[key] = {

                                    x:
                                        sprite.x,

                                    y:
                                        sprite.y,

                                    image:
                                        sprite.image,

                                    width:
                                        sprite
                                            .element
                                            ?.width ||
                                        null,

                                    height:
                                        sprite
                                            .element
                                            ?.height ||
                                        null

                                };

                                return result;

                            },
                            {}
                        );

                }

            } catch {}

            try {

                if (
                    typeof functions !==
                    "undefined"
                ) {

                    runtimeFunctions =
                        Object.keys(
                            functions
                        );

                }

            } catch {}


            const project =
                window.CodeOSDevToolsAPI
                    .getProject();


            const outputElement =
                document.getElementById(
                    "output"
                );


            return {

                isCodeOS:
                    true,

                title:
                    document.title,

                url:
                    window.location.href,

                project,

                variables:
                    runtimeVariables,

                sprites:
                    runtimeSprites,

                functions:
                    runtimeFunctions,

                output:
                    outputElement
                        ?.innerText ||
                    ""

            };

        } catch (error) {

            return {

                isCodeOS:
                    false,

                error:
                    error.message

            };

        }

    })()`;


    const response =
        await evaluatePage(
            expression
        );


    if (
        !response.success ||
        !response.result ||
        response.result.isCodeOS !==
            true
    ) {

        runtimeData = {

            connected:
                false,

            project:
                null,

            files:
                [],

            variables:
                {},

            sprites:
                {},

            functions:
                [],

            output:
                ""

        };

        setConnection(false);

        renderAll();

        return;

    }


    runtimeData = {

        connected:
            true,

        project:
            response.result,

        files:
            response.result.project
                ?.files ||
            [],

        variables:
            response.result.variables ||
            {},

        sprites:
            response.result.sprites ||
            {},

        functions:
            response.result.functions ||
            [],

        output:
            response.result.output ||
            ""

    };


    setConnection(true);

renderInspector();

if (!editorDirty) {
    renderCode();
}

renderFiles(
    fileSearch.value
);

renderSprites();

renderState();

renderConsole();

}


/* =========================================================
   CONNECTION
========================================================= */

function setConnection(
    connected
) {

    statusDot.classList.toggle(
        "connected",
        connected
    );

    connectionText.textContent =
        connected
            ? "CodeOS connected"
            : "No CodeOS runtime";

}


/* =========================================================
   INSPECTOR
========================================================= */

function renderInspector() {

    const project =
        runtimeData.project;


    if (!project) {

        projectName.textContent =
            "No CodeOS project";

        projectLocation.textContent =
            "Open a running CodeOS project in this tab.";

        fileCount.textContent =
            "—";

        variableCount.textContent =
            "—";

        spriteCount.textContent =
            "—";

        functionCount.textContent =
            "—";

        currentFile.textContent =
            "—";

        currentFileType.textContent =
            "—";

        codePreview.textContent =
            "No CodeOS runtime detected.";

        return;

    }


    projectName.textContent =
        project.project?.name ||
        project.title ||
        "CodeOS Project";


    projectLocation.textContent =
        project.url ||
        "";


    fileCount.textContent =
        runtimeData.files.length;


    variableCount.textContent =
        Object.keys(
            runtimeData.variables
        ).length;


    spriteCount.textContent =
        Object.keys(
            runtimeData.sprites
        ).length;


    functionCount.textContent =
        runtimeData.functions.length;


    const selected =
        project.project
            ?.selectedFile;


    currentFile.textContent =
        selected?.name ||
        runtimeData.files[0]
            ?.name ||
        "No file";


    currentFileType.textContent =
        selected
            ? (
                selected.name
                    .split(".")
                    .pop()
                    .toUpperCase()
            )
            : "CDX";


    codePreview.textContent =
        selected?.content ||
        runtimeData.files[0]
            ?.content ||
        "No CodeOS code selected.";

}


/* =========================================================
   CODE VIEW
========================================================= */

function renderCode() {

    const codeFiles =
        runtimeData.files.filter(
            file =>
                file.name
                    .toLowerCase()
                    .endsWith(".cdx")
        );


    if (!codeFiles.length) {

        fileSelector.innerHTML = "";

        selectedFileName.textContent =
            "No CDX files";

        if (!editorDirty) {

            codeEditor.value =
                "No .cdx files found.";

        }

        codeEditor.disabled =
            true;

        return;

    }


    codeEditor.disabled =
        false;


    /*
     * IMPORTANT:
     *
     * If the user is currently typing, DO NOT
     * overwrite the textarea with the runtime copy.
     */

    if (
        !editorDirty
    ) {

        fileSelector.innerHTML =
            "";

        codeFiles.forEach(
            (
                file,
                index
            ) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    index;

                option.textContent =
                    file.name;

                fileSelector.appendChild(
                    option
                );

            }
        );


        let selectedIndex = 0;


        const currentFileName =
            editorFileName ||
            runtimeData
                .project
                ?.project
                ?.selectedFile
                ?.name;


        const foundIndex =
            codeFiles.findIndex(
                file =>
                    file.name ===
                    currentFileName
            );


        if (
            foundIndex >= 0
        ) {

            selectedIndex =
                foundIndex;

        }


        fileSelector.value =
            String(
                selectedIndex
            );


        showCodeFile(
            codeFiles[selectedIndex],
            false
        );

    }

}


function showCodeFile(
    file,
    markClean = true
) {

    if (!file) return;


    editorFileName =
        file.name;


    selectedFileName.textContent =
        file.name;


    /*
     * Only replace what's inside the editor
     * when we're actually loading a file.
     */

    if (
        markClean
    ) {

        codeEditor.value =
            file.content || "";

        editorDirty =
            false;

    }


    saveStatus.textContent =
        "";

}


/* =========================================================
   SELECT CODE FILE
========================================================= */

fileSelector.addEventListener(
    "change",
    () => {

        const index =
            Number(
                fileSelector.value
            );

        const codeFiles =
            runtimeData.files.filter(
                file =>
                    file.name
                        .toLowerCase()
                        .endsWith(".cdx")
            );


        const file =
            codeFiles[index];


        if (!file) {
            return;
        }


        editorDirty =
            false;


        showCodeFile(
            file,
            true
        );

    }
);


/* =========================================================
   APPLY CODE
========================================================= */

document
    .getElementById(
        "applyCode"
    )
    .addEventListener(
        "click",
        async () => {

            const selected =
                fileSelector
                    .selectedOptions[0]
                    ?.textContent;


            if (!selected) {

                return;

            }


            const newCode =
                codeEditor.value;


            const escapedName =
                JSON.stringify(
                    selected
                );


            const escapedCode =
                JSON.stringify(
                    newCode
                );


            const expression = `(() => {

                if (
                    !window.CodeOSDevToolsAPI
                ) {

                    return {
                        success: false,
                        message:
                            "CodeOS DevTools bridge not available."
                    };

                }

                return window.CodeOSDevToolsAPI
                    .updateFile(
                        ${escapedName},
                        ${escapedCode}
                    );

            })()`;


            const button =
                document.getElementById(
                    "applyCode"
                );


            button.disabled =
                true;

            button.textContent =
                "⚡ Applying...";


            const response =
                await evaluatePage(
                    expression
                );


            if (
                !response.success ||
                !response.result
            ) {

                saveStatus.textContent =
                    "❌ Could not communicate with CodeOS.";

                button.disabled =
                    false;

                button.textContent =
                    "⚡ Apply Changes & Restart";

                return;

            }


            if (
                response.result.success
            ) {

                editorDirty =
    false;

                saveStatus.textContent =
                    `✓ ${response.result.message} Restarting...`;

                codeEditor
                    .classList
                    .add(
                        "codeSavedGlow"
                    );


                setTimeout(
                    () => {

                        chrome.devtools
                            .inspectedWindow
                            .reload({

                                ignoreCache:
                                    true

                            });

                    },
                    650
                );

                

            }
            else {

                saveStatus.textContent =
                    "❌ " +
                    (
                        response.result.message ||
                        "Update failed."
                    );

            }


            button.disabled =
                false;

            button.textContent =
                "⚡ Apply Changes & Restart";

        }
    );


/* =========================================================
   FILES / NETWORK
========================================================= */

function renderFiles(
    filter = ""
) {

    networkFileList.innerHTML =
        "";


    const normalized =
        filter
            .trim()
            .toLowerCase();


    const filtered =
        runtimeData.files.filter(
            file =>
                !normalized ||
                file.name
                    .toLowerCase()
                    .includes(
                        normalized
                    )
        );


    if (!filtered.length) {

        networkFileList.innerHTML =
            `
                <div class="networkEmpty">
                    📡
                    <br><br>
                    No matching project files.
                </div>
            `;

        return;

    }


    filtered.forEach(
        file => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "networkFileRow";


            const extension =
                file.name.includes(".")
                    ? file.name
                        .split(".")
                        .pop()
                        .toUpperCase()
                    : "FILE";


            const size =
                formatBytes(
                    file.size ||
                    String(
                        file.content ||
                        ""
                    ).length
                );


            row.innerHTML = `

                <div class="networkFileName">

                    <span class="networkIcon">
                        ${escapeHTML(
                            file.icon ||
                            "📄"
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            file.name
                        )}
                    </span>

                </div>

                <div class="networkType">
                    ${escapeHTML(
                        extension
                    )}
                </div>

                <div class="networkSize">
                    ${size}
                </div>

                <div class="networkLocation">
                    ${
                        file.folder
                            ? "📁 " +
                              escapeHTML(
                                  file.folder
                              )
                            : "root"
                    }
                </div>

            `;


            /* Click a CDX file → open it in Code panel */

            row.addEventListener(
                "dblclick",
                () => {

                    if (
                        file.name
                            .toLowerCase()
                            .endsWith(
                                ".cdx"
                            )
                    ) {

                        const codeButton =
                            document.querySelector(
                                '[data-view="code"]'
                            );

                        codeButton?.click();

                        const codeFiles =
                            runtimeData.files
                                .filter(
                                    item =>
                                        item.name
                                            .toLowerCase()
                                            .endsWith(
                                                ".cdx"
                                            )
                                );

                        const index =
                            codeFiles.indexOf(
                                file
                            );

                        if (
                            index >= 0
                        ) {

                            fileSelector.value =
                                String(
                                    index
                                );

                            showCodeFile(
                                file
                            );

                        }

                    }

                }
            );


            networkFileList.appendChild(
                row
            );

        }
    );

}


fileSearch.addEventListener(
    "input",
    () => {

        renderFiles(
            fileSearch.value
        );

    }
);


/* =========================================================
   SPRITES
========================================================= */

function renderSprites() {

    spriteGrid.innerHTML =
        "";


    const entries =
        Object.entries(
            runtimeData.sprites
        );


    if (!entries.length) {

        spriteGrid.innerHTML =
            `
                <div class="emptyState">
                    👾
                    <br>
                    No sprites are currently running.
                </div>
            `;

        return;

    }


    entries.forEach(
        (
            [name, sprite]
        ) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "objectCard";


            card.innerHTML = `

                <div class="objectTop">

                    <div class="objectIcon">
                        👾
                    </div>

                    <div class="objectName">
                        ${escapeHTML(name)}
                    </div>

                </div>

                <div class="objectInfo">

                    x: ${safeValue(sprite.x)}
                    <br>

                    y: ${safeValue(sprite.y)}
                    <br>

                    width:
                    ${safeValue(sprite.width)}

                    <br>

                    height:
                    ${safeValue(sprite.height)}

                    <br>

                    image:
                    ${escapeHTML(
                        String(
                            sprite.image ||
                            "none"
                        )
                    )}

                </div>

            `;


            spriteGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   STATE
========================================================= */

function renderState() {

    stateGrid.innerHTML =
        "";


    const entries =
        Object.entries(
            runtimeData.variables
        );


    if (!entries.length) {

        stateGrid.innerHTML =
            `
                <div class="emptyState">
                    📦
                    <br>
                    No runtime variables detected.
                </div>
            `;

        return;

    }


    entries.forEach(
        (
            [name, value]
        ) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "variableCard";


            card.innerHTML = `

                <div class="variableTop">

                    <div class="objectIcon">
                        📦
                    </div>

                    <div class="variableName">
                        ${escapeHTML(name)}
                    </div>

                </div>

                <div class="variableValue">
                    ${escapeHTML(
                        formatValue(value)
                    )}
                </div>

            `;


            stateGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CONSOLE
========================================================= */

function renderConsole() {

    consoleBox.innerHTML =
        "";


    const output =
        runtimeData.output;


    if (!output) {

        consoleBox.innerHTML =
            `
                <div class="consoleLine">

                    <span class="consolePrompt">
                        CDX
                    </span>

                    No output yet.

                </div>
            `;

        return;

    }


    output
        .split("\n")
        .forEach(
            line => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "consoleLine";


                div.innerHTML =
                    `
                        <span class="consolePrompt">
                            &gt;
                        </span>

                        ${escapeHTML(
                            line
                        )}
                    `;


                consoleBox.appendChild(
                    div
                );

            }
        );

}


/* =========================================================
   RENDER
========================================================= */

function renderAll() {

    renderInspector();

    renderCode();

    renderFiles(
        fileSearch.value
    );

    renderSprites();

    renderState();

    renderConsole();

}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function formatValue(
    value
) {

    if (
        typeof value ===
        "string"
    ) {

        return `"${value}"`;

    }


    if (
        typeof value ===
            "object" &&
        value !== null
    ) {

        try {

            return JSON.stringify(
                value
            );

        } catch {

            return "[Object]";

        }

    }


    return String(
        value
    );

}


function safeValue(
    value
) {

    if (
        value ===
            undefined ||
        value ===
            null
    ) {

        return "—";

    }

    return escapeHTML(
        String(value)
    );

}


function formatBytes(
    bytes
) {

    bytes =
        Number(bytes) || 0;


    if (
        bytes < 1024
    ) {

        return bytes +
            " B";

    }


    if (
        bytes < 1024 * 1024
    ) {

        return (
            bytes /
            1024
        ).toFixed(1) +
            " KB";

    }


    return (
        bytes /
        (1024 * 1024)
    ).toFixed(1) +
        " MB";

}


/* =========================================================
   REFRESH
========================================================= */

document
    .getElementById(
        "refreshButton"
    )
    .addEventListener(
        "click",
        inspectCodeOS
    );


/* =========================================================
   CLEAR CONSOLE
========================================================= */

document
    .getElementById(
        "clearConsole"
    )
    .addEventListener(
        "click",
        () => {

            consoleBox.innerHTML =
                `
                    <div class="consoleLine">

                        <span class="consolePrompt">
                            CDX
                        </span>

                        Console cleared.

                    </div>
                `;

        }
    );


/* =========================================================
   INITIALIZE
========================================================= */

inspectCodeOS();


/*
 * Refresh runtime information periodically.
 */

setInterval(
    inspectCodeOS,
    1500
);

/* =========================================================
   ✏️ DETECT USER EDITING
========================================================= */

codeEditor.addEventListener(
    "input",
    () => {

        editorDirty =
            true;

        saveStatus.textContent =
            "● Unsaved DevTools changes";

    }
);