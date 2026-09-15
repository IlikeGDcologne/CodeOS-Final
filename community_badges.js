import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    ref,
    get,
    push,
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/* ============================================================
   🏅 CODEOS BADGE SYSTEM
   Moderator Badge Granting
============================================================ */


/* ============================================================
   🐾 ALL ANIMALS
============================================================ */

const ANIMAL_BADGES = [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🦅",
    "🦉",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🦂",
    "🐢",
    "🐍",
    "🦎",
    "🦖",
    "🦕",
    "🐙",
    "🦑",
    "🦀",
    "🐠",
    "🐟",
    "🐡",
    "🐬",
    "🐳",
    "🦈"
];


/* ============================================================
   🍔 ALL FOOD
============================================================ */

const FOOD_BADGES = [
    "🍎",
    "🍊",
    "🍋",
    "🍉",
    "🍇",
    "🍓",
    "🍒",
    "🍑",
    "🍍",
    "🥝",
    "🍕",
    "🍔",
    "🍟",
    "🌮",
    "🌯",
    "🍩",
    "🍪",
    "🍰",
    "🧁",
    "🍫",
    "🍿"
];


/* ============================================================
   💀 ALL MEME
============================================================ */

const MEME_BADGES = [
    "💀",
    "🥀",
    "😭",
    "👾",
    "😎"
];


/* ============================================================
   BADGE CATALOG
============================================================ */

const BADGE_CATEGORIES = {
    animals: {
        name: "ALL ANIMALS",
        icon: "🐾",
        badges: ANIMAL_BADGES
    },

    food: {
        name: "ALL FOOD",
        icon: "🍔",
        badges: FOOD_BADGES
    },

    meme: {
        name: "ALL MEME",
        icon: "💀",
        badges: MEME_BADGES
    }
};


/* ============================================================
   SECURITY
============================================================ */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


/* ============================================================
   GET CURRENT PROFILE
============================================================ */

async function getCurrentProfile() {

    const user =
        auth.currentUser;

    if (!user) {
        return null;
    }

    const snapshot =
        await get(
            ref(
                db,
                `users/${user.uid}`
            )
        );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        uid: user.uid,
        ...snapshot.val()
    };
}


/* ============================================================
   👑 ELDER MODERATOR CHECK
============================================================ */

async function isElderModerator() {

    const profile =
        await getCurrentProfile();

    return (
        profile?.username ===
        "ron_weasley"
    );
}


/* ============================================================
   CREATE MODERATOR TOOL
============================================================ */

function createGrantBadgeTool() {

    const moderationTools =
        document.getElementById(
            "moderationTools"
        );

    if (!moderationTools) {
        return;
    }

    if (
        document.getElementById(
            "grantBadgeModeratorCard"
        )
    ) {
        return;
    }

    const card =
        document.createElement(
            "div"
        );

    card.id =
        "grantBadgeModeratorCard";

    card.className =
        "moderatorToolCard";

    card.innerHTML = `

        <div class="moderatorToolIcon">
            🏅
        </div>

        <div class="moderatorToolInfo">

            <h3>
                Grant Badge
            </h3>

            <p>
                Give a CodeOS community member
                one of the official badge emojis.
            </p>

        </div>

        <button
            id="grantBadgeModeratorBtn"
            type="button"
            class="moderatorPrimaryButton"
        >
            🏅 Grant Badge
        </button>

    `;

    moderationTools.appendChild(
        card
    );

    document
        .getElementById(
            "grantBadgeModeratorBtn"
        )
        ?.addEventListener(
            "click",
            openGrantBadgeTool
        );

    updateGrantBadgeVisibility();
}


/* ============================================================
   SHOW/HIDE TOOL
============================================================ */

async function updateGrantBadgeVisibility() {

    const card =
        document.getElementById(
            "grantBadgeModeratorCard"
        );

    if (!card) {
        return;
    }

    const allowed =
        await isElderModerator();

    card.style.display =
        allowed
            ? "flex"
            : "none";
}


/* ============================================================
   OPEN GRANT BADGE TOOL
============================================================ */

