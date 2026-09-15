import {
    db,
    auth
} from "./firebase.js";

import {
    ref,
    push,
    set,
    get,
    remove,
    onValue,
    increment
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const EXTENSIONS_PATH =
    "extensions";

const INSTALLS_PATH =
    "extensionInstalls";

const LOCAL_EXTENSION_KEY =
    "codeosInstalledExtensions";


let currentUser =
    null;

let extensions =
    [];

let searchQuery =
    "";

let selectedCategory =
    "all";

let extensionFilter =
    "all";


const grid =
    document.getElementById(
        "extensionsGrid"
    );


/* ============================================================
   🎨 STYLES
============================================================ */

const style =
    document.createElement("style");

style.textContent = `

.extensionStatsBar {

    display:grid;

    grid-template-columns:
        repeat(auto-fit,minmax(170px,1fr));

    gap:14px;

    margin:20px 0;

}

.extensionStat {

    padding:17px;

    border-radius:18px;

    background:
        rgba(255,255,255,.04);

    border:
        1px solid
        rgba(255,255,255,.08);

}

.extensionStat strong {

    display:block;

    font-size:27px;

}

.extensionStat span {

    color:#999eb5;

    font-size:13px;

}


.extensionToolbar {

    display:flex;

    gap:12px;

    margin-bottom:14px;

}

.extensionSearchWrap {

    flex:1;

    display:flex;

    align-items:center;

    gap:10px;

    padding:0 15px;

    border-radius:15px;

    background:
        rgba(255,255,255,.04);

    border:
        1px solid
        rgba(255,255,255,.08);

}

.extensionSearchWrap input {

    width:100%;

    border:0;
    outline:0;

    background:transparent;

    color:inherit;

    padding:14px 0;

}


.extensionToolbar select {

    border-radius:15px;

    background:#151724;

    color:white;

    padding:0 14px;

    border:
        1px solid
        rgba(255,255,255,.09);

}


.extensionTabs {

    display:flex;

    flex-wrap:wrap;

    gap:8px;

    margin-bottom:18px;

}


.extensionTab {

    border:
        1px solid
        rgba(255,255,255,.08);

    background:
        rgba(255,255,255,.035);

    color:inherit;

    padding:10px 13px;

    border-radius:12px;

    cursor:pointer;

}


.extensionTab.active {

    background:
        rgba(124,92,255,.18);

    border-color:
        rgba(124,92,255,.45);

}


.extensionsGrid {

    display:grid;

    grid-template-columns:
        repeat(
            auto-fill,
            minmax(270px,1fr)
        );

    gap:18px;

}


.extensionCard {

    overflow:hidden;

    border-radius:21px;

    border:
        1px solid
        rgba(255,255,255,.08);

    background:
        linear-gradient(
            145deg,
            rgba(255,255,255,.055),
            rgba(255,255,255,.02)
        );

    transition:.2s ease;

}

.extensionCard:hover {

    transform:
        translateY(-4px);

    border-color:
        rgba(124,92,255,.45);

}


.extensionCardHeader {

    display:flex;

    gap:13px;

    padding:19px;

}


.extensionIcon {

    width:52px;
    height:52px;

    display:grid;
    place-items:center;

    border-radius:15px;

    background:
        rgba(124,92,255,.15);

    font-size:28px;

}


.extensionCardHeader h3 {

    margin:0;

}


.extensionVersion {

    color:#9297ae;

    font-size:12px;

    margin-top:3px;

}


.extensionCardBody {

    padding:
        0 19px 19px;

}


.extensionCardBody p {

    color:#a5a9bf;

    line-height:1.45;

    min-height:65px;

}


.extensionTags {

    display:flex;

    flex-wrap:wrap;

    gap:6px;

    margin:12px 0;

}


.extensionTag {

    padding:5px 8px;

    border-radius:999px;

    background:
        rgba(255,255,255,.05);

    font-size:11px;

}


.extensionMeta {

    display:flex;

    justify-content:
        space-between;

    gap:10px;

    color:#8e93aa;

    font-size:12px;

    margin-bottom:12px;

}


.extensionActions {

    display:flex;

    gap:8px;

}


.extensionAction {

    flex:1;

    border:0;

    border-radius:12px;

    padding:11px;

    cursor:pointer;

    font-weight:800;

    color:white;

    background:
        rgba(124,92,255,.15);

}


.extensionAction.primary {

    background:
        linear-gradient(
            135deg,
            #7c5cff,
            #9a79ff
        );

}


.extensionAction.danger {

    background:
        rgba(255,80,110,.13);

}


.extensionEmpty {

    grid-column:1/-1;

    text-align:center;

    padding:55px 20px;

    color:#9498ae;

}


.extensionCreateButton {

    margin-left:auto;

    border:0;

    border-radius:13px;

    padding:11px 15px;

    cursor:pointer;

    color:white;

    font-weight:800;

    background:
        linear-gradient(
            135deg,
            #7c5cff,
            #9a79ff
        );

}


.extensionCodeEditor {

    width:100%;

    min-height:260px;

    resize:vertical;

    box-sizing:border-box;

    font-family:
        Consolas,
        monospace;

    padding:14px;

    border-radius:13px;

    border:
        1px solid
        rgba(255,255,255,.1);

    background:#0c0d14;

    color:#dce0ff;

}


.extensionInfoBox {

    margin:
        12px 0;

    padding:13px;

    border-radius:13px;

    background:
        rgba(124,92,255,.08);

    border:
        1px solid
        rgba(124,92,255,.18);

    color:#b6b9cf;

    line-height:1.45;

}


.extensionPreview {

    padding:13px;

    border-radius:13px;

    background:
        rgba(255,255,255,.04);

}


@media(max-width:700px){

    .extensionToolbar {

        flex-direction:column;

    }

}

.extensionCreatorModal {
    padding: 28px;
    box-sizing: border-box;
}

.extensionCreatorBox {
    width: min(1180px, 94vw);
    height: min(760px, 90vh);

    display: flex;
    flex-direction: column;

    overflow: hidden;

    border-radius: 28px;

    background:
        linear-gradient(
            145deg,
            #171927,
            #0e1019
        );

    border:
        1px solid
        rgba(255,255,255,.1);

    box-shadow:
        0 35px 120px
        rgba(0,0,0,.65);

    position: relative;
}


/* =========================================
   HEADER
========================================= */

.extensionCreatorHeader {

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding:
        22px 26px;

    border-bottom:
        1px solid
        rgba(255,255,255,.07);

    background:
        linear-gradient(
            180deg,
            rgba(124,92,255,.10),
            transparent
        );

}


.extensionCreatorBrand {

    display: flex;

    gap: 16px;

    align-items: center;

}


.extensionCreatorLogo {

    width: 56px;
    height: 56px;

    border-radius: 17px;

    display: grid;
    place-items: center;

    font-size: 28px;

    background:
        linear-gradient(
            135deg,
            #7c5cff,
            #a37cff
        );

    box-shadow:
        0 12px 35px
        rgba(124,92,255,.3);

}


.extensionCreatorEyebrow {

    font-size: 10px;

    font-weight: 900;

    letter-spacing: .15em;

    color:
        #9c8cff;

    margin-bottom: 4px;

}


.extensionCreatorHeader h2 {

    margin: 0;

    font-size: 25px;

}


.extensionCreatorHeader p {

    margin:
        4px 0 0;

    color:
        #979cb4;

}


.extensionCreatorClose {

    width: 40px;
    height: 40px;

    border: 0;

    border-radius: 12px;

    background:
        rgba(255,255,255,.05);

    color: white;

    cursor: pointer;

    font-size: 17px;

    transition: .2s ease;

}


.extensionCreatorClose:hover {

    background:
        rgba(255,70,100,.15);

}


/* =========================================
   CONTENT
========================================= */

.extensionCreatorContent {

    flex: 1;

    min-height: 0;

    display: grid;

    grid-template-columns:
        350px
        minmax(0,1fr);

}


/* =========================================
   LEFT SIDEBAR
========================================= */

.extensionCreatorSidebar {

    overflow-y: auto;

    padding: 22px;

    border-right:
        1px solid
        rgba(255,255,255,.07);

}


.extensionCreatorSection {

    margin-bottom: 23px;

}


.extensionSectionTitle {

    display: flex;

    align-items: center;

    gap: 8px;

    font-size: 14px;

    font-weight: 850;

}


.extensionCreatorSection
.extensionSectionTitle {

    margin-bottom: 14px;

}


.extensionField {

    margin-bottom: 13px;

}


.extensionField label {

    display: block;

    margin-bottom: 7px;

    font-size: 12px;

    font-weight: 700;

    color:
        #b2b6ca;

}


.extensionField input,
.extensionField textarea,
.extensionField select {

    width: 100%;

    box-sizing: border-box;

    border:
        1px solid
        rgba(255,255,255,.09);

    border-radius: 12px;

    background:
        rgba(255,255,255,.035);

    color: white;

    padding: 11px 12px;

    outline: none;

    font: inherit;

}


.extensionField textarea {

    min-height: 95px;

    resize: vertical;

}


.extensionField input:focus,
.extensionField textarea:focus,
.extensionField select:focus {

    border-color:
        rgba(124,92,255,.7);

    box-shadow:
        0 0 0 3px
        rgba(124,92,255,.10);

}


.extensionIconInput {

    display: flex;

    align-items: center;

    gap: 8px;

}


.extensionIconInput input {

    flex: 1;

}


.extensionLiveIconPreview {

    width: 43px;
    height: 43px;

    flex: none;

    display: grid;
    place-items: center;

    border-radius: 12px;

    background:
        rgba(124,92,255,.15);

    font-size: 22px;

}


/* =========================================
   TIP
========================================= */

.extensionStudioTip {

    display: flex;

    gap: 10px;

    padding: 13px;

    border-radius: 15px;

    background:
        rgba(124,92,255,.08);

    border:
        1px solid
        rgba(124,92,255,.18);

}


.extensionStudioTipIcon {

    font-size: 21px;

}


.extensionStudioTip strong {

    font-size: 12px;

}


.extensionStudioTip p {

    margin:
        3px 0 0;

    color:
        #9297ad;

    font-size: 11px;

    line-height: 1.4;

}


/* =========================================
   CODE AREA
========================================= */

.extensionCreatorEditor {

    min-width: 0;

    min-height: 0;

    display: flex;

    flex-direction: column;

    padding: 22px;

}


.extensionEditorTop {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 15px;

}


.extensionEditorTop p {

    margin:
        4px 0 0;

    color:
        #888da5;

    font-size: 12px;

}


.extensionCodeLanguage {

    padding:
        6px 10px;

    border-radius: 999px;

    background:
        rgba(124,92,255,.13);

    color:
        #b9adff;

    font-size: 11px;

    font-weight: 800;

}


.extensionCodeHint {

    display: flex;

    flex-wrap: wrap;

    gap: 7px;

    margin:
        14px 0;

}


.extensionCodeHint code {

    padding:
        6px 8px;

    border-radius: 8px;

    background:
        rgba(255,255,255,.04);

    color:
        #999fb7;

    font-size: 10px;

}


.extensionCodeEditor {

    flex: 1;

    min-height: 0;

    width: 100%;

    resize: none;

    box-sizing: border-box;

    padding: 18px;

    border-radius: 17px;

    border:
        1px solid
        rgba(255,255,255,.09);

    outline: none;

    background:
        #090a10;

    color:
        #e1e5ff;

    font-family:
        "Consolas",
        "Cascadia Code",
        monospace;

    font-size: 13px;

    line-height: 1.6;

    tab-size: 4;

}


.extensionCodeEditor:focus {

    border-color:
        rgba(124,92,255,.55);

    box-shadow:
        0 0 0 3px
        rgba(124,92,255,.08);

}


.extensionCreatorBottom {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 15px;

    padding-top: 15px;

}


.extensionPublishButton {

    border: 0;

    border-radius: 14px;

    padding:
        12px 18px;

    color: white;

    font-weight: 850;

    cursor: pointer;

    background:
        linear-gradient(
            135deg,
            #7c5cff,
            #9b79ff
        );

    box-shadow:
        0 10px 30px
        rgba(124,92,255,.2);

    transition:
        transform .2s ease,
        box-shadow .2s ease;

}


.extensionPublishButton:hover {

    transform:
        translateY(-2px);

    box-shadow:
        0 15px 40px
        rgba(124,92,255,.35);

}


/* =========================================
   RESPONSIVE
========================================= */

@media(max-width:900px) {

    .extensionCreatorBox {

        height:
            min(
                900px,
                94vh
            );

    }

    .extensionCreatorContent {

        grid-template-columns:
            1fr;

        overflow-y: auto;

    }

    .extensionCreatorSidebar {

        border-right: 0;

        border-bottom:
            1px solid
            rgba(255,255,255,.07);

        max-height: 45%;

    }

    .extensionCreatorEditor {

        min-height: 420px;

    }

}


@media(max-width:600px) {

    .extensionCreatorModal {

        padding: 10px;

    }

    .extensionCreatorBox {

        width: 100%;

        height: 96vh;

        border-radius: 20px;

    }

    .extensionCreatorHeader {

        padding: 16px;

    }

    .extensionCreatorContent {

        display: block;

    }

    .extensionCreatorSidebar {

        max-height: none;

    }

}

`;

document.head.appendChild(
    style
);


/* ============================================================
   🧰 LOCAL INSTALL STORAGE
============================================================ */

function getInstalledExtensions() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LOCAL_EXTENSION_KEY
            ) || "{}"
        );

    } catch {

        return {};

    }

}


