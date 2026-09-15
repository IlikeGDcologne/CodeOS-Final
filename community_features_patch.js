import { auth, db } from "./firebase.js";

import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    onValue,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

const CF_ELDER = "ron_weasley";

const CF = {
    communityChallenges: "communityChallenges",
    awards: "awards",
    notifications: "notifications",
    users: "users",
    posts: "posts"
};

function cfEscape(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function cfUID() {
    return auth.currentUser?.uid || null;
}

let cfMyProfile = null;
let cfAllUsers = [];
let cfAwardRecipient = null;

async function cfProfileOf(id = cfUID()) {
    if (!id) return {};

    const snapshot = await get(
        ref(db, `${CF.users}/${id}`)
    );

    return snapshot.exists()
        ? snapshot.val()
        : {};
}

async function cfRefreshMe() {
    cfMyProfile =
        await cfProfileOf();

    return cfMyProfile;
}

async function cfIsElder() {
    const profile =
        await cfRefreshMe();

    return (
        !!cfUID() &&
        profile.username === CF_ELDER
    );
}

function cfRequireLogin() {
    if (cfUID()) {
        return true;
    }

    document
        .getElementById("loginModal")
        ?.classList.remove("hidden");

    return false;
}

/* ============================================================
   PAGE NAVIGATION
   ============================================================ */

function cfOpenPage(page) {
    document
        .querySelectorAll(".navItem")
        .forEach(item =>
            item.classList.remove("active")
        );

    document
        .querySelector(
            `.navItem[data-page="${page}"]`
        )
        ?.classList.add("active");

    document
        .querySelectorAll(".page")
        .forEach(section =>
            section.classList.remove(
                "activePage"
            )
        );

    document
        .getElementById(`${page}Page`)
        ?.classList.add("activePage");

    const title =
        document.getElementById(
            "pageTitle"
        );

    const titles = {
        home: "Home",
        projects: "Projects",
        groups: "Groups",
        discuss: "Discuss",
        challenges: "Challenges",
        notifications: "Notifications",
        awards: "Awards",
        extensions: "Extensions",
        profile: "My Profile",
        settings: "Settings"
    };

    if (title) {
        title.textContent =
            titles[page] ||
            "Community";
    }
}

/* ============================================================
   COMMUNITY SEARCH
   ============================================================ */

function setupCFCommunitySearch() {
    const input =
        document.getElementById(
            "communitySearch"
        );

    if (
        !input ||
        input.dataset.cfReady
    ) {
        return;
    }

    input.dataset.cfReady = "1";

    input.placeholder =
        "Search community...";

    const results =
        document.createElement("div");

    results.id =
        "cfSearchResults";

    results.className =
        "cfSearchResults hidden";

    document
        .querySelector(".topbar")
        ?.appendChild(results);

    input.addEventListener(
        "input",
        async () => {
            const query =
                input.value
                    .trim()
                    .toLowerCase();

            results.innerHTML = "";

            if (!query) {
                results.classList.add(
                    "hidden"
                );
                return;
            }

            results.classList.remove(
                "hidden"
            );

            const [
                usersSnapshot,
                postsSnapshot,
                challengesSnapshot
            ] = await Promise.all([
                get(ref(db, CF.users)),
                get(ref(db, CF.posts)),
                get(
                    ref(
                        db,
                        CF.communityChallenges
                    )
                )
            ]);

            const found = [];

            if (
                usersSnapshot.exists()
            ) {
                usersSnapshot.forEach(
                    child => {
                        const user =
                            child.val();

                        const username =
                            String(
                                user.username ||
                                ""
                            ).toLowerCase();

                        if (
                            username.includes(
                                query
                            )
                        ) {
                            found.push({
                                icon: "👤",
                                title:
                                    user.username ||
                                    "Member",
                                subtitle:
                                    "Community member",
                                action: () =>
                                    cfOpenPublicProfile(
                                        child.key
                                    )
                            });
                        }
                    }
                );
            }

            if (
                postsSnapshot.exists()
            ) {
                postsSnapshot.forEach(
                    child => {
                        const post =
                            child.val();

                        const text =
                            [
                                post.title,
                                post.content,
                                post.data?.title,
                                post.data?.description
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                        if (
                            text.includes(
                                query
                            )
                        ) {
                            found.push({
                                icon: "💬",
                                title:
                                    post.data?.title ||
                                    post.title ||
                                    "Community post",
                                subtitle:
                                    post.type ||
                                    "post",
                                action: () =>
                                    cfOpenPage(
                                        "home"
                                    )
                            });
                        }
                    }
                );
            }

            if (
                challengesSnapshot.exists()
            ) {
                challengesSnapshot.forEach(
                    child => {
                        const challenge =
                            child.val();

                        const text =
                            `${challenge.name || ""} ${challenge.description || ""}`
                                .toLowerCase();

                        if (
                            text.includes(
                                query
                            )
                        ) {
                            found.push({
                                icon: "⚔️",
                                title:
                                    challenge.name ||
                                    "Challenge",
                                subtitle:
                                    "Community challenge",
                                action: () =>
                                    cfOpenPage(
                                        "home"
                                    )
                            });
                        }
                    }
                );
            }

            if (!found.length) {
                results.innerHTML = `
                    <div class="cfSearchEmpty">
                        🔎 No community results.
                    </div>
                `;

                return;
            }

            found
                .slice(0, 12)
                .forEach(result => {
                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "cfSearchResult";

                    button.innerHTML = `
                        <span>
                            ${result.icon}
                        </span>

                        <div>
                            <strong>
                                ${cfEscape(
                                    result.title
                                )}
                            </strong>

                            <small>
                                ${cfEscape(
                                    result.subtitle
                                )}
                            </small>
                        </div>
                    `;

                    button.onclick = () => {
                        results.classList.add(
                            "hidden"
                        );

                        input.value = "";

                        result.action();
                    };

                    results.appendChild(
                        button
                    );
                });
        }
    );

    document.addEventListener(
        "click",
        event => {
            if (
                !results.contains(
                    event.target
                ) &&
                event.target !== input
            ) {
                results.classList.add(
                    "hidden"
                );
            }
        }
    );
}

/* ============================================================
   PROJECT SEARCH
   ============================================================ */

function setupCFProjectSearch() {
    const page =
        document.getElementById(
            "projectsPage"
        );

    if (
        !page ||
        document.getElementById(
            "cfProjectSearch"
        )
    ) {
        return;
    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "cfProjectSearchWrap";

    wrapper.innerHTML = `
        <span>🔎</span>

        <input
            id="cfProjectSearch"
            type="search"
            placeholder="Search projects..."
        >
    `;

    page
        .querySelector(".sectionHero")
        ?.after(wrapper);

    const input =
        wrapper.querySelector(
            "input"
        );

    input.addEventListener(
        "input",
        () => {
            const query =
                input.value
                    .trim()
                    .toLowerCase();

            page
                .querySelectorAll(
                    ".communityProjectCard"
                )
                .forEach(card => {
                    card.classList.toggle(
                        "hidden",
                        !!query &&
                        !card.textContent
                            .toLowerCase()
                            .includes(
                                query
                            )
                    );
                });
        }
    );
}

/* ============================================================
   COMMUNITY CHALLENGE COMPOSER
   ============================================================ */

function installCFChallengeComposer() {
    const select =
        document.getElementById(
            "postType"
        );

    const composer =
        document.getElementById(
            "postTypeComposer"
        );

    const input =
        document.getElementById(
            "postInput"
        );

    if (
        !select ||
        !composer
    ) {
        return;
    }

    select.addEventListener(
        "change",
        () => {
            if (
                select.value !==
                "challenge"
            ) {
                return;
            }

            input?.classList.add(
                "hidden"
            );

            composer.classList.remove(
                "hidden"
            );

            composer.innerHTML = `
                <div class="typeComposerHeader">
                    <div>
                        <h3>
                            ⚔️ Create a Community Challenge
                        </h3>

                        <p>
                            Anyone can create one.
                            No prizes — just glory.
                        </p>
                    </div>
                </div>

                <div class="typeComposerBody">

                    <div class="typeComposerIcon">
                        ⚔️
                    </div>

                    <div class="typeComposerFields">

                        <label>
                            Challenge title
                        </label>

                        <input
                            id="cfChallengeTitle"
                            maxlength="100"
                            placeholder="e.g. Build a tiny game"
                        >

                        <label>
                            Description
                        </label>

                        <textarea
                            id="cfChallengeDescription"
                            maxlength="1000"
                            placeholder="What should people build?"
                        ></textarea>

                        <div class="cfTwoCol">

                            <div>
                                <label>
                                    Starts
                                </label>

                                <input
                                    id="cfChallengeStart"
                                    type="datetime-local"
                                >
                            </div>

                            <div>
                                <label>
                                    Ends
                                </label>

                                <input
                                    id="cfChallengeEnd"
                                    type="datetime-local"
                                >
                            </div>

                        </div>

                        <div class="cfGloryNotice">
                            🏅 Glory only · No prize · No badge
                        </div>

                    </div>
                </div>
            `;
        }
    );
}

/* ============================================================
   CREATE COMMUNITY CHALLENGE
   ============================================================ */

async function createCFChallenge() {
    if (!cfRequireLogin()) {
        return;
    }

    const title =
        document
            .getElementById(
                "cfChallengeTitle"
            )
            ?.value
            .trim();

    const description =
        document
            .getElementById(
                "cfChallengeDescription"
            )
            ?.value
            .trim();

    const start =
        document
            .getElementById(
                "cfChallengeStart"
            )
            ?.value;

    const end =
        document
            .getElementById(
                "cfChallengeEnd"
            )
            ?.value;

    if (
        !title ||
        !description ||
        !start ||
        !end
    ) {
        alert(
            "⚠️ Fill in the challenge title, description, start and end."
        );

        return;
    }

    const startAt =
        new Date(start).getTime();

    const endAt =
        new Date(end).getTime();

    if (
        !Number.isFinite(startAt) ||
        !Number.isFinite(endAt) ||
        endAt <= startAt
    ) {
        alert(
            "⚠️ Choose valid dates with the end after the start."
        );

        return;
    }

    const profile =
        await cfProfileOf();

    const challengeRef =
        push(
            ref(
                db,
                CF.communityChallenges
            )
        );

    await set(
        challengeRef,
        {
            name: title,
            description,
            startAt,
            endAt,

            createdBy:
                cfUID(),

            createdByUsername:
                profile.username ||
                "CodeOS Member",

            createdByAvatar:
                profile.avatar ||
                auth.currentUser
                    ?.photoURL ||
                "",

            createdAt:
                serverTimestamp(),

            official:
                false,

            participants: {},

            winnerUserId:
                null,

            winnerUsername:
                null
        }
    );

    /*
        Also create a post so the challenge
        exists in the MAIN community feed.

        It is deliberately NOT added to
        Projects / Discussions / Challenges page.
    */

    const postRef =
        push(
            ref(
                db,
                CF.posts
            )
        );

    await set(
        postRef,
        {
            authorId:
                cfUID(),

            authorName:
                profile.username ||
                "CodeOS Member",

            authorAvatar:
                profile.avatar ||
                auth.currentUser
                    ?.photoURL ||
                "",

            type:
                "challenge",

            content:
                description,

            data: {
                title,
                description,
                challengeId:
                    challengeRef.key,
                startAt,
                endAt
            },

            likes: 0,
            loves: 0,
            comments: 0,

            createdAt:
                serverTimestamp()
        }
    );

    document
        .getElementById(
            "postInput"
        )
        ?.classList.remove(
            "hidden"
        );

    document
        .getElementById(
            "postTypeComposer"
        )
        ?.classList.add(
            "hidden"
        );

    const select =
        document.getElementById(
            "postType"
        );

    if (select) {
        select.value = "post";
    }

    document
        .getElementById(
            "postInput"
        )
        ?.value = "";

    alert(
        `⚔️ "${title}" created!\n\nLet the glory begin.`
    );
}

/* ============================================================
   INTERCEPT ORIGINAL CHALLENGE POST
   ============================================================ */

function interceptCFChallengePublish() {
    const button =
        document.getElementById(
            "postBtn"
        );

    if (
        !button ||
        button.dataset.cfChallengeReady
    ) {
        return;
    }

    button.dataset.cfChallengeReady =
        "1";

    button.addEventListener(
        "click",
        event => {
            const type =
                document.getElementById(
                    "postType"
                )?.value;

            if (
                type !== "challenge"
            ) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            createCFChallenge();
        },
        true
    );
}

/* ============================================================
   RENDER COMMUNITY CHALLENGE
   ============================================================ */

function renderCFChallengePost(
    post
) {
    const data =
        post.data || {};

    const challengeId =
        data.challengeId;

    if (!challengeId) {
        return null;
    }

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "cfChallengePost post";

    card.dataset.challengeId =
        challengeId;

    card.innerHTML = `
        <div class="cfChallengePostTop">

            <span class="cfChallengeTag">
                ⚔️ COMMUNITY CHALLENGE
            </span>

            <span class="cfGloryTag">
                🏅 GLORY ONLY
            </span>

        </div>

        <h3>
            ${cfEscape(
                data.title ||
                "Community Challenge"
            )}
        </h3>

        <p>
            ${cfEscape(
                data.description ||
                post.content ||
                ""
            )}
        </p>

        <div class="cfChallengeMeta">

            <span>
                🕐
                ${data.startAt
                    ? cfEscape(
                        new Date(
                            data.startAt
                        ).toLocaleString()
                    )
                    : "Now"}
            </span>

            <span>
                →
                ${data.endAt
                    ? cfEscape(
                        new Date(
                            data.endAt
                        ).toLocaleString()
                    )
                    : "Unknown"}
            </span>

        </div>

        <div class="cfChallengeActions">
            Loading...
        </div>

        <div class="cfWinnerArea"></div>
    `;

    cfLoadChallengeCard(
        challengeId,
        card
    );

    return card;
}

/* ============================================================
   LOAD CHALLENGE STATE
   ============================================================ */

async function cfLoadChallengeCard(
    id,
    card
) {
    const snapshot =
        await get(
            ref(
                db,
                `${CF.communityChallenges}/${id}`
            )
        );

    if (
        !snapshot.exists()
    ) {
        card.remove();
        return;
    }

    const challenge =
        snapshot.val();

    const now =
        Date.now();

    const status =
        now < challenge.startAt
            ? "UPCOMING"
            : now <= challenge.endAt
                ? "LIVE"
                : "ENDED";

    const participantCount =
        Object.keys(
            challenge.participants ||
            {}
        ).length;

    card
        .querySelector(
            ".cfChallengeActions"
        )
        .innerHTML = `
            <span class="
                cfStatus
                cfStatus-${status.toLowerCase()}
            ">
                ${
                    status === "LIVE"
                        ? "🔴 LIVE"
                        : status === "UPCOMING"
                            ? "🕐 UPCOMING"
                            : "🏁 ENDED"
                }
            </span>

            ${
                status === "ENDED"
                    ? `
                        <button
                            type="button"
                            disabled
                        >
                            Challenge ended
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="cfJoinChallenge"
                        >
                            🚀 Join Challenge
                        </button>
                    `
            }

            <span class="cfParticipantCount">
                ${participantCount}
                participant${participantCount === 1 ? "" : "s"}
            </span>
        `;

    card
        .querySelector(
            ".cfJoinChallenge"
        )
        ?.addEventListener(
            "click",
            () =>
                cfJoinChallenge(id)
        );

    const winnerArea =
        card.querySelector(
            ".cfWinnerArea"
        );

    if (
        challenge.winnerUserId
    ) {
        winnerArea.innerHTML = `
            👑 Winner:
            <strong>
                ${cfEscape(
                    challenge.winnerUsername ||
                    "Community Member"
                )}
            </strong>

            — absolute glory.
        `;
    }

    /*
        ONLY ELDER MODERATOR gets delete.
    */

    if (
        cfMyProfile?.username ===
        CF_ELDER
    ) {
        const deleteButton =
            document.createElement(
                "button"
            );

        deleteButton.type =
            "button";

        deleteButton.className =
            "cfDeleteChallenge moderatorDangerButton";

        deleteButton.textContent =
            "🗑️ Delete";

        deleteButton.onclick =
            async () => {
                if (
                    !(await cfIsElder())
                ) {
                    return;
                }

                if (
                    !confirm(
                        "Delete this challenge permanently?"
                    )
                ) {
                    return;
                }

                await remove(
                    ref(
                        db,
                        `${CF.communityChallenges}/${id}`
                    )
                );

                const postId =
                    await cfFindChallengePost(
                        id
                    );

                if (postId) {
                    await remove(
                        ref(
                            db,
                            `${CF.posts}/${postId}`
                        )
                    );
                }

                card.remove();
            };

        card
            .querySelector(
                ".cfChallengeActions"
            )
            ?.appendChild(
                deleteButton
            );
    }
}

/* ============================================================
   JOIN CHALLENGE
   ============================================================ */

async function cfJoinChallenge(
    id
) {
    if (
        !cfRequireLogin()
    ) {
        return;
    }

    const snapshot =
        await get(
            ref(
                db,
                `${CF.communityChallenges}/${id}`
            )
        );

    if (
        !snapshot.exists()
    ) {
        alert(
            "❌ Challenge not found."
        );

        return;
    }

    const challenge =
        snapshot.val();

    const now =
        Date.now();

    if (
        now <
        challenge.startAt ||
        now >
        challenge.endAt
    ) {
        alert(
            "🚫 You can only join while the challenge is live."
        );

        return;
    }

    const profile =
        await cfProfileOf();

    await set(
        ref(
            db,
            `${CF.communityChallenges}/${id}/participants/${cfUID()}`
        ),
        {
            username:
                profile.username ||
                "CodeOS Member",

            avatar:
                profile.avatar ||
                auth.currentUser
                    ?.photoURL ||
                "",

            joinedAt:
                serverTimestamp()
        }
    );

    alert(
        "🚀 You're in!\n\nGood luck — may the glory be yours."
    );
}

/* ============================================================
   FIND CHALLENGE POST
   ============================================================ */

async function cfFindChallengePost(
    challengeId
) {
    const snapshot =
        await get(
            ref(
                db,
                CF.posts
            )
        );

    if (
        !snapshot.exists()
    ) {
        return null;
    }

    let result = null;

    snapshot.forEach(
        child => {
            if (
                child.val()
                    ?.data
                    ?.challengeId ===
                challengeId
            ) {
                result =
                    child.key;
            }
        }
    );

    return result;
}

/* ============================================================
   RENDER CHALLENGE POSTS IN MAIN FEED
   ============================================================ */

function cfRenderChallengePosts() {
    const feed =
        document.getElementById(
            "feed"
        );

    if (!feed) {
        return;
    }

    /*
        Hide the generic renderer's challenge
        cards so only our special challenge card
        remains.
    */

    feed
        .querySelectorAll(
            ".postType-challenge"
        )
        .forEach(
            card =>
                card.classList.add(
                    "hidden"
                )
        );

    get(
        ref(
            db,
            CF.posts
        )
    ).then(snapshot => {
        if (
            !snapshot.exists()
        ) {
            return;
        }

        snapshot.forEach(
            child => {
                const post = {
                    id: child.key,
                    ...child.val()
                };

                if (
                    post.type !==
                    "challenge" ||
                    !post.data?.challengeId
                ) {
                    return;
                }

                const existing =
                    feed.querySelector(
                        `.cfChallengePost[data-challenge-id="${post.data.challengeId}"]`
                    );

                if (existing) {
                    return;
                }

                const card =
                    renderCFChallengePost(
                        post
                    );

                if (card) {
                    feed.appendChild(
                        card
                    );
                }
            }
        );
    });
}

/* ============================================================
   DISCUSSION GROUPS
   ============================================================ */

async function cfRenderDiscussionGroups() {
    const page =
        document.getElementById(
            "discussPage"
        );

    if (
        !page ||
        !cfUID()
    ) {
        return;
    }

    let strip =
        document.getElementById(
            "cfMyDiscussionGroups"
        );

    if (!strip) {
        strip =
            document.createElement(
                "div"
            );

        strip.id =
            "cfMyDiscussionGroups";

        strip.className =
            "cfGroupsStrip";

        page
            .querySelector(
                ".sectionHero"
            )
            ?.after(
                strip
            );
    }

    const snapshot =
        await get(
            ref(
                db,
                `${CF.users}/${cfUID()}/groups`
            )
        );

    const groups =
        snapshot.exists()
            ? snapshot.val()
            : {};

    const ids =
        Object.keys(
            groups || {}
        );

    strip.innerHTML = `
        <div class="cfGroupsStripTitle">
            👥 Your groups
        </div>

        ${
            ids.length
                ? ids
                    .map(
                        id => `
                            <span class="cfGroupChip">
                                ${cfEscape(
                                    groups[id]?.name ||
                                    id
                                )}
                            </span>
                        `
                    )
                    .join("")
                : `
                    <span class="cfNoGroups">
                        You're not in any groups yet.
                    </span>
                `
        }
    `;
}

/* ============================================================
   NOTIFICATION POPUP
   ============================================================ */

function setupCFNotificationButton() {
    const button =
        document.querySelector(
            ".topIcon"
        );

    if (
        !button ||
        button.dataset.cfReady
    ) {
        return;
    }

    button.dataset.cfReady =
        "1";

    button.setAttribute(
        "aria-label",
        "Notifications"
    );

    button.onclick =
        event => {
            event.stopPropagation();

            cfToggleNotificationPopup();
        };

    document.addEventListener(
        "click",
        event => {
            const popup =
                document.getElementById(
                    "cfNotificationPopup"
                );

            if (
                popup &&
                !popup.contains(
                    event.target
                ) &&
                event.target !==
                    button
            ) {
                popup.remove();
            }
        }
    );
}

async function cfToggleNotificationPopup() {
    document
        .getElementById(
            "cfNotificationPopup"
        )
        ?.remove();

    if (
        !cfRequireLogin()
    ) {
        return;
    }

    const popup =
        document.createElement(
            "div"
        );

    popup.id =
        "cfNotificationPopup";

    popup.className =
        "cfNotificationPopup";

    popup.innerHTML = `
        <div class="cfPopupHeader">

            <strong>
                🔔 Notifications
            </strong>

            <button
                type="button"
                id="cfAllNotifications"
            >
                View all
            </button>

        </div>

        <div id="cfNotificationItems">
            Loading...
        </div>
    `;

    document.body.appendChild(
        popup
    );

    const snapshot =
        await get(
            ref(
                db,
                `${CF.notifications}/${cfUID()}`
            )
        );

    const notifications = [];

    if (
        snapshot.exists()
    ) {
        snapshot.forEach(
            child => {
                notifications.push({
                    id: child.key,
                    ...child.val()
                });
            }
        );
    }

    notifications.reverse();

    const container =
        popup.querySelector(
            "#cfNotificationItems"
        );

    container.innerHTML =
        notifications.length
            ? notifications
                .slice(0, 6)
                .map(
                    notification => `
                        <div class="cfNotificationItem">

                            <strong>
                                ${cfEscape(
                                    notification.title ||
                                    "Notification"
                                )}
                            </strong>

                            <p>
                                ${cfEscape(
                                    notification.message ||
                                    ""
                                )}
                            </p>

                        </div>
                    `
                )
                .join("")
            : `
                <div class="cfPopupEmpty">
                    ✨ You're all caught up.
                </div>
            `;

    popup
        .querySelector(
            "#cfAllNotifications"
        )
        .onclick =
            () => {
                popup.remove();

                cfOpenPage(
                    "notifications"
                );

                cfRenderNotificationsPage();
            };
}

/* ============================================================
   NOTIFICATIONS PAGE
   ============================================================ */

function cfRenderNotificationsPage() {
    const page =
        document.getElementById(
            "notificationsPage"
        );

    if (
        !page ||
        !cfUID()
    ) {
        return;
    }

    let list =
        document.getElementById(
            "cfNotificationsList"
        );

    if (!list) {
        list =
            document.createElement(
                "div"
            );

        list.id =
            "cfNotificationsList";

        list.className =
            "cfNotificationsList";

        page
            .querySelector(
                ".sectionHero"
            )
            ?.after(
                list
            );
    }

    onValue(
        ref(
            db,
            `${CF.notifications}/${cfUID()}`
        ),
        snapshot => {
            const notifications =
                [];

            if (
                snapshot.exists()
            ) {
                snapshot.forEach(
                    child => {
                        notifications.push({
                            id:
                                child.key,
                            ...child.val()
                        });
                    }
                );
            }

            notifications.reverse();

            list.innerHTML =
                notifications.length
                    ? notifications
                        .map(
                            notification => `
                                <article class="cfNotificationCard">

                                    <div class="cfNotificationIcon">
                                        ${cfEscape(
                                            notification.badgeIcon ||
                                            "🔔"
                                        )}
                                    </div>

                                    <div>

                                        <h3>
                                            ${cfEscape(
                                                notification.title ||
                                                "Notification"
                                            )}
                                        </h3>

                                        <p>
                                            ${cfEscape(
                                                notification.message ||
                                                ""
                                            )}
                                        </p>

                                    </div>

                                </article>
                            `
                        )
                        .join("")
                    : `
                        <div class="cfEmpty">
                            🔔 No notifications yet.
                        </div>
                    `;
        }
    );
}

/* ============================================================
   CREATE NOTIFICATION
   ============================================================ */

async function cfCreateNotification(
    targetUid,
    data
) {
    if (!targetUid) {
        return;
    }

    const notificationRef =
        push(
            ref(
                db,
                `${CF.notifications}/${targetUid}`
            )
        );

    await set(
        notificationRef,
        {
            ...data,
            createdAt:
                serverTimestamp(),
            read: false
        }
    );
}

/* ============================================================
   AWARD COMPOSER
   ============================================================ */

function cfAwardComposerHTML() {
    const badges = [
        "🏆",
        "🌟",
        "💎",
        "👑",
        "🚀",
        "⚡",
        "🧠",
        "🔥",
        "🎯",
        "🛠️",
        "🤖",
        "🏅",
        "💡",
        "🎨",
        "⚔️",
        "🧪",
        "🦾",
        "🐉"
    ];

    return `
        <div class="cfAwardForm">

            <label>
                Recipient
            </label>

            <input
                id="cfAwardRecipient"
                type="search"
                placeholder="Search username..."
            >

            <div
                id="cfAwardUsers"
                class="cfResults"
            ></div>

            <label>
                Award name
            </label>

            <input
                id="cfAwardName"
                maxlength="100"
                placeholder="e.g. Legendary Builder"
            >

            <label>
                Description
            </label>

            <textarea
                id="cfAwardDescription"
                maxlength="500"
                placeholder="Why are they receiving this award?"
            ></textarea>

            <label>
                Badge(s)
            </label>

            <div
                id="cfAwardBadges"
                class="cfBadgePicker"
            >
                ${badges
                    .map(
                        badge => `
                            <button
                                type="button"
                                class="cfBadgeOption"
                                data-badge="${badge}"
                            >
                                ${badge}
                            </button>
                        `
                    )
                    .join("")}
            </div>

            <div
                id="cfAwardSelected"
                class="cfSelectedBadges"
            >
                No badges selected
            </div>

            <button
                id="cfGiveAward"
                class="moderatorPrimaryButton"
                type="button"
            >
                🏆 Give Award
            </button>

        </div>
    `;
}

/* ============================================================
   GIVE AWARD TOOL
   ============================================================ */

function cfOpenGiveAwardTool() {
    cfIsElder().then(
        async allowed => {
            if (!allowed) {
                alert(
                    "💎 Only the Elder Moderator can give awards."
                );

                return;
            }

            cfShowModal(
                "Give Community Award",
                cfAwardComposerHTML()
            );

            const input =
                document.getElementById(
                    "cfAwardRecipient"
                );

            const results =
                document.getElementById(
                    "cfAwardUsers"
                );

            input.oninput =
                async () => {
                    const query =
                        input.value
                            .trim()
                            .toLowerCase();

                    results.innerHTML =
                        "";

                    cfAwardRecipient =
                        null;

                    if (!query) {
                        return;
                    }

                    const snapshot =
                        await get(
                            ref(
                                db,
                                CF.users
                            )
                        );

                    if (
                        !snapshot.exists()
                    ) {
                        return;
                    }

                    snapshot.forEach(
                        child => {
                            const user =
                                child.val();

                            const username =
                                String(
                                    user.username ||
                                    ""
                                ).toLowerCase();

                            if (
                                username.includes(
                                    query
                                )
                            ) {
                                const button =
                                    document.createElement(
                                        "button"
                                    );

                                button.type =
                                    "button";

                                button.className =
                                    "cfUserRow";

                                button.innerHTML = `
                                    👤

                                    <strong>
                                        ${cfEscape(
                                            user.username ||
                                            "Member"
                                        )}
                                    </strong>
                                `;

                                button.onclick =
                                    () => {
                                        cfAwardRecipient =
                                            child.key;

                                        input.value =
                                            user.username ||
                                            "";

                                        results.innerHTML = `
                                            <div class="cfSelectedRecipient">
                                                ✓
                                                ${cfEscape(
                                                    user.username ||
                                                    "Member"
                                                )}
                                            </div>
                                        `;
                                    };

                                results.appendChild(
                                    button
                                );
                            }
                        }
                    );
                };

            const selectedBadges =
                [];

            document
                .querySelectorAll(
                    ".cfBadgeOption"
                )
                .forEach(
                    button => {
                        button.onclick =
                            () => {
                                const badge =
                                    button.dataset
                                        .badge;

                                const index =
                                    selectedBadges.indexOf(
                                        badge
                                    );

                                if (
                                    index >= 0
                                ) {
                                    selectedBadges.splice(
                                        index,
                                        1
                                    );

                                    button.classList.remove(
                                        "selected"
                                    );
                                } else {
                                    selectedBadges.push(
                                        badge
                                    );

                                    button.classList.add(
                                        "selected"
                                    );
                                }

                                document
                                    .getElementById(
                                        "cfAwardSelected"
                                    )
                                    .textContent =
                                        selectedBadges.length
                                            ? `Selected: ${selectedBadges.join(" ")}`
                                            : "No badges selected";
                            };
                    }
                );

            document
                .getElementById(
                    "cfGiveAward"
                )
                .onclick =
                    () =>
                        cfGiveAward(
                            selectedBadges
                        );
        }
    );
}

/* ============================================================
   GIVE AWARD
   ============================================================ */

async function cfGiveAward(
    badges
) {
    if (
        !(await cfIsElder())
    ) {
        return;
    }

    const name =
        document
            .getElementById(
                "cfAwardName"
            )
            ?.value
            .trim();

    const description =
        document
            .getElementById(
                "cfAwardDescription"
            )
            ?.value
            .trim();

    if (
        !cfAwardRecipient ||
        !name ||
        !description ||
        !badges.length
    ) {
        alert(
            "⚠️ Choose a recipient, name, description and at least one badge."
        );

        return;
    }

    const recipient =
        await cfProfileOf(
            cfAwardRecipient
        );

    const awardRef =
        push(
            ref(
                db,
                CF.awards
            )
        );

    await set(
        awardRef,
        {
            recipientId:
                cfAwardRecipient,

            recipientUsername:
                recipient.username ||
                "CodeOS Member",

            recipientAvatar:
                recipient.avatar ||
                "",

            name,
            description,
            badges,

            awardedBy:
                cfUID(),

            awardedByUsername:
                CF_ELDER,

            createdAt:
                serverTimestamp()
        }
    );

    /*
        Give the badges immediately.
    */

    const badgeUpdates =
        {};

    badges.forEach(
        (badge, index) => {
            badgeUpdates[
                `${CF.users}/${cfAwardRecipient}/badges/${awardRef.key}-${index}`
            ] = {
                icon:
                    badge,

                name,

                description,

                sourceAwardId:
                    awardRef.key,

                earnedAt:
                    serverTimestamp()
            };
        }
    );

    await update(
        ref(db),
        badgeUpdates
    );

    await cfCreateNotification(
        cfAwardRecipient,
        {
            type:
                "community_award",

            title:
                `🏆 You received: ${name}`,

            message:
                description,

            badgeIcon:
                badges.join(" "),

            badgeName:
                name,

            awardId:
                awardRef.key
        }
    );

    cfCloseModal();

    alert(
        `🏆 Award given to ${
            recipient.username ||
            "the community member"
        }!`
    );

    cfRenderAwardsPage();
}

/* ============================================================
   AWARDS SHRINE
   ============================================================ */

function cfRenderAwardsPage() {
    const page =
        document.getElementById(
            "awardsPage"
        );

    if (!page) {
        return;
    }

    let shrine =
        document.getElementById(
            "cfAwardsShrine"
        );

    if (!shrine) {
        shrine =
            document.createElement(
                "div"
            );

        shrine.id =
            "cfAwardsShrine";

        shrine.className =
            "cfAwardsShrine";

        page
            .querySelector(
                ".sectionHero"
            )
            ?.after(
                shrine
            );
    }

    cfIsElder().then(
        allowed => {
            if (
                allowed &&
                !document.getElementById(
                    "cfGiveAwardPageBtn"
                )
            ) {
                const button =
                    document.createElement(
                        "button"
                    );

                button.id =
                    "cfGiveAwardPageBtn";

                button.className =
                    "moderatorPrimaryButton cfGiveAwardPageBtn";

                button.textContent =
                    "🏆 Give an Award";

                button.onclick =
                    cfOpenGiveAwardTool;

                page
                    .querySelector(
                        ".sectionHero"
                    )
                    ?.after(
                        button
                    );
            }
        }
    );

    onValue(
        ref(
            db,
            CF.awards
        ),
        snapshot => {
            const awards =
                [];

            if (
                snapshot.exists()
            ) {
                snapshot.forEach(
                    child => {
                        awards.push({
                            id:
                                child.key,
                            ...child.val()
                        });
                    }
                );
            }

            awards.reverse();

            shrine.innerHTML =
                awards.length
                    ? awards
                        .map(
                            award => `
                                <article class="cfAwardShrineCard">

                                    <div class="cfAwardCrown">
                                        ${cfEscape(
                                            (
                                                award.badges ||
                                                ["🏆"]
                                            )[0]
                                        )}
                                    </div>

                                    <div class="cfAwardRecipient">

                                        <div class="cfAwardAvatar">

                                            ${
                                                award.recipientAvatar
                                                    ? `
                                                        <img
                                                            src="${cfEscape(
                                                                award.recipientAvatar
                                                            )}"
                                                            alt=""
                                                        >
                                                    `
                                                    : "👤"
                                            }

                                        </div>

                                        <div>

                                            <strong>
                                                ${cfEscape(
                                                    award.recipientUsername ||
                                                    "CodeOS Member"
                                                )}
                                            </strong>

                                            <span>
                                                @${cfEscape(
                                                    award.recipientUsername ||
                                                    "member"
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    <h3>
                                        ${cfEscape(
                                            award.name ||
                                            "Community Award"
                                        )}
                                    </h3>

                                    <p>
                                        ${cfEscape(
                                            award.description ||
                                            ""
                                        )}
                                    </p>

                                    <div class="cfAwardBadgeRow">
                                        ${
                                            (
                                                award.badges ||
                                                []
                                            )
                                                .map(
                                                    badge =>
                                                        `<span>${cfEscape(
                                                            badge
                                                        )}</span>`
                                                )
                                                .join("")
                                        }
                                    </div>

                                    <small>
                                        Awarded by
                                        ${cfEscape(
                                            award.awardedByUsername ||
                                            CF_ELDER
                                        )}
                                    </small>

                                </article>
                            `
                        )
                        .join("")
                    : `
                        <div class="cfEmpty">
                            🏆 No community awards yet.
                        </div>
                    `;
        }
    );
}

/* ============================================================
   MODERATOR ACCOUNT TOOLS
   ============================================================ */

async function cfLoadUsers() {
    const snapshot =
        await get(
            ref(
                db,
                CF.users
            )
        );

    cfAllUsers = [];

    if (
        snapshot.exists()
    ) {
        snapshot.forEach(
            child => {
                cfAllUsers.push({
                    id:
                        child.key,
                    ...child.val()
                });
            }
        );
    }

    return cfAllUsers;
}

/* -------------------------
   BAN ACCOUNTS
   ------------------------- */

async function cfOpenBanAccounts() {
    if (
        !(await cfIsElder())
    ) {
        alert(
            "💎 Only the Elder Moderator can manage bans."
        );

        return;
    }

    await cfLoadUsers();

    cfShowModal(
        "Ban Accounts",
        `
            <div class="moderatorToolIntro danger">
                <span>🚫</span>

                <p>
                    Search for a user to ban or unban.
                </p>
            </div>

            <input
                id="cfBanSearch"
                class="moderatorToolSearch"
                type="search"
                placeholder="🔎 Search username..."
            >

            <div
                id="cfBanResults"
                class="cfResults"
            ></div>
        `
    );

    const input =
        document.getElementById(
            "cfBanSearch"
        );

    const results =
        document.getElementById(
            "cfBanResults"
        );

    const render =
        () => {
            const query =
                input.value
                    .trim()
                    .toLowerCase();

            const users =
                cfAllUsers.filter(
                    user =>
                        user.id !==
                            cfUID() &&
                        String(
                            user.username ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            )
                );

            results.innerHTML =
                users
                    .slice(0, 30)
                    .map(
                        user => `
                            <div class="cfUserRow">

                                <div>
                                    <strong>
                                        ${cfEscape(
                                            user.username ||
                                            "Member"
                                        )}
                                    </strong>

                                    <small>
                                        ${
                                            user.isBanned
                                                ? "🚫 Banned"
                                                : "🟢 Active"
                                        }
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    class="${
                                        user.isBanned
                                            ? "moderatorActionButton"
                                            : "moderatorDangerButton"
                                    }"
                                    data-ban-user="${cfEscape(
                                        user.id
                                    )}"
                                >
                                    ${
                                        user.isBanned
                                            ? "Unban"
                                            : "🚫 Ban"
                                    }
                                </button>

                            </div>
                        `
                    )
                    .join("");

            results
                .querySelectorAll(
                    "[data-ban-user]"
                )
                .forEach(
                    button => {
                        button.onclick =
                            async () => {
                                const user =
                                    cfAllUsers.find(
                                        x =>
                                            x.id ===
                                            button.dataset
                                                .banUser
                                    );

                                if (!user) {
                                    return;
                                }

                                if (
                                    !user.isBanned &&
                                    !confirm(
                                        `Ban @${user.username}?`
                                    )
                                ) {
                                    return;
                                }

                                await update(
                                    ref(
                                        db,
                                        `${CF.users}/${user.id}`
                                    ),
                                    {
                                        isBanned:
                                            !user.isBanned,

                                        bannedAt:
                                            !user.isBanned
                                                ? serverTimestamp()
                                                : null,

                                        bannedBy:
                                            !user.isBanned
                                                ? cfUID()
                                                : null
                                    }
                                );

                                user.isBanned =
                                    !user.isBanned;

                                render();
                            };
                    }
                );
        };

    input.oninput =
        render;

    render();
}

/* -------------------------
   ACCOUNT PREVIEW
   ------------------------- */

async function cfOpenAccountPreview() {
    if (
        !(await cfIsElder())
    ) {
        alert(
            "💎 Only the Elder Moderator can preview accounts."
        );

        return;
    }

    await cfLoadUsers();

    cfShowModal(
        "Account Preview",
        `
            <div class="moderatorToolIntro">
                <span>👤</span>

                <p>
                    Preview a member's profile.
                </p>
            </div>

            <input
                id="cfPreviewSearch"
                class="moderatorToolSearch"
                type="search"
                placeholder="🔎 Search username..."
            >

            <div
                id="cfPreviewResults"
                class="cfResults"
            ></div>
        `
    );

    const input =
        document.getElementById(
            "cfPreviewSearch"
        );

    const results =
        document.getElementById(
            "cfPreviewResults"
        );

    const render =
        () => {
            const query =
                input.value
                    .trim()
                    .toLowerCase();

            const users =
                cfAllUsers.filter(
                    user =>
                        user.id !==
                            cfUID() &&
                        String(
                            user.username ||
                            ""
                        )
                            .toLowerCase()
                            .includes(
                                query
                            )
                );

            results.innerHTML =
                users
                    .slice(0, 30)
                    .map(
                        user => `
                            <div class="cfUserRow">

                                <div>
                                    <strong>
                                        ${cfEscape(
                                            user.username ||
                                            "Member"
                                        )}
                                    </strong>

                                    <small>
                                        👤 Community Member
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    class="moderatorActionButton"
                                    data-preview-user="${cfEscape(
                                        user.id
                                    )}"
                                >
                                    Open Preview
                                </button>

                            </div>
                        `
                    )
                    .join("");

            results
                .querySelectorAll(
                    "[data-preview-user]"
                )
                .forEach(
                    button => {
                        button.onclick =
                            () => {
                                cfCloseModal();

                                cfOpenPublicProfile(
                                    button.dataset
                                        .previewUser
                                );
                            };
                    }
                );
        };

    input.oninput =
        render;

    render();
}

/* -------------------------
   TEST ACCOUNTS
   ------------------------- */

async function cfOpenTestAccounts() {
    if (
        !(await cfIsElder())
    ) {
        alert(
            "💎 Only the Elder Moderator can manage test accounts."
        );

        return;
    }

    cfShowModal(
        "Test Accounts",
        `
            <div class="moderatorToolIntro">
                <span>🧪</span>

                <p>
                    Create community test profiles.
                </p>
            </div>

            <label>
                Username
            </label>

            <input
                id="cfTestUsername"
                maxlength="30"
                placeholder="test_user_01"
            >

            <label>
                Display Name
            </label>

            <input
                id="cfTestDisplayName"
                maxlength="50"
                placeholder="CodeOS Test User"
            >

            <button
                id="cfCreateTestAccount"
                class="moderatorPrimaryButton"
                type="button"
            >
                🧪 Create Test Account
            </button>

            <div
                id="cfTestAccountsList"
                class="cfResults"
            >
                Loading...
            </div>
        `
    );

    document
        .getElementById(
            "cfCreateTestAccount"
        )
        .onclick =
            async () => {
                const username =
                    document
                        .getElementById(
                            "cfTestUsername"
                        )
                        .value
                        .trim();

                const displayName =
                    document
                        .getElementById(
                            "cfTestDisplayName"
                        )
                        .value
                        .trim();

                if (!username) {
                    alert(
                        "⚠️ Enter a username."
                    );

                    return;
                }

                await set(
                    push(
                        ref(
                            db,
                            "testAccounts"
                        )
                    ),
                    {
                        username,

                        displayName:
                            displayName ||
                            username,

                        active:
                            true,

                        createdBy:
                            cfUID(),

                        createdAt:
                            serverTimestamp()
                    }
                );

                alert(
                    "🧪 Test account created!"
                );

                cfLoadTestAccounts();
            };

    cfLoadTestAccounts();
}

async function cfLoadTestAccounts() {
    const container =
        document.getElementById(
            "cfTestAccountsList"
        );

    if (!container) {
        return;
    }

    const snapshot =
        await get(
            ref(
                db,
                "testAccounts"
            )
        );

    if (
        !snapshot.exists()
    ) {
        container.innerHTML = `
            <div class="cfEmpty">
                🧪 No test accounts yet.
            </div>
        `;

        return;
    }

    const accounts =
        [];

    snapshot.forEach(
        child => {
            accounts.push({
                id:
                    child.key,
                ...child.val()
            });
        }
    );

    container.innerHTML =
        accounts
            .map(
                account => `
                    <div class="cfUserRow">

                        <div>
                            <strong>
                                ${cfEscape(
                                    account.username ||
                                    "Test Account"
                                )}
                            </strong>

                            <small>
                                ${
                                    account.active
                                        ? "🟢 Active"
                                        : "⚪ Disabled"
                                }
                            </small>
                        </div>

                        <button
                            type="button"
                            class="moderatorDangerButton"
                            data-disable-test="${cfEscape(
                                account.id
                            )}"
                        >
                            ${
                                account.active
                                    ? "Disable"
                                    : "Enable"
                            }
                        </button>

                    </div>
                `
            )
            .join("");

    container
        .querySelectorAll(
            "[data-disable-test]"
        )
        .forEach(
            button => {
                button.onclick =
                    async () => {
                        const id =
                            button.dataset
                                .disableTest;

                        const snapshot =
                            await get(
                                ref(
                                    db,
                                    `testAccounts/${id}`
                                )
                            );

                        if (
                            !snapshot.exists()
                        ) {
                            return;
                        }

                        await update(
                            ref(
                                db,
                                `testAccounts/${id}`
                            ),
                            {
                                active:
                                    !snapshot.val()
                                        .active
                            }
                        );

                        cfLoadTestAccounts();
                    };
            }
        );
}

/* ============================================================
   PUBLIC PROFILE
   ============================================================ */

function cfOpenPublicProfile(
    targetUid
) {
    if (
        typeof window.openPublicProfile ===
        "function"
    ) {
        window.openPublicProfile(
            targetUid
        );

        return;
    }

    /*
        If the existing profile function isn't
        available, at least open the profile page.
    */

    cfOpenPage(
        "profile"
    );
}

/* ============================================================
   HOMEPAGE / COMMUNITY BUTTONS
   ============================================================ */

function installCFNavigationButtons() {
    /*
        Community page → CodeOS homepage.
    */

    if (
        !document.getElementById(
            "cfCodeOSHomeButton"
        )
    ) {
        const button =
            document.createElement(
                "button"
            );

        button.id =
            "cfCodeOSHomeButton";

        button.className =
            "cfNavButton cfHomeButton";

        button.textContent =
            "⚡ Open CodeOS Homepage";

        button.onclick =
            () => {
                window.location.href =
                    "index.html";
            };

        document
            .querySelector(
                ".sidebarLogo"
            )
            ?.after(
                button
            );
    }
}

/* ============================================================
   FEATURE MODAL
   ============================================================ */

function cfShowModal(
    title,
    content
) {
    cfCloseModal();

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "cfFeatureModal";

    overlay.className =
        "cfFeatureModalOverlay";

    overlay.innerHTML = `
        <div class="cfFeatureModal">

            <button
                type="button"
                class="cfModalClose"
            >
                ✕
            </button>

            <div class="cfModalHeader">

                <span>
                    💎
                </span>

                <div>

                    <h2>
                        ${cfEscape(
                            title
                        )}
                    </h2>

                    <p>
                        CodeOS Community
                    </p>

                </div>

            </div>

            <div class="cfModalBody">
                ${content}
            </div>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

    overlay
        .querySelector(
            ".cfModalClose"
        )
        .onclick =
            cfCloseModal;

    overlay.onclick =
        event => {
            if (
                event.target ===
                overlay
            ) {
                cfCloseModal();
            }
        };
}

function cfCloseModal() {
    document
        .getElementById(
            "cfFeatureModal"
        )
        ?.remove();
}

/* ============================================================
   MODERATOR BUTTONS
   ============================================================ */

function wireCFModeratorButtons() {
    document
        .getElementById(
            "moderatorBanAccountsBtn"
        )
        ?.addEventListener(
            "click",
            cfOpenBanAccounts
        );

    document
        .getElementById(
            "moderatorImpersonateBtn"
        )
        ?.addEventListener(
            "click",
            cfOpenAccountPreview
        );

    document
        .getElementById(
            "moderatorTestAccountsBtn"
        )
        ?.addEventListener(
            "click",
            cfOpenTestAccounts
        );
}

/* ============================================================
   BANNED ACCOUNT GUARD
   ============================================================ */

async function cfEnforceBan() {
    if (!cfUID()) {
        return;
    }

    const profile =
        await cfProfileOf();

    if (
        !profile.isBanned
    ) {
        return;
    }

    document.body.innerHTML = `
        <div class="cfBannedScreen">

            <div>

                <div>
                    🚫
                </div>

                <h1>
                    Account Banned
                </h1>

                <p>
                    This CodeOS account is currently
                    restricted from using the community.
                </p>

                <button
                    id="cfBannedLogout"
                >
                    🚪 Log out
                </button>

            </div>

        </div>
    `;

    document
        .getElementById(
            "cfBannedLogout"
        )
        .onclick =
            () =>
                auth.signOut();
}

/* ============================================================
   INITIALIZATION
   ============================================================ */

async function initCFCommunityFeatures() {
    setupCFCommunitySearch();

    setupCFProjectSearch();

    installCFChallengeComposer();

    interceptCFChallengePublish();

    setupCFNotificationButton();

    cfRenderNotificationsPage();

    cfRenderAwardsPage();

    cfRenderDiscussionGroups();

    installCFNavigationButtons();

    wireCFModeratorButtons();

    await cfRefreshMe();

    await cfEnforceBan();

    cfRenderChallengePosts();

    /*
        Refresh challenge cards when posts change.
    */

    onValue(
        ref(
            db,
            CF.posts
        ),
        () => {
            cfRenderChallengePosts();
        }
    );

    document
        .querySelectorAll(
            ".navItem"
        )
        .forEach(
            item => {
                item.addEventListener(
                    "click",
                    () => {
                        const page =
                            item.dataset
                                .page;

                        if (
                            page ===
                            "awards"
                        ) {
                            cfRenderAwardsPage();
                        }

                        if (
                            page ===
                            "notifications"
                        ) {
                            cfRenderNotificationsPage();
                        }

                        if (
                            page ===
                            "discuss"
                        ) {
                            cfRenderDiscussionGroups();
                        }
                    }
                );
            }
        );
}

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initCFCommunityFeatures
    );
} else {
    initCFCommunityFeatures();
}

window.CodeOSCommunityFeatures = {
    openPage:
        cfOpenPage,

    openGiveAward:
        cfOpenGiveAwardTool,

    openBanAccounts:
        cfOpenBanAccounts,

    openAccountPreview:
        cfOpenAccountPreview,

    openTestAccounts:
        cfOpenTestAccounts,

    closeModal:
        cfCloseModal
};