async function openGrantBadgeTool() {

    const allowed =
        await isElderModerator();

    if (!allowed) {
        alert(
            "💎 Only the Elder Moderator can grant badges."
        );

        return;
    }

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "grantBadgeOverlay";

    overlay.className =
        "projectModerationOverlay";

    overlay.innerHTML = `

        <div
            class="projectModerationModal"
            style="
                width:min(820px,94vw);
                max-height:88vh;
                overflow:auto;
            "
        >

            <button
                type="button"
                class="projectModerationClose"
                id="closeGrantBadge"
            >
                ✕
            </button>

            <div class="projectModerationHeader">

                <div
                    class="projectModerationHeaderIcon"
                >
                    🏅
                </div>

                <div>

                    <h2>
                        Grant Badge
                    </h2>

                    <p>
                        Award an official CodeOS badge
                    </p>

                </div>

            </div>

            <div class="projectModerationContent">

                <div class="moderatorToolIntro">

                    <span>
                        💎
                    </span>

                    <p>
                        Choose a community member,
                        then choose the badge they should own.
                    </p>

                </div>

                <label
                    style="
                        display:block;
                        margin:18px 0 8px;
                        font-weight:700;
                    "
                >
                    Search Member
                </label>

                <input
                    id="grantBadgeUserSearch"
                    class="moderatorToolSearch"
                    type="search"
                    placeholder="🔎 Search username..."
                    autocomplete="off"
                />

                <div
                    id="grantBadgeUserResults"
                    class="moderatorToolResults"
                >
                    Start typing to find a member.
                </div>

                <div
                    id="grantBadgeSelectedUser"
                    style="
                        margin-top:18px;
                        padding:14px;
                        border-radius:14px;
                        display:none;
                    "
                ></div>

                <div
                    id="grantBadgePicker"
                    style="
                        margin-top:20px;
                        display:none;
                    "
                >

                    <h3>
                        🏅 Choose Badge
                    </h3>

                    <div
                        id="grantBadgeCategories"
                    ></div>

                    <div
                        id="grantBadgePreview"
                        style="
                            margin-top:18px;
                            padding:18px;
                            border-radius:16px;
                            text-align:center;
                            display:none;
                        "
                    ></div>

                    <button
                        id="confirmGrantBadgeBtn"
                        type="button"
                        class="moderatorPrimaryButton"
                        style="
                            margin-top:18px;
                            width:100%;
                            display:none;
                        "
                    >
                        🏅 Grant Selected Badge
                    </button>

                </div>

                <div
                    id="grantBadgeStatus"
                    class="moderatorStatus"
                    style="margin-top:15px;"
                ></div>

            </div>

        </div>

    `;

    document.body.appendChild(
        overlay
    );


    /* ========================================================
       CLOSE
    ======================================================== */

    document
        .getElementById(
            "closeGrantBadge"
        )
        ?.addEventListener(
            "click",
            () => overlay.remove()
        );

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                overlay.remove();

            }

        }
    );


    /* ========================================================
       SEARCH
    ======================================================== */

    document
        .getElementById(
            "grantBadgeUserSearch"
        )
        ?.addEventListener(
            "input",
            searchUsersForBadge
        );


    /* ========================================================
       BADGE UI
    ======================================================== */

    renderBadgeCategories();
}


/* ============================================================
   SELECTED USER
============================================================ */

let selectedBadgeUser = null;

let selectedBadge = null;


/* ============================================================
   SEARCH USERS
============================================================ */