function saveInstalledExtensions(
    extensions
) {

    localStorage.setItem(
        LOCAL_EXTENSION_KEY,
        JSON.stringify(
            extensions
        )
    );

}


/* ============================================================
   🔎 FILTERING
============================================================ */

function getFilteredExtensions() {

    let list =
        [...extensions];


    if (searchQuery) {

        list =
            list.filter(
                extension => {

                    const text =
                        [
                            extension.name,
                            extension.description,
                            extension.authorName,
                            extension.category,
                            extension.kind
                        ]
                            .join(" ")
                            .toLowerCase();

                    return text.includes(
                        searchQuery
                    );

                }
            );

    }


    if (
        selectedCategory !==
        "all"
    ) {

        list =
            list.filter(
                extension =>
                    (
                        extension.category ||
                        "other"
                    ) ===
                    selectedCategory
            );

    }


    if (
        extensionFilter ===
        "installed"
    ) {

        const installed =
            getInstalledExtensions();

        list =
            list.filter(
                extension =>
                    !!installed[
                        extension.id
                    ]
            );

    }


    if (
        extensionFilter ===
        "mine"
    ) {

        list =
            list.filter(
                extension =>
                    extension.authorId ===
                    currentUser?.uid
            );

    }


    if (
        extensionFilter ===
        "popular"
    ) {

        list.sort(
            (a,b) =>
                Number(
                    b.installs || 0
                ) -
                Number(
                    a.installs || 0
                )
        );

    }


    if (
        extensionFilter ===
        "new"
    ) {

        list.sort(
            (a,b) =>
                Number(
                    b.createdAt || 0
                ) -
                Number(
                    a.createdAt || 0
                )
        );

    }


    return list;

}


/* ============================================================
   📦 RENDER
============================================================ */

function renderExtensions() {

    if (!grid) return;

    const list =
        getFilteredExtensions();


    if (!list.length) {

        grid.innerHTML = `

            <div class="extensionEmpty">

                <div style="font-size:50px;">
                    ⚡
                </div>

                <h3>
                    No extensions found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    grid.innerHTML =
        list
            .map(
                extension =>
                    extensionCardHTML(
                        extension
                    )
            )
            .join("");


    grid
        .querySelectorAll(
            "[data-extension-details]"
        )
        .forEach(button => {

            button.onclick = () => {

                const extension =
                    extensions.find(
                        item =>
                            item.id ===
                            button.dataset
                                .extensionDetails
                    );

                if (extension) {

                    openExtensionDetails(
                        extension
                    );

                }

            };

        });


    grid
        .querySelectorAll(
            "[data-extension-toggle]"
        )
        .forEach(button => {

            button.onclick = () => {

                const extension =
                    extensions.find(
                        item =>
                            item.id ===
                            button.dataset
                                .extensionToggle
                    );

                if (extension) {

                    toggleInstall(
                        extension
                    );

                }

            };

        });

}


function extensionCardHTML(
    extension
) {

    const installed =
        !!getInstalledExtensions()[
            extension.id
        ];


    return `

        <article class="extensionCard">

            <div class="extensionCardHeader">

                <div class="extensionIcon">
                    ${escapeHTML(
                        extension.icon ||
                        "⚡"
                    )}
                </div>

                <div>

                    <h3>
                        ${escapeHTML(
                            extension.name ||
                            "Untitled Extension"
                        )}
                    </h3>

                    <div class="extensionVersion">
                        v${escapeHTML(
                            extension.version ||
                            "1.0.0"
                        )}
                    </div>

                </div>

            </div>

            <div class="extensionCardBody">

                <p>
                    ${escapeHTML(
                        extension.description ||
                        "No description."
                    )}
                </p>

                <div class="extensionTags">

                    <span class="extensionTag">
                        ${escapeHTML(
                            extension.kind ||
                            "javascript"
                        )}
                    </span>

                    <span class="extensionTag">
                        ${escapeHTML(
                            extension.category ||
                            "other"
                        )}
                    </span>

                    ${
                        extension.official
                            ? `
                                <span class="extensionTag">
                                    🛡️ Official
                                </span>
                            `
                            : ""
                    }

                </div>

                <div class="extensionMeta">

                    <span>
                        👤
                        ${escapeHTML(
                            extension.authorName ||
                            "Creator"
                        )}
                    </span>

                    <span>
                        📦
                        ${Number(
                            extension.installs ||
                            0
                        )}
                    </span>

                </div>

                <div class="extensionActions">

                    <button
                        type="button"
                        class="extensionAction"
                        data-extension-details="${extension.id}"
                    >
                        Details
                    </button>

                    <button
                        type="button"
                        class="
                            extensionAction
                            primary
                            ${installed ? "danger" : ""}
                        "
                        data-extension-toggle="${extension.id}"
                    >
                        ${
                            installed
                                ? "✓ Installed"
                                : "⚡ Install"
                        }
                    </button>

                </div>

            </div>

        </article>

    `;

}


/* ============================================================
   ⚡ INSTALL
============================================================ */

async function toggleInstall(
    extension
) {

    if (!currentUser) {

        alert(
            "🔐 Sign in to install extensions."
        );

        return;

    }


    const installed =
        getInstalledExtensions();


    if (
        installed[
            extension.id
        ]
    ) {

        delete installed[
            extension.id
        ];

        saveInstalledExtensions(
            installed
        );


        await remove(
            ref(
                db,
                `${INSTALLS_PATH}/${currentUser.uid}/${extension.id}`
            )
        );


        try {

            await set(
                ref(
                    db,
                    `${EXTENSIONS_PATH}/${extension.id}/installs`
                ),
                Math.max(
                    0,
                    Number(
                        extension.installs ||
                        1
                    ) - 1
                )
            );

        } catch {

            /* non-critical */

        }


        renderExtensions();
        renderExtensionStats();

        alert(
            `🗑️ ${extension.name} uninstalled.`
        );

        return;

    }


    /* =========================================
       SAVE FULL EXTENSION LOCALLY
    ========================================= */

    installed[
        extension.id
    ] = {

        ...extension,

        installedAt:
            Date.now(),

        enabled:
            true

    };


    saveInstalledExtensions(
        installed
    );


    await set(
        ref(
            db,
            `${INSTALLS_PATH}/${currentUser.uid}/${extension.id}`
        ),
        {
            extensionId:
                extension.id,
            version:
                extension.version ||
                "1.0.0",
            installedAt:
                Date.now()
        }
    );


    await set(
        ref(
            db,
            `${EXTENSIONS_PATH}/${extension.id}/installs`
        ),
        Number(
            extension.installs ||
            0
        ) + 1
    );


    renderExtensions();
    renderExtensionStats();


    alert(
        `⚡ ${extension.name} installed!\n\nOpen CodeOS Workspace to use it.`
    );

}


/* ============================================================
   🔍 DETAILS
============================================================ */

function openExtensionDetails(
    extension
) {

    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "modal";


    const kind =
        extension.kind ||
        "javascript";


    const example =
        kind === "theme"
            ? `/* Theme extension */
:root {
    --accent-color: #00e5ff;
}`
            : `// CodeOS Extension
// Example command

CodeOS.commands.register(
    "My Command",
    () => {
        CodeOS.ui.toast(
            "Hello from my extension!"
        );
    },
    {
        icon: "🚀"
    }
);`;


    modal.innerHTML = `

        <div class="modalBox">

            <button
                class="closeModal"
                id="closeExtensionDetails"
            >
                ✕
            </button>

            <div
                style="
                    display:flex;
                    gap:14px;
                    align-items:center;
                "
            >

                <div
                    style="
                        font-size:48px;
                    "
                >
                    ${escapeHTML(
                        extension.icon ||
                        "⚡"
                    )}
                </div>

                <div>

                    <h2>
                        ${escapeHTML(
                            extension.name ||
                            "Extension"
                        )}
                    </h2>

                    <p>
                        v${escapeHTML(
                            extension.version ||
                            "1.0.0"
                        )}
                        ·
                        ${escapeHTML(
                            kind
                        )}
                    </p>

                </div>

            </div>

            <div class="extensionInfoBox">

                ${escapeHTML(
                    extension.description ||
                    "No description."
                )}

            </div>

            <strong>
                ⚙ Extension capabilities
            </strong>

            <div class="extensionPreview">

                ${
                    kind === "theme"
                        ? `
                            🎨 This extension can
                            restyle the CodeOS Workspace.
                        `
                        : `
                            🧩 This extension can
                            register CodeOS commands,
                            UI features, snippets,
                            panels and tools.
                        `
                }

            </div>

            <strong>
                💻 Extension code
            </strong>

            <pre
                style="
                    max-height:300px;
                    overflow:auto;
                    padding:13px;
                    border-radius:13px;
                    background:#0b0c12;
                    color:#dfe3ff;
                "
            ><code>${escapeHTML(
                extension.code ||
                example
            )}</code></pre>

            <button
                class="publishBtn"
                id="extensionDetailInstall"
                type="button"
            >
                ${
                    getInstalledExtensions()[
                        extension.id
                    ]
                        ? "✓ Installed"
                        : "⚡ Install Extension"
                }
            </button>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelector(
            "#closeExtensionDetails"
        )
        .onclick =
            () => modal.remove();


    modal
        .querySelector(
            "#extensionDetailInstall"
        )
        .onclick =
            async () => {

                await toggleInstall(
                    extension
                );

                modal.remove();

            };


    window.codeosOpenExtension =
        openExtensionDetails;

}


/* ============================================================
   ➕ CREATE EXTENSION
============================================================ */

document
    .getElementById(
        "createExtensionBtn"
    )
    ?.addEventListener(
        "click",
        openCreateExtension
    );


function openCreateExtension() {

    if (!currentUser) {

        alert(
            "🔐 Sign in to create an extension."
        );

        return;

    }

    const modal =
        document.createElement("div");

    modal.className = "modal extensionCreatorModal";

    modal.innerHTML = `

        <div class="extensionCreatorBox">

            <!-- =========================================
                 HEADER
            ========================================== -->

            <div class="extensionCreatorHeader">

                <div class="extensionCreatorBrand">

                    <div class="extensionCreatorLogo">
                        ⚡
                    </div>

                    <div>

                        <div class="extensionCreatorEyebrow">
                            CODEOS EXTENSION STUDIO
                        </div>

                        <h2>
                            Create an Extension
                        </h2>

                        <p>
                            Build something that becomes part of CodeOS.
                        </p>

                    </div>

                </div>

                <button
                    id="closeCreateExtension"
                    class="extensionCreatorClose"
                    type="button"
                >
                    ✕
                </button>

            </div>


            <!-- =========================================
                 MAIN WORKSPACE
            ========================================== -->

            <div class="extensionCreatorContent">

                <!-- =====================================
                     LEFT SIDE — DETAILS
                ====================================== -->

                <section class="extensionCreatorSidebar">

                    <div class="extensionCreatorSection">

                        <div class="extensionSectionTitle">
                            <span>🪪</span>
                            Extension Identity
                        </div>

                        <div class="extensionField">

                            <label>
                                Extension Name
                            </label>

                            <input
                                id="extensionName"
                                type="text"
                                maxlength="60"
                                placeholder="Super Tools"
                            />

                        </div>


                        <div class="extensionField">

                            <label>
                                Description
                            </label>

                            <textarea
                                id="extensionDescription"
                                maxlength="500"
                                placeholder="What does your extension add to CodeOS?"
                            ></textarea>

                        </div>


                        <div class="extensionField">

                            <label>
                                Icon
                            </label>

                            <div class="extensionIconInput">

                                <input
                                    id="extensionIcon"
                                    type="text"
                                    maxlength="4"
                                    placeholder="🧩"
                                />

                                <span>
                                    Preview
                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="extensionCreatorSection">

                        <div class="extensionSectionTitle">
                            <span>⚙️</span>
                            Configuration
                        </div>

                        <div class="extensionField">

                            <label>
                                Extension Type
                            </label>

                            <select id="extensionKind">

                                <option value="javascript">
                                    🧩 JavaScript Functionality
                                </option>

                                <option value="theme">
                                    🎨 Theme / Redecor
                                </option>

                            </select>

                        </div>


                        <div class="extensionField">

                            <label>
                                Category
                            </label>

                            <select id="extensionCategory">

                                <option value="developer">
                                    Developer
                                </option>

                                <option value="productivity">
                                    Productivity
                                </option>

                                <option value="design">
                                    Design
                                </option>

                                <option value="education">
                                    Education
                                </option>

                                <option value="games">
                                    Games
                                </option>

                                <option value="utilities">
                                    Utilities
                                </option>

                                <option value="other">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div class="extensionField">

                            <label>
                                Version
                            </label>

                            <input
                                id="extensionVersion"
                                type="text"
                                value="1.0.0"
                                maxlength="20"
                                placeholder="1.0.0"
                            />

                        </div>

                    </div>


                    <div class="extensionCreatorSection">

                        <div class="extensionSectionTitle">
                            <span>📚</span>
                            Documentation
                        </div>

                        <div class="extensionField">

                            <label>
                                Repository / Documentation URL
                            </label>

                            <input
                                id="extensionRepository"
                                type="url"
                                placeholder="https://github.com/..."
                            />

                        </div>

                    </div>

                    <div class="extensionStudioTip">

                        <div class="extensionStudioTipIcon">
                            💡
                        </div>

                        <div>

                            <strong>
                                Build for CodeOS
                            </strong>

                            <p>
                                Extensions can add commands,
                                buttons, panels, snippets,
                                editor tools, files and themes.
                            </p>

                        </div>

                    </div>

                </section>


                <!-- =====================================
                     RIGHT SIDE — CODE
                ====================================== -->

                <section class="extensionCreatorEditor">

                    <div class="extensionEditorTop">

                        <div>

                            <div class="extensionSectionTitle">
                                <span>💻</span>
                                Extension Code
                            </div>

                            <p>
                                Write the code that powers your extension.
                            </p>

                        </div>

                        <div
                            id="extensionCodeLanguage"
                            class="extensionCodeLanguage"
                        >
                            JavaScript
                        </div>

                    </div>


                    <div class="extensionCodeHint">

                        <code>
                            CodeOS.commands.register(...)
                        </code>

                        <code>
                            CodeOS.ui.addButton(...)
                        </code>

                        <code>
                            CodeOS.ui.addPanel(...)
                        </code>

                    </div>


                    <textarea
                        id="extensionCode"
                        class="extensionCodeEditor"
                        spellcheck="false"
                        placeholder="// Your CodeOS extension starts here...

CodeOS.commands.register(
    'My Command',
    () => {
        CodeOS.ui.toast('Hello from my extension!');
    },
    {
        icon: '🚀'
    }
);"
                    ></textarea>


                    <div class="extensionCreatorBottom">

                        <div
                            id="extensionCreateStatus"
                            class="authStatus"
                        ></div>

                        <button
                            id="publishExtensionBtn"
                            class="extensionPublishButton"
                            type="button"
                        >
                            🚀 Publish Extension
                        </button>

                    </div>

                </section>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    /* =====================================================
       CLOSE
    ===================================================== */

    modal
        .querySelector(
            "#closeCreateExtension"
        )
        .onclick = () => {

            modal.remove();

        };


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.remove();

            }

        }
    );


    /* =====================================================
       ICON PREVIEW
    ===================================================== */

    const iconInput =
        modal.querySelector(
            "#extensionIcon"
        );

    const iconPreview =
        document.createElement(
            "div"
        );

    iconPreview.className =
        "extensionLiveIconPreview";

    iconPreview.textContent =
        "🧩";

    iconInput.parentElement.prepend(
        iconPreview
    );

    iconInput.addEventListener(
        "input",
        () => {

            iconPreview.textContent =
                iconInput.value ||
                "🧩";

        }
    );


    /* =====================================================
       TYPE SWITCHER
    ===================================================== */

    const kindSelect =
        modal.querySelector(
            "#extensionKind"
        );

    const languageLabel =
        modal.querySelector(
            "#extensionCodeLanguage"
        );

    const codeEditor =
        modal.querySelector(
            "#extensionCode"
        );


    kindSelect.addEventListener(
        "change",
        () => {

            if (
                kindSelect.value ===
                "theme"
            ) {

                languageLabel.textContent =
                    "CSS";

                codeEditor.placeholder =
`/* Your CodeOS theme */

body {
    background: #10111b;
}

.topbar {
    background: #161827;
}

:root {
    --accent-color: #7c5cff;
}`;

            } else {

                languageLabel.textContent =
                    "JavaScript";

                codeEditor.placeholder =
`// Your CodeOS extension

CodeOS.commands.register(
    'My Command',
    () => {
        CodeOS.ui.toast(
            'Hello from my extension!'
        );
    },
    {
        icon: '🚀'
    }
);`;

            }

        }
    );


    /* =====================================================
       PUBLISH
    ===================================================== */

    modal
        .querySelector(
            "#publishExtensionBtn"
        )
        .onclick = () => {

            publishExtension(
                modal
            );

        };

}


/* ============================================================
   🚀 PUBLISH
============================================================ */

async function publishExtension(
    modal
) {

    const name =
        modal
            .querySelector(
                "#extensionName"
            )
            .value
            .trim();


    const description =
        modal
            .querySelector(
                "#extensionDescription"
            )
            .value
            .trim();


    const icon =
        modal
            .querySelector(
                "#extensionIcon"
            )
            .value
            .trim() ||
        "⚡";


    const kind =
        modal
            .querySelector(
                "#extensionKind"
            )
            .value;


    const category =
        modal
            .querySelector(
                "#extensionCategory"
            )
            .value;


    const version =
        modal
            .querySelector(
                "#extensionVersion"
            )
            .value
            .trim() ||
        "1.0.0";


    const code =
        modal
            .querySelector(
                "#extensionCode"
            )
            .value;


    const repository =
        modal
            .querySelector(
                "#extensionRepository"
            )
            .value
            .trim();


    const status =
        modal
            .querySelector(
                "#extensionCreateStatus"
            );


    if (!name) {

        status.innerText =
            "⚠️ Give the extension a name.";

        return;

    }


    if (!description) {

        status.innerText =
            "⚠️ Add a description.";

        return;

    }


    if (!code.trim()) {

        status.innerText =
            "⚠️ Add your extension code.";

        return;

    }


    try {

        const profileSnapshot =
            await get(
                ref(
                    db,
                    `users/${currentUser.uid}`
                )
            );


        const profile =
            profileSnapshot.exists()
                ? profileSnapshot.val()
                : {};


        const extensionRef =
            push(
                ref(
                    db,
                    EXTENSIONS_PATH
                )
            );


        await set(
            extensionRef,
            {

                name,

                description,

                icon,

                kind,

                category,

                version,

                code,

                repository,

                authorId:
                    currentUser.uid,

                authorName:
                    profile.username ||
                    currentUser.displayName ||
                    "CodeOS Creator",

                installs: 0,

                official: false,

                active: true,

                createdAt:
                    Date.now()

            }
        );


        alert(
            `⚡ "${name}" published!`
        );


        modal.remove();


    } catch (error) {

        console.error(
            "Extension publish error:",
            error
        );

        status.innerText =
            "❌ " +
            error.message;

    }

}


/* ============================================================
   📊 STATS
============================================================ */

function renderExtensionStats() {

    const bar =
        document.getElementById(
            "extensionStatsBar"
        );

    if (!bar) return;


    const installed =
        Object.keys(
            getInstalledExtensions()
        ).length;


    const installs =
        extensions.reduce(
            (
                total,
                extension
            ) =>
                total +
                Number(
                    extension.installs ||
                    0
                ),
            0
        );


    const creators =
        new Set(
            extensions
                .map(
                    extension =>
                        extension.authorId
                )
                .filter(Boolean)
        ).size;


    bar.innerHTML = `

        <div class="extensionStat">

            <strong>
                ${extensions.length}
            </strong>

            <span>
                Published Extensions
            </span>

        </div>

        <div class="extensionStat">

            <strong>
                ${installed}
            </strong>

            <span>
                Installed by You
            </span>

        </div>

        <div class="extensionStat">

            <strong>
                ${installs}
            </strong>

            <span>
                Community Installs
            </span>

        </div>

        <div class="extensionStat">

            <strong>
                ${creators}
            </strong>

            <span>
                Creators
            </span>

        </div>

    `;

}


/* ============================================================
   🔥 FIREBASE
============================================================ */

function loadExtensions() {

    onValue(
        ref(
            db,
            EXTENSIONS_PATH
        ),
        snapshot => {

            extensions = [];

            if (snapshot.exists()) {

                snapshot.forEach(
                    child => {

                        extensions.push({

                            id:
                                child.key,

                            ...child.val()

                        });

                    }
                );

            }


            renderExtensions();

            renderExtensionStats();

        }
    );

}


/* ============================================================
   🔧 ESCAPE
============================================================ */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}


/* ============================================================
   🔎 EVENTS
============================================================ */

document
    .getElementById(
        "extensionSearchInput"
    )
    ?.addEventListener(
        "input",
        event => {

            searchQuery =
                event.target.value
                    .trim()
                    .toLowerCase();

            renderExtensions();

        }
    );


document
    .getElementById(
        "extensionCategoryFilter"
    )
    ?.addEventListener(
        "change",
        event => {

            selectedCategory =
                event.target.value;

            renderExtensions();

        }
    );


document
    .querySelectorAll(
        ".extensionTab"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".extensionTab"
                        )
                        .forEach(
                            tab =>
                                tab.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    extensionFilter =
                        button.dataset
                            .extensionFilter ||
                        "all";


                    renderExtensions();

                }
            );

        }
    );


/* ============================================================
   👤 AUTH
============================================================ */

onAuthStateChanged(
    auth,
    user => {

        currentUser =
            user;

        renderExtensions();
        renderExtensionStats();

    }
);


/* ============================================================
   🚀 START
============================================================ */

loadExtensions();


window.codeosOpenExtension =
    openExtensionDetails;