async function searchUsersForBadge() {

    const input =
        document.getElementById(
            "grantBadgeUserSearch"
        );

    const container =
        document.getElementById(
            "grantBadgeUserResults"
        );

    if (!input || !container) {
        return;
    }

    const query =
        input.value
            .trim()
            .toLowerCase();

    selectedBadgeUser =
        null;

    selectedBadge =
        null;

    document
        .getElementById(
            "grantBadgeSelectedUser"
        )
        .style.display =
            "none";

    document
        .getElementById(
            "grantBadgePicker"
        )
        .style.display =
            "none";

    if (!query) {

        container.innerHTML =
            "Start typing to find a member.";

        return;
    }

    container.innerHTML =
        "🔎 Searching...";


    const snapshot =
        await get(
            ref(
                db,
                "users"
            )
        );

    if (!snapshot.exists()) {

        container.innerHTML =
            "No users found.";

        return;
    }

    container.innerHTML =
        "";

    let found =
        false;


    snapshot.forEach(
        child => {

            const uid =
                child.key;

            const user =
                child.val();

            const username =
                String(
                    user.username || ""
                );


            if (
                !username
                    .toLowerCase()
                    .includes(query)
            ) {
                return;
            }


            found =
                true;


            const badgeCount =
                Object.keys(
                    user.badges || {}
                ).length;


            const card =
                document.createElement(
                    "button"
                );

            card.type =
                "button";

            card.className =
                "moderatorUserCard";

            card.style =
                `
                    width:100%;
                    text-align:left;
                    border:0;
                    cursor:pointer;
                    color:inherit;
                `;


            card.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            user.username ||
                            "CodeOS Member"
                        )}
                    </strong>

                    <span>
                        ${
                            user.role ===
                            "member"
                                ? "👤 Member"
                                : escapeHTML(
                                    user.role ||
                                    "Member"
                                )
                        }
                    </span>

                </div>

                <span>
                    🏅 ${badgeCount}
                </span>

            `;


            card.addEventListener(
                "click",
                () => {

                    selectBadgeUser(
                        uid,
                        user
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );


    if (!found) {

        container.innerHTML = `
            <div class="moderatorEmpty">
                😕 No matching users.
            </div>
        `;

    }

}


/* ============================================================
   SELECT USER
============================================================ */

function selectBadgeUser(
    uid,
    user
) {

    selectedBadgeUser = {
        uid,
        ...user
    };

    selectedBadge =
        null;


    const selectedBox =
        document.getElementById(
            "grantBadgeSelectedUser"
        );

    const picker =
        document.getElementById(
            "grantBadgePicker"
        );

    if (!selectedBox || !picker) {
        return;
    }


    selectedBox.style.display =
        "block";


    selectedBox.innerHTML = `

        <div
            style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:15px;
            "
        >

            <div>

                <strong>
                    👤 ${escapeHTML(
                        user.username ||
                        "CodeOS Member"
                    )}
                </strong>

                <div
                    style="
                        opacity:.7;
                        margin-top:4px;
                    "
                >
                    ${
                        Object.keys(
                            user.badges || {}
                        ).length
                    } owned badges
                </div>

            </div>

            <span>
                ✓ Selected
            </span>

        </div>

    `;


    picker.style.display =
        "block";

    renderBadgeCategories();

    showGrantBadgeStatus("");
}


/* ============================================================
   RENDER CATEGORIES
============================================================ */

function renderBadgeCategories() {

    const container =
        document.getElementById(
            "grantBadgeCategories"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "";


    Object.entries(
        BADGE_CATEGORIES
    )
    .forEach(
        ([categoryId, category]) => {

            const section =
                document.createElement(
                    "section"
                );

            section.style =
                `
                    margin-top:18px;
                `;


            section.innerHTML = `

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        margin-bottom:10px;
                    "
                >

                    <span
                        style="font-size:20px;"
                    >
                        ${category.icon}
                    </span>

                    <strong>
                        ${category.name}
                    </strong>

                </div>

                <div
                    class="grantBadgeGrid"
                    data-category="${categoryId}"
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                auto-fill,
                                minmax(58px,1fr)
                            );
                        gap:8px;
                    "
                ></div>

            `;


            const grid =
                section.querySelector(
                    ".grantBadgeGrid"
                );


            category.badges.forEach(
                badge => {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "challengeBadgeOption";


                    button.dataset.badge =
                        badge;


                    button.textContent =
                        badge;


                    button.style =
                        `
                            font-size:28px;
                            min-height:54px;
                            cursor:pointer;
                        `;


                    button.addEventListener(
                        "click",
                        () => {

                            selectBadge(
                                categoryId,
                                badge,
                                button
                            );

                        }
                    );


                    grid.appendChild(
                        button
                    );

                }
            );


            container.appendChild(
                section
            );

        }
    );

}


/* ============================================================
   SELECT BADGE
============================================================ */

function selectBadge(
    categoryId,
    badge,
    button
) {

    selectedBadge = {
        category:
            categoryId,
        icon:
            badge
    };


    document
        .querySelectorAll(
            "#grantBadgeCategories .challengeBadgeOption"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    const preview =
        document.getElementById(
            "grantBadgePreview"
        );

    const confirmButton =
        document.getElementById(
            "confirmGrantBadgeBtn"
        );


    if (preview) {

        preview.style.display =
            "block";

        preview.innerHTML = `

            <div
                style="font-size:60px;"
            >
                ${badge}
            </div>

            <strong>
                Badge selected
            </strong>

            <div
                style="opacity:.7;"
            >
                ${BADGE_CATEGORIES[
                    categoryId
                ].name}
            </div>

        `;

    }


    if (confirmButton) {

        confirmButton.style.display =
            "block";

        confirmButton.onclick =
            grantSelectedBadge;

    }

}


/* ============================================================
   GRANT BADGE
============================================================ */

async function grantSelectedBadge() {

    const allowed =
        await isElderModerator();

    if (!allowed) {

        showGrantBadgeStatus(
            "🚫 Only the Elder Moderator can grant badges."
        );

        return;
    }


    if (!selectedBadgeUser) {

        showGrantBadgeStatus(
            "⚠️ Choose a member first."
        );

        return;
    }


    if (!selectedBadge) {

        showGrantBadgeStatus(
            "⚠️ Choose a badge first."
        );

        return;
    }


    const confirmGrant =
        confirm(
            `🏅 Grant ${selectedBadge.icon} to @${selectedBadgeUser.username}?`
        );


    if (!confirmGrant) {
        return;
    }


    const badgesRef =
        ref(
            db,
            `users/${selectedBadgeUser.uid}/badges`
        );


    /* ========================================================
       CREATE BADGE
    ======================================================== */

    const badgeRef =
        push(
            badgesRef
        );


    await set(
        badgeRef,
        {

            icon:
                selectedBadge.icon,

            name:
                getBadgeDisplayName(
                    selectedBadge.icon
                ),

            category:
                selectedBadge.category,

            grantedBy:
                auth.currentUser.uid,

            grantedByUsername:
                "ron_weasley",

            earnedAt:
                serverTimestamp(),

            source:
                "moderator_grant"

        }
    );


    /* ========================================================
       NOTIFICATION
    ======================================================== */

    try {

        const notificationRef =
            push(
                ref(
                    db,
                    `notifications/${selectedBadgeUser.uid}`
                )
            );


        await set(
            notificationRef,
            {

                type:
                    "badge_granted",

                title:
                    "🏅 You received a badge!",

                message:
                    `The Elder Moderator granted you ${selectedBadge.icon} ${getBadgeDisplayName(selectedBadge.icon)}!`,

                badgeIcon:
                    selectedBadge.icon,

                badgeName:
                    getBadgeDisplayName(
                        selectedBadge.icon
                    ),

                badgeCategory:
                    selectedBadge.category,

                grantedBy:
                    auth.currentUser.uid,

                createdAt:
                    serverTimestamp(),

                read:
                    false

            }
        );

    } catch (error) {

        console.warn(
            "Badge notification could not be created:",
            error
        );

    }


    showGrantBadgeStatus(
        `✅ Granted ${selectedBadge.icon} ${getBadgeDisplayName(selectedBadge.icon)} to @${selectedBadgeUser.username}!`
    );


    /* ========================================================
       RESET BADGE SELECTION
    ======================================================== */

    selectedBadge =
        null;


    document
        .getElementById(
            "grantBadgePreview"
        )
        ?.style
        .setProperty(
            "display",
            "none"
        );


    document
        .getElementById(
            "confirmGrantBadgeBtn"
        )
        ?.style
        .setProperty(
            "display",
            "none"
        );


    document
        .querySelectorAll(
            "#grantBadgeCategories .challengeBadgeOption"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "selected"
                );

            }
        );

}


/* ============================================================
   BADGE DISPLAY NAME
============================================================ */

function getBadgeDisplayName(
    icon
) {

    if (
        ANIMAL_BADGES.includes(icon)
    ) {

        return "Animal Badge";

    }


    if (
        FOOD_BADGES.includes(icon)
    ) {

        return "Food Badge";

    }


    if (
        MEME_BADGES.includes(icon)
    ) {

        return "Meme Badge";

    }


    return "CodeOS Badge";
}


/* ============================================================
   STATUS
============================================================ */

function showGrantBadgeStatus(
    message
) {

    const status =
        document.getElementById(
            "grantBadgeStatus"
        );

    if (status) {

        status.textContent =
            message;

    }

}


/* ============================================================
   INITIALIZE
============================================================ */

function initializeBadgeSystem() {

    createGrantBadgeTool();

    updateGrantBadgeVisibility();

}


/* ============================================================
   AUTH CHANGES
============================================================ */

onAuthStateChanged(
    auth,
    async () => {

        createGrantBadgeTool();

        await updateGrantBadgeVisibility();

    }
);


/* ============================================================
   START
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeBadgeSystem
    );

} else {

    initializeBadgeSystem();

}