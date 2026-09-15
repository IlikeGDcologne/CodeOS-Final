import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    onValue,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

/* ============================================================
   🏆 CODEOS AWARDS + ⚡ EXTENSIONS SYSTEM
   ============================================================ */

const AWARDS_PATH = "communityAwards";
const USER_AWARDS_PATH = "awards";
const EXTENSIONS_PATH = "extensions";
const EXTENSION_INSTALLS_PATH = "extensionInstalls";
const LOCAL_EXTENSIONS_KEY = "codeosInstalledExtensions";

let awardsUser = null;
let awardsProfile = null;

let allCommunityExtensions = [];
let currentExtensionFilter = "all";
let extensionSearchQuery = "";
let extensionCategory = "all";

const awardsShrine =
    document.getElementById("cfAwardsShrine");

const extensionsGrid =
    document.getElementById("extensionsGrid");

/* ============================================================
   🎨 INJECT STYLES
   No community.css changes required for this system.
   ============================================================ */

const awardsExtensionsStyles = document.createElement("style");

awardsExtensionsStyles.textContent = `
/* ============================================================
   🏆 AWARDS
   ============================================================ */

.awardsDashboard {
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:16px;
    margin-top:20px;
}

.awardStatCard {
    padding:22px;
    border-radius:20px;
    background:
        linear-gradient(
            145deg,
            rgba(124,92,255,.18),
            rgba(255,255,255,.035)
        );
    border:1px solid rgba(255,255,255,.08);
    box-shadow:0 15px 40px rgba(0,0,0,.16);
}

.awardStatCard strong {
    display:block;
    font-size:34px;
    margin-bottom:4px;
}

.awardStatCard span {
    color:#a9acc2;
}

.awardsSection {
    margin-top:32px;
}

.awardsSectionHeader {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
    margin-bottom:15px;
}

.awardsSectionHeader h2 {
    margin:0;
}

.awardsSectionHeader p {
    margin:5px 0 0;
    color:#9fa3b8;
}

.awardsGrid {
    display:grid;
    grid-template-columns:
        repeat(auto-fill,minmax(220px,1fr));
    gap:16px;
}

.communityAwardCard {
    position:relative;
    overflow:hidden;
    border-radius:22px;
    padding:22px;
    min-height:190px;
    border:1px solid rgba(255,255,255,.09);
    background:
        linear-gradient(
            145deg,
            rgba(255,255,255,.06),
            rgba(255,255,255,.025)
        );
    transition:
        transform .2s ease,
        border-color .2s ease,
        box-shadow .2s ease;
}

.communityAwardCard:hover {
    transform:translateY(-4px);
    border-color:rgba(124,92,255,.55);
    box-shadow:0 20px 50px rgba(0,0,0,.25);
}

.communityAwardCard.unlocked {
    background:
        linear-gradient(
            145deg,
            rgba(124,92,255,.2),
            rgba(255,255,255,.035)
        );
}

.awardIconBig {
    font-size:48px;
    margin-bottom:12px;
}

.awardRarity {
    display:inline-flex;
    padding:5px 9px;
    border-radius:999px;
    font-size:11px;
    font-weight:800;
    letter-spacing:.08em;
    margin-bottom:9px;
    background:rgba(124,92,255,.16);
}

.awardName {
    font-size:18px;
    font-weight:800;
}

.awardDescription {
    margin:7px 0;
    color:#a9acc2;
    line-height:1.45;
}

.awardProgress {
    margin-top:14px;
}

.awardProgressTrack {
    height:8px;
    background:rgba(255,255,255,.08);
    border-radius:999px;
    overflow:hidden;
}

.awardProgressFill {
    height:100%;
    border-radius:inherit;
    background:linear-gradient(
        90deg,
        #7c5cff,
        #9b7cff
    );
}

.awardProgressText {
    margin-top:7px;
    font-size:12px;
    color:#aaaec5;
}

.awardUnlocked {
    margin-top:13px;
    color:#b8ffca;
    font-size:13px;
    font-weight:700;
}

.awardHallUser {
    display:flex;
    align-items:center;
    gap:12px;
    padding:14px;
    border-radius:16px;
    border:1px solid rgba(255,255,255,.07);
    background:rgba(255,255,255,.035);
}

.awardHallUserIcon {
    width:42px;
    height:42px;
    border-radius:13px;
    display:grid;
    place-items:center;
    background:rgba(124,92,255,.17);
    font-size:22px;
}

.awardHallUser strong {
    display:block;
}

.awardHallUser span {
    color:#9fa3b8;
    font-size:13px;
}

.awardManagerButton {
    margin-left:auto;
    border:0;
    border-radius:14px;
    padding:12px 16px;
    background:linear-gradient(
        135deg,
        #7c5cff,
        #9b7cff
    );
    color:white;
    font-weight:800;
    cursor:pointer;
}

.awardUnlockedFlash {
    position:fixed;
    inset:auto 22px 22px auto;
    z-index:9999;
    width:min(390px,calc(100vw - 44px));
    padding:20px;
    border-radius:22px;
    background:
        linear-gradient(
            145deg,
            #1b1734,
            #171823
        );
    border:1px solid rgba(124,92,255,.5);
    box-shadow:0 25px 80px rgba(0,0,0,.5);
    animation:awardFlashIn .35s ease;
}

.awardUnlockedFlash .flashIcon {
    font-size:45px;
}

.awardUnlockedFlash h3 {
    margin:7px 0 4px;
}

.awardUnlockedFlash p {
    margin:0;
    color:#a9acc2;
}

@keyframes awardFlashIn {
    from {
        opacity:0;
        transform:translateY(20px) scale(.96);
    }
    to {
        opacity:1;
        transform:translateY(0) scale(1);
    }
}

/* ============================================================
   ⚡ EXTENSIONS
   ============================================================ */

.extensionStatsBar {
    display:grid;
    grid-template-columns:
        repeat(auto-fit,minmax(170px,1fr));
    gap:14px;
    margin:20px 0;
}

.extensionStat {
    border-radius:17px;
    padding:16px 18px;
    border:1px solid rgba(255,255,255,.07);
    background:rgba(255,255,255,.035);
}

.extensionStat strong {
    display:block;
    font-size:24px;
}

.extensionStat span {
    color:#979cb4;
    font-size:13px;
}

.extensionToolbar {
    display:flex;
    gap:12px;
    margin:18px 0;
}

.extensionSearchWrap {
    flex:1;
    display:flex;
    align-items:center;
    gap:10px;
    padding:0 15px;
    border:1px solid rgba(255,255,255,.09);
    background:rgba(255,255,255,.035);
    border-radius:16px;
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
    min-width:180px;
    border-radius:16px;
    border:1px solid rgba(255,255,255,.09);
    background:#171823;
    color:inherit;
    padding:0 14px;
}

.extensionTabs {
    display:flex;
    flex-wrap:wrap;
    gap:9px;
    margin-bottom:20px;
}

.extensionTab {
    border:1px solid rgba(255,255,255,.08);
    background:rgba(255,255,255,.035);
    color:inherit;
    border-radius:13px;
    padding:10px 14px;
    cursor:pointer;
    transition:.2s ease;
}

.extensionTab.active,
.extensionTab:hover {
    background:rgba(124,92,255,.17);
    border-color:rgba(124,92,255,.45);
}

.extensionsGrid {
    display:grid;
    grid-template-columns:
        repeat(auto-fill,minmax(270px,1fr));
    gap:18px;
}

.extensionCard {
    border-radius:22px;
    overflow:hidden;
    border:1px solid rgba(255,255,255,.08);
    background:
        linear-gradient(
            145deg,
            rgba(255,255,255,.055),
            rgba(255,255,255,.022)
        );
    transition:.2s ease;
}

.extensionCard:hover {
    transform:translateY(-4px);
    border-color:rgba(124,92,255,.45);
}

.extensionCardTop {
    display:flex;
    gap:13px;
    padding:20px 20px 10px;
}

.extensionIcon {
    width:52px;
    height:52px;
    display:grid;
    place-items:center;
    border-radius:16px;
    font-size:28px;
    background:rgba(124,92,255,.17);
    flex:none;
}

.extensionCardTop h3 {
    margin:0;
}

.extensionVersion {
    color:#999db5;
    font-size:12px;
    margin-top:4px;
}

.extensionCardBody {
    padding:0 20px 20px;
}

.extensionCardBody p {
    min-height:65px;
    color:#a7abc0;
    line-height:1.45;
}

.extensionTags {
    display:flex;
    flex-wrap:wrap;
    gap:7px;
    margin-bottom:15px;
}

.extensionTag {
    font-size:11px;
    padding:5px 8px;
    border-radius:999px;
    background:rgba(255,255,255,.06);
}

.extensionMeta {
    display:flex;
    justify-content:space-between;
    gap:10px;
    color:#8f94ab;
    font-size:12px;
    margin-bottom:14px;
}

.extensionActions {
    display:flex;
    gap:8px;
}

.extensionActionButton {
    flex:1;
    border:0;
    border-radius:13px;
    padding:11px;
    cursor:pointer;
    font-weight:800;
    background:rgba(124,92,255,.16);
    color:white;
}

.extensionActionButton.primary {
    background:linear-gradient(
        135deg,
        #7c5cff,
        #9b7cff
    );
}

.extensionActionButton.danger {
    background:rgba(255,80,110,.12);
}

.extensionEmpty {
    grid-column:1/-1;
    padding:50px 20px;
    text-align:center;
    border-radius:20px;
    border:1px dashed rgba(255,255,255,.1);
    color:#9ca0b5;
}

.extensionCreateButton {
    margin-left:auto;
    border:0;
    border-radius:14px;
    padding:12px 16px;
    color:white;
    font-weight:800;
    cursor:pointer;
    background:linear-gradient(
        135deg,
        #7c5cff,
        #9b7cff
    );
}

.extensionDetail {
    display:grid;
    gap:14px;
}

.extensionDetailHero {
    display:flex;
    align-items:center;
    gap:14px;
}

.extensionDetailIcon {
    font-size:46px;
}

.extensionPermissionList {
    display:flex;
    flex-wrap:wrap;
    gap:7px;
}

.extensionPermission {
    padding:7px 9px;
    background:rgba(255,255,255,.05);
    border-radius:9px;
    font-size:12px;
}

/* responsive */

@media(max-width:700px) {
    .extensionToolbar {
        flex-direction:column;
    }

    .extensionToolbar select {
        min-height:46px;
    }
}
`;

document.head.appendChild(awardsExtensionsStyles);

/* ============================================================
   🧰 HELPERS
   ============================================================ */

function escapeAwardHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function getLocalInstalledExtensions() {
    try {
        return JSON.parse(
            localStorage.getItem(
                LOCAL_EXTENSIONS_KEY
            ) || "{}"
        );
    } catch {
        return {};
    }
}

function saveLocalInstalledExtensions(data) {
    localStorage.setItem(
        LOCAL_EXTENSIONS_KEY,
        JSON.stringify(data)
    );
}

function isExtensionInstalled(id) {
    return !!getLocalInstalledExtensions()[id];
}

async function getAwardsProfile() {
    if (!awardsUser) return null;

    const snapshot = await get(
        ref(
            db,
            `users/${awardsUser.uid}`
        )
    );

    return snapshot.exists()
        ? snapshot.val()
        : null;
}

/* ============================================================
   🏆 AWARD DEFINITIONS
   ============================================================ */

const AWARD_DEFINITIONS = [

    {
        id: "first_post",
        icon: "📢",
        name: "First Steps",
        description: "Publish your first community post.",
        rarity: "COMMON",
        points: 10,
        progress: stats => ({
            current: Math.min(stats.posts, 1),
            max: 1,
            text: `${stats.posts}/1 post`
        }),
        unlocked: stats => stats.posts >= 1
    },

    {
        id: "builder",
        icon: "🚀",
        name: "Builder",
        description: "Publish your first CodeOS project.",
        rarity: "COMMON",
        points: 25,
        progress: stats => ({
            current: Math.min(stats.projects, 1),
            max: 1,
            text: `${stats.projects}/1 project`
        }),
        unlocked: stats => stats.projects >= 1
    },

    {
        id: "project_machine",
        icon: "🏗️",
        name: "Project Machine",
        description: "Publish five community projects.",
        rarity: "RARE",
        points: 50,
        progress: stats => ({
            current: Math.min(stats.projects, 5),
            max: 5,
            text: `${stats.projects}/5 projects`
        }),
        unlocked: stats => stats.projects >= 5
    },

    {
        id: "crowd_favorite",
        icon: "❤️",
        name: "Crowd Favorite",
        description: "Receive ten likes across your posts.",
        rarity: "RARE",
        points: 50,
        progress: stats => ({
            current: Math.min(stats.likesReceived, 10),
            max: 10,
            text: `${stats.likesReceived}/10 likes`
        }),
        unlocked: stats => stats.likesReceived >= 10
    },

    {
        id: "heart_magnet",
        icon: "💗",
        name: "Heart Magnet",
        description: "Receive twenty-five loves.",
        rarity: "EPIC",
        points: 100,
        progress: stats => ({
            current: Math.min(stats.lovesReceived, 25),
            max: 25,
            text: `${stats.lovesReceived}/25 loves`
        }),
        unlocked: stats => stats.lovesReceived >= 25
    },

    {
        id: "community_voice",
        icon: "💬",
        name: "Community Voice",
        description: "Write ten community replies.",
        rarity: "RARE",
        points: 40,
        progress: stats => ({
            current: Math.min(stats.commentsWritten, 10),
            max: 10,
            text: `${stats.commentsWritten}/10 replies`
        }),
        unlocked: stats => stats.commentsWritten >= 10
    },

    {
        id: "teacher",
        icon: "📚",
        name: "Teacher",
        description: "Publish your first tutorial.",
        rarity: "RARE",
        points: 40,
        progress: stats => ({
            current: Math.min(stats.tutorials, 1),
            max: 1,
            text: `${stats.tutorials}/1 tutorial`
        }),
        unlocked: stats => stats.tutorials >= 1
    },

    {
        id: "group_founder",
        icon: "👥",
        name: "Group Founder",
        description: "Create your first community group.",
        rarity: "RARE",
        points: 40,
        progress: stats => ({
            current: Math.min(stats.groupsCreated, 1),
            max: 1,
            text: `${stats.groupsCreated}/1 group`
        }),
        unlocked: stats => stats.groupsCreated >= 1
    },

    {
        id: "challenger",
        icon: "⚔️",
        name: "Challenger",
        description: "Submit a project to an official challenge.",
        rarity: "EPIC",
        points: 75,
        progress: stats => ({
            current: Math.min(stats.challengeSubmissions, 1),
            max: 1,
            text: `${stats.challengeSubmissions}/1 submission`
        }),
        unlocked: stats => stats.challengeSubmissions >= 1
    },

    {
        id: "champion",
        icon: "👑",
        name: "Champion",
        description: "Win an official CodeOS challenge.",
        rarity: "LEGENDARY",
        points: 250,
        progress: stats => ({
            current: Math.min(stats.challengeWins, 1),
            max: 1,
            text: `${stats.challengeWins}/1 win`
        }),
        unlocked: stats => stats.challengeWins >= 1
    }
];

/* ============================================================
   📊 CALCULATE USER COMMUNITY STATS
   ============================================================ */

async function calculateCommunityStats(uid) {

    const stats = {
        posts: 0,
        projects: 0,
        likesReceived: 0,
        lovesReceived: 0,
        commentsWritten: 0,
        tutorials: 0,
        groupsCreated: 0,
        challengeSubmissions: 0,
        challengeWins: 0
    };

    const [
        postsSnapshot,
        commentsSnapshot,
        groupsSnapshot,
        challengesSnapshot
    ] = await Promise.all([

        get(ref(db, "posts")),
        get(ref(db, "comments")),
        get(ref(db, "groups")),
        get(ref(db, "challenges"))

    ]);

    if (postsSnapshot.exists()) {

        postsSnapshot.forEach(child => {

            const post = child.val();

            if (post.authorId !== uid) {
                return;
            }

            stats.posts++;

            if (post.type === "project") {
                stats.projects++;
            }

            if (post.type === "tutorial") {
                stats.tutorials++;
            }

            stats.likesReceived +=
                post.likedBy
                    ? Object.keys(post.likedBy).length
                    : Number(post.likes || 0);

            stats.lovesReceived +=
                post.lovedBy
                    ? Object.keys(post.lovedBy).length
                    : Number(post.loves || 0);
        });
    }

    if (commentsSnapshot.exists()) {

        commentsSnapshot.forEach(postComments => {

            postComments.forEach(child => {

                const comment = child.val();

                if (comment.authorId === uid) {
                    stats.commentsWritten++;
                }
            });
        });
    }

    if (groupsSnapshot.exists()) {

        groupsSnapshot.forEach(child => {

            const group = child.val();

            if (group.ownerId === uid) {
                stats.groupsCreated++;
            }
        });
    }

    if (challengesSnapshot.exists()) {

        challengesSnapshot.forEach(child => {

            const challenge = child.val();

            if (
                challenge.winnerUserId === uid
            ) {
                stats.challengeWins++;
            }

            const submissions =
                challenge.submissions || {};

            Object.values(submissions).forEach(
                submission => {

                    if (submission.userId === uid) {
                        stats.challengeSubmissions++;
                    }
                }
            );
        });
    }

    return stats;
}

/* ============================================================
   🏅 CHECK + UNLOCK AWARDS
   ============================================================ */

async function checkAndUnlockAwards() {

    if (!awardsUser) return;

    const stats =
        await calculateCommunityStats(
            awardsUser.uid
        );

    const existingSnapshot =
        await get(
            ref(
                db,
                `users/${awardsUser.uid}/${USER_AWARDS_PATH}`
            )
        );

    const existing =
        existingSnapshot.exists()
            ? existingSnapshot.val()
            : {};

    let changed = false;

    for (const award of AWARD_DEFINITIONS) {

        if (!award.unlocked(stats)) {
            continue;
        }

        if (existing[award.id]) {
            continue;
        }

        await set(
            ref(
                db,
                `users/${awardsUser.uid}/${USER_AWARDS_PATH}/${award.id}`
            ),
            {
                id: award.id,
                name: award.name,
                icon: award.icon,
                description: award.description,
                rarity: award.rarity,
                points: award.points,
                earnedAt:
                    serverTimestamp(),
                automatic: true
            }
        );

        changed = true;

        showAwardUnlockFlash(award);
    }

    if (changed) {
        await renderAwardsPage();
    } else {
        await renderAwardsPage();
    }

    return stats;
}

/* ============================================================
   🎉 AWARD UNLOCK POPUP
   ============================================================ */

function showAwardUnlockFlash(award) {

    const existing =
        document.querySelector(
            ".awardUnlockedFlash"
        );

    existing?.remove();

    const flash =
        document.createElement("div");

    flash.className =
        "awardUnlockedFlash";

    flash.innerHTML = `
        <div class="flashIcon">
            ${escapeAwardHTML(award.icon)}
        </div>

        <h3>
            🏆 Award Unlocked!
        </h3>

        <strong>
            ${escapeAwardHTML(award.name)}
        </strong>

        <p>
            ${escapeAwardHTML(
                award.description
            )}
        </p>

        <p style="margin-top:8px;">
            +${award.points} XP
            · ${escapeAwardHTML(
                award.rarity
            )}
        </p>
    `;

    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
    }, 6500);
}

/* ============================================================
   🏆 RENDER AWARDS PAGE
   ============================================================ */

async function renderAwardsPage() {

    if (!awardsShrine) return;

    if (!awardsUser) {

        awardsShrine.innerHTML = `
            <div class="extensionEmpty">
                <div style="font-size:50px;">🔐</div>
                <h3>Sign in to see your awards</h3>
                <p>
                    Your CodeOS achievements will appear here.
                </p>
            </div>
        `;

        return;
    }

    const stats =
        await calculateCommunityStats(
            awardsUser.uid
        );

    const awardsSnapshot =
        await get(
            ref(
                db,
                `users/${awardsUser.uid}/${USER_AWARDS_PATH}`
            )
        );

    const earned =
        awardsSnapshot.exists()
            ? awardsSnapshot.val()
            : {};

    const earnedCount =
        Object.keys(earned).length;

    const earnedXP =
        Object.values(earned)
            .reduce(
                (total, award) =>
                    total + Number(award.points || 0),
                0
            );

    const totalAwards =
        AWARD_DEFINITIONS.length;

    const completion =
        totalAwards
            ? Math.round(
                earnedCount /
                totalAwards *
                100
            )
            : 0;

    awardsShrine.innerHTML = `

        <div class="awardsDashboard">

            <div class="awardStatCard">
                <strong>${earnedCount}</strong>
                <span>Awards Earned</span>
            </div>

            <div class="awardStatCard">
                <strong>${earnedXP}</strong>
                <span>Community XP</span>
            </div>

            <div class="awardStatCard">
                <strong>${completion}%</strong>
                <span>Collection Complete</span>
            </div>

            <div class="awardStatCard">
                <strong>${stats.projects}</strong>
                <span>Projects Built</span>
            </div>

        </div>

        <div class="awardsSection">
            <div class="awardsSectionHeader">

                <div>
                    <h2>🏅 My Awards</h2>
                    <p>
                        Keep building to unlock them all.
                    </p>
                </div>

            </div>

            <div class="awardsGrid">
                ${
                    AWARD_DEFINITIONS
                        .map(
                            award =>
                                renderAwardCard(
                                    award,
                                    earned,
                                    stats
                                )
                        )
                        .join("")
                }
            </div>
        </div>

        <div class="awardsSection">

            <div class="awardsSectionHeader">

                <div>
                    <h2>👑 Hall of Fame</h2>
                    <p>
                        CodeOS community members collecting glory.
                    </p>
                </div>

            </div>

            <div
                id="awardHallOfFame"
                style="
                    display:grid;
                    gap:10px;
                "
            >
                <div class="extensionEmpty">
                    Loading Hall of Fame...
                </div>
            </div>

        </div>
    `;

    await renderAwardHallOfFame();
}

/* ============================================================
   🏅 AWARD CARD
   ============================================================ */

function renderAwardCard(
    award,
    earned,
    stats
) {

    const isUnlocked =
        !!earned[award.id];

    const progress =
        award.progress(stats);

    const percent =
        Math.min(
            100,
            Math.round(
                progress.current /
                progress.max *
                100
            )
        );

    return `
        <article
            class="
                communityAwardCard
                ${isUnlocked ? "unlocked" : ""}
            "
        >

            <div class="awardIconBig">
                ${escapeAwardHTML(
                    award.icon
                )}
            </div>

            <div class="awardRarity">
                ${escapeAwardHTML(
                    award.rarity
                )}
            </div>

            <div class="awardName">
                ${escapeAwardHTML(
                    award.name
                )}
            </div>

            <div class="awardDescription">
                ${escapeAwardHTML(
                    award.description
                )}
            </div>

            ${
                isUnlocked
                    ? `
                        <div class="awardUnlocked">
                            ✅ Unlocked
                            · +${award.points} XP
                        </div>
                    `
                    : `
                        <div class="awardProgress">

                            <div class="awardProgressTrack">
                                <div
                                    class="awardProgressFill"
                                    style="
                                        width:${percent}%;
                                    "
                                ></div>
                            </div>

                            <div class="awardProgressText">
                                ${escapeAwardHTML(
                                    progress.text
                                )}
                            </div>

                        </div>
                    `
            }

        </article>
    `;
}

/* ============================================================
   👑 HALL OF FAME
   ============================================================ */

async function renderAwardHallOfFame() {

    const container =
        document.getElementById(
            "awardHallOfFame"
        );

    if (!container) return;

    const usersSnapshot =
        await get(
            ref(db, "users")
        );

    if (!usersSnapshot.exists()) {

        container.innerHTML = `
            <div class="extensionEmpty">
                No community members yet.
            </div>
        `;

        return;
    }

    const users = [];

    usersSnapshot.forEach(child => {

        const user =
            child.val();

        const awards =
            user.awards || {};

        const count =
            Object.keys(awards).length;

        if (!count) return;

        const xp =
            Object.values(awards)
                .reduce(
                    (total, award) =>
                        total +
                        Number(
                            award.points || 0
                        ),
                    0
                );

        users.push({
            uid: child.key,
            username:
                user.username ||
                "CodeOS Member",
            avatar:
                user.avatar || "",
            awards: count,
            xp
        });
    });

    users.sort(
        (a, b) =>
            b.xp - a.xp ||
            b.awards - a.awards
    );

    if (!users.length) {

        container.innerHTML = `
            <div class="extensionEmpty">
                🏆 Nobody has unlocked an award yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        users
            .slice(0, 12)
            .map(
                (user, index) => `

                    <div class="awardHallUser">

                        <div class="awardHallUserIcon">
                            ${
                                index === 0
                                    ? "👑"
                                    : index === 1
                                        ? "🥈"
                                        : index === 2
                                            ? "🥉"
                                            : "🏅"
                            }
                        </div>

                        <div style="flex:1;">
                            <strong>
                                ${escapeAwardHTML(
                                    user.username
                                )}
                            </strong>

                            <span>
                                ${user.awards} awards
                                · ${user.xp} XP
                            </span>
                        </div>

                    </div>
                `
            )
            .join("");
}

/* ============================================================
   💎 ELDER MODERATOR AWARD MANAGER
   ============================================================ */

async function updateAwardManagerVisibility() {

    const button =
        document.getElementById(
            "openAwardManagerBtn"
        );

    if (!button) return;

    const profile =
        await getAwardsProfile();

    const allowed =
        profile?.username === "ron_weasley";

    button.classList.toggle(
        "hidden",
        !allowed
    );
}

document
    .getElementById(
        "openAwardManagerBtn"
    )
    ?.addEventListener(
        "click",
        openAwardManager
    );

async function openAwardManager() {

    if (!awardsUser) return;

    const profile =
        await getAwardsProfile();

    if (
        profile?.username !==
        "ron_weasley"
    ) {
        alert(
            "💎 Only the Elder Moderator can manually award users."
        );
        return;
    }

    const modal =
        document.createElement("div");

    modal.className =
        "modal";

    modal.id =
        "communityAwardManagerModal";

    modal.innerHTML = `

        <div class="modalBox">

            <button
                class="closeModal"
                id="closeCommunityAwardManager"
            >
                ✕
            </button>

            <div class="modalIcon">
                🏆
            </div>

            <h2>
                Award Manager
            </h2>

            <p>
                Grant an official Community award.
            </p>

            <input
                id="awardManagerSearch"
                type="search"
                placeholder="Search username..."
            />

            <div
                id="awardManagerUsers"
                style="
                    display:grid;
                    gap:8px;
                    margin:12px 0;
                "
            ></div>

            <div
                id="awardManagerEditor"
                style="display:none;"
            >

                <h3>
                    Choose an award
                </h3>

                <div
                    id="awardManagerOptions"
                    style="
                        display:grid;
                        gap:8px;
                        margin-top:10px;
                    "
                ></div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById(
            "closeCommunityAwardManager"
        )
        ?.addEventListener(
            "click",
            () => modal.remove()
        );

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

    const searchInput =
        document.getElementById(
            "awardManagerSearch"
        );

    searchInput.addEventListener(
        "input",
        async () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            const results =
                document.getElementById(
                    "awardManagerUsers"
                );

            results.innerHTML = "";

            if (!query) return;

            const snapshot =
                await get(
                    ref(
                        db,
                        "users"
                    )
                );

            if (!snapshot.exists()) return;

            snapshot.forEach(child => {

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

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.style.cssText = `
                    border:1px solid rgba(255,255,255,.08);
                    padding:12px;
                    border-radius:13px;
                    background:rgba(255,255,255,.04);
                    color:inherit;
                    cursor:pointer;
                    text-align:left;
                `;

                button.innerHTML = `
                    👤
                    <strong>
                        ${escapeAwardHTML(
                            username
                        )}
                    </strong>
                `;

                button.onclick = () => {

                    renderAwardManagerOptions(
                        child.key,
                        username
                    );
                };

                results.appendChild(
                    button
                );
            });
        }
    );
}

function renderAwardManagerOptions(
    uid,
    username
) {

    const editor =
        document.getElementById(
            "awardManagerEditor"
        );

    const options =
        document.getElementById(
            "awardManagerOptions"
        );

    if (!editor || !options) return;

    editor.style.display =
        "block";

    options.innerHTML =
        AWARD_DEFINITIONS
            .map(
                award => `
                    <button
                        type="button"
                        data-award-id="${award.id}"
                        style="
                            border:1px solid rgba(255,255,255,.08);
                            padding:13px;
                            border-radius:14px;
                            background:rgba(255,255,255,.04);
                            color:inherit;
                            cursor:pointer;
                            text-align:left;
                        "
                    >
                        ${escapeAwardHTML(
                            award.icon
                        )}
                        <strong>
                            ${escapeAwardHTML(
                                award.name
                            )}
                        </strong>
                        <small>
                            · ${escapeAwardHTML(
                                award.rarity
                            )}
                        </small>
                    </button>
                `
            )
            .join("");

    options
        .querySelectorAll(
            "[data-award-id]"
        )
        .forEach(button => {

            button.onclick =
                async () => {

                    const award =
                        AWARD_DEFINITIONS.find(
                            item =>
                                item.id ===
                                button.dataset.awardId
                        );

                    if (!award) return;

                    await set(
                        ref(
                            db,
                            `users/${uid}/${USER_AWARDS_PATH}/${award.id}`
                        ),
                        {
                            id: award.id,
                            name: award.name,
                            icon: award.icon,
                            description:
                                award.description,
                            rarity:
                                award.rarity,
                            points:
                                award.points,
                            earnedAt:
                                serverTimestamp(),
                            automatic: false,
                            awardedBy:
                                awardsUser.uid
                        }
                    );

                    await update(
                        ref(
                            db,
                            `notifications/${uid}/${push(
                                ref(db, `notifications/${uid}`)
                            ).key}`
                        ),
                        {
                            type:
                                "award_granted",
                            title:
                                "🏆 You received an official award!",
                            message:
                                `${username} has received "${award.name}" from the CodeOS Elder Moderator.`,
                            badgeIcon:
                                award.icon,
                            badgeName:
                                award.name,
                            createdAt:
                                serverTimestamp(),
                            read: false
                        }
                    );

                    alert(
                        `🏆 ${award.name} awarded to ${username}!`
                    );
                };
        });
}

/* ============================================================
   ⚡ EXTENSIONS
   ============================================================ */

const extensionCategoryFilter =
    document.getElementById(
        "extensionCategoryFilter"
    );

const extensionSearchInput =
    document.getElementById(
        "extensionSearchInput"
    );

const extensionTabs =
    document.querySelectorAll(
        ".extensionTab"
    );

extensionSearchInput?.addEventListener(
    "input",
    () => {

        extensionSearchQuery =
            extensionSearchInput.value
                .trim()
                .toLowerCase();

        renderExtensions();
    }
);

extensionCategoryFilter?.addEventListener(
    "change",
    () => {

        extensionCategory =
            extensionCategoryFilter.value;

        renderExtensions();
    }
);

extensionTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            extensionTabs.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );

            tab.classList.add(
                "active"
            );

            currentExtensionFilter =
                tab.dataset.extensionFilter ||
                "all";

            renderExtensions();
        }
    );
});

/* ============================================================
   📡 LOAD EXTENSIONS
   ============================================================ */

function loadCommunityExtensions() {

    onValue(
        ref(db, EXTENSIONS_PATH),
        snapshot => {

            allCommunityExtensions = [];

            if (snapshot.exists()) {

                snapshot.forEach(child => {

                    allCommunityExtensions.push({
                        id:
                            child.key,
                        ...child.val()
                    });
                });
            }

            renderExtensions();
            updateExtensionStats();
        }
    );
}

/* ============================================================
   📊 EXTENSION STATS
   ============================================================ */

function updateExtensionStats() {

    const bar =
        document.getElementById(
            "extensionStatsBar"
        );

    if (!bar) return;

    const installed =
        Object.keys(
            getLocalInstalledExtensions()
        ).length;

    const totalInstalls =
        allCommunityExtensions
            .reduce(
                (total, extension) =>
                    total +
                    Number(
                        extension.installs || 0
                    ),
                0
            );

    const creators =
        new Set(
            allCommunityExtensions
                .map(
                    extension =>
                        extension.authorId
                )
                .filter(Boolean)
        ).size;

    bar.innerHTML = `

        <div class="extensionStat">
            <strong>
                ${allCommunityExtensions.length}
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
                ${totalInstalls}
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
                Extension Creators
            </span>
        </div>

    `;
}

/* ============================================================
   🔎 FILTER EXTENSIONS
   ============================================================ */

function getFilteredExtensions() {

    let extensions =
        [...allCommunityExtensions];

    if (extensionSearchQuery) {

        extensions =
            extensions.filter(
                extension =>
                    String(
                        extension.name || ""
                    )
                        .toLowerCase()
                        .includes(
                            extensionSearchQuery
                        ) ||
                    String(
                        extension.description || ""
                    )
                        .toLowerCase()
                        .includes(
                            extensionSearchQuery
                        )
            );
    }

    if (
        extensionCategory !==
        "all"
    ) {

        extensions =
            extensions.filter(
                extension =>
                    (
                        extension.category ||
                        "other"
                    ) ===
                    extensionCategory
            );
    }

    if (
        currentExtensionFilter ===
        "installed"
    ) {

        extensions =
            extensions.filter(
                extension =>
                    isExtensionInstalled(
                        extension.id
                    )
            );
    }

    if (
        currentExtensionFilter ===
        "mine"
    ) {

        extensions =
            extensions.filter(
                extension =>
                    extension.authorId ===
                    awardsUser?.uid
            );
    }

    if (
        currentExtensionFilter ===
        "popular"
    ) {

        extensions.sort(
            (a, b) =>
                Number(
                    b.installs || 0
                ) -
                Number(
                    a.installs || 0
                )
        );
    }

    if (
        currentExtensionFilter ===
        "new"
    ) {

        extensions.sort(
            (a, b) =>
                Number(
                    b.createdAt || 0
                ) -
                Number(
                    a.createdAt || 0
                )
        );
    }

    return extensions;
}

/* ============================================================
   🧩 RENDER EXTENSIONS
   ============================================================ */

function renderExtensions() {

    if (!extensionsGrid) return;

    const extensions =
        getFilteredExtensions();

    if (!extensions.length) {

        extensionsGrid.innerHTML = `
            <div class="extensionEmpty">
                <div style="font-size:48px;">
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

    extensionsGrid.innerHTML =
        extensions
            .map(
                extension =>
                    renderExtensionCard(
                        extension
                    )
            )
            .join("");

    extensionsGrid
        .querySelectorAll(
            "[data-extension-open]"
        )
        .forEach(button => {

            button.onclick = () => {

                const extension =
                    allCommunityExtensions
                        .find(
                            item =>
                                item.id ===
                                button.dataset
                                    .extensionOpen
                        );

                if (extension) {
                    openExtensionDetails(
                        extension
                    );
                }
            };
        });

    extensionsGrid
        .querySelectorAll(
            "[data-extension-install]"
        )
        .forEach(button => {

            button.onclick = () => {

                const extension =
                    allCommunityExtensions
                        .find(
                            item =>
                                item.id ===
                                button.dataset
                                    .extensionInstall
                        );

                if (extension) {
                    toggleExtensionInstall(
                        extension
                    );
                }
            };
        });
}

/* ============================================================
   ⚡ EXTENSION CARD
   ============================================================ */

function renderExtensionCard(
    extension
) {

    const installed =
        isExtensionInstalled(
            extension.id
        );

    const permissions =
        Array.isArray(
            extension.permissions
        )
            ? extension.permissions
            : [];

    return `

        <article class="extensionCard">

            <div class="extensionCardTop">

                <div class="extensionIcon">
                    ${escapeAwardHTML(
                        extension.icon ||
                        "⚡"
                    )}
                </div>

                <div>

                    <h3>
                        ${escapeAwardHTML(
                            extension.name ||
                            "Untitled Extension"
                        )}
                    </h3>

                    <div class="extensionVersion">
                        v${escapeAwardHTML(
                            extension.version ||
                            "1.0.0"
                        )}
                    </div>

                </div>

            </div>

            <div class="extensionCardBody">

                <p>
                    ${escapeAwardHTML(
                        extension.description ||
                        "No description."
                    )}
                </p>

                <div class="extensionTags">

                    <span class="extensionTag">
                        ${escapeAwardHTML(
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

                    ${
                        permissions.length
                            ? `
                                <span class="extensionTag">
                                    🔐 ${permissions.length} permissions
                                </span>
                            `
                            : ""
                    }

                </div>

                <div class="extensionMeta">

                    <span>
                        👤
                        ${escapeAwardHTML(
                            extension.authorName ||
                            "CodeOS Creator"
                        )}
                    </span>

                    <span>
                        📦
                        ${Number(
                            extension.installs || 0
                        )}
                        installs
                    </span>

                </div>

                <div class="extensionActions">

                    <button
                        class="extensionActionButton"
                        type="button"
                        data-extension-open="${extension.id}"
                    >
                        Details
                    </button>

                    <button
                        class="
                            extensionActionButton
                            primary
                            ${installed ? "danger" : ""}
                        "
                        type="button"
                        data-extension-install="${extension.id}"
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
   📦 INSTALL / UNINSTALL
   ============================================================ */

async function toggleExtensionInstall(
    extension
) {

    if (!awardsUser) {

        alert(
            "🔐 Sign in to install CodeOS extensions."
        );

        return;
    }

    const installed =
        getLocalInstalledExtensions();

    if (
        installed[extension.id]
    ) {

        delete installed[
            extension.id
        ];

        saveLocalInstalledExtensions(
            installed
        );

        await remove(
            ref(
                db,
                `${EXTENSION_INSTALLS_PATH}/${awardsUser.uid}/${extension.id}`
            )
        );

        renderExtensions();
        updateExtensionStats();

        return;
    }

    installed[
        extension.id
    ] = {

        id:
            extension.id,

        name:
            extension.name,

        version:
            extension.version ||
            "1.0.0",

        installedAt:
            Date.now(),

        permissions:
            extension.permissions ||
            [],

        manifestVersion:
            1

    };

    saveLocalInstalledExtensions(
        installed
    );

    await set(
        ref(
            db,
            `${EXTENSION_INSTALLS_PATH}/${awardsUser.uid}/${extension.id}`
        ),
        {
            extensionId:
                extension.id,

            version:
                extension.version ||
                "1.0.0",

            installedAt:
                serverTimestamp()
        }
    );

    await update(
        ref(
            db,
            `${EXTENSIONS_PATH}/${extension.id}`
        ),
        {
            installs:
                increment(1)
        }
    );

    alert(
        `⚡ ${extension.name} installed!`
    );

    renderExtensions();
    updateExtensionStats();
}

/* ============================================================
   🔍 EXTENSION DETAILS
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

    modal.innerHTML = `

        <div class="modalBox">

            <button
                class="closeModal"
                type="button"
            >
                ✕
            </button>

            <div class="extensionDetail">

                <div class="extensionDetailHero">

                    <div class="extensionDetailIcon">
                        ${escapeAwardHTML(
                            extension.icon ||
                            "⚡"
                        )}
                    </div>

                    <div>

                        <h2>
                            ${escapeAwardHTML(
                                extension.name ||
                                "Extension"
                            )}
                        </h2>

                        <p>
                            v${escapeAwardHTML(
                                extension.version ||
                                "1.0.0"
                            )}
                            ·
                            ${escapeAwardHTML(
                                extension.category ||
                                "Other"
                            )}
                        </p>

                    </div>

                </div>

                <p>
                    ${escapeAwardHTML(
                        extension.description ||
                        "No description."
                    )}
                </p>

                <div>

                    <strong>
                        👤 Creator
                    </strong>

                    <div>
                        ${escapeAwardHTML(
                            extension.authorName ||
                            "CodeOS Creator"
                        )}
                    </div>

                </div>

                <div>

                    <strong>
                        🔐 Permissions
                    </strong>

                    <div class="extensionPermissionList">

                        ${
                            (
                                extension.permissions ||
                                []
                            )
                                .map(
                                    permission => `
                                        <span class="extensionPermission">
                                            ${escapeAwardHTML(
                                                permission
                                            )}
                                        </span>
                                    `
                                )
                                .join("")
                            ||
                            `
                                <span class="extensionPermission">
                                    None
                                </span>
                            `
                        }

                    </div>

                </div>

                <div>

                    <strong>
                        📦 Installs
                    </strong>

                    <div>
                        ${Number(
                            extension.installs ||
                            0
                        )}
                    </div>

                </div>

                <button
                    type="button"
                    class="publishBtn"
                    id="extensionDetailInstall"
                >
                    ${
                        isExtensionInstalled(
                            extension.id
                        )
                            ? "✓ Installed"
                            : "⚡ Install Extension"
                    }
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        modal
    );

    modal
        .querySelector(
            ".closeModal"
        )
        .onclick =
            () => modal.remove();

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {
                modal.remove();
            }

        }
    );

    modal
        .querySelector(
            "#extensionDetailInstall"
        )
        .onclick =
            async () => {

                await toggleExtensionInstall(
                    extension
                );

                modal.remove();
            };
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
        openCreateExtensionModal
    );

async function openCreateExtensionModal() {

    if (!awardsUser) {

        alert(
            "🔐 Sign in to publish an extension."
        );

        return;
    }

    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "modal";

    modal.innerHTML = `

        <div class="modalBox">

            <button
                class="closeModal"
                type="button"
                id="closeCreateExtension"
            >
                ✕
            </button>

            <div class="modalIcon">
                ⚡
            </div>

            <h2>
                Create Extension
            </h2>

            <p>
                Publish an extension manifest to the CodeOS marketplace.
            </p>

            <input
                id="newExtensionName"
                type="text"
                maxlength="60"
                placeholder="Extension name"
            />

            <textarea
                id="newExtensionDescription"
                maxlength="400"
                placeholder="What does your extension do?"
            ></textarea>

            <input
                id="newExtensionIcon"
                type="text"
                maxlength="4"
                placeholder="Icon e.g. 🧩"
            />

            <select
                id="newExtensionCategory"
            >
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

            <input
                id="newExtensionVersion"
                type="text"
                maxlength="20"
                value="1.0.0"
                placeholder="Version"
            />

            <input
                id="newExtensionPermissions"
                type="text"
                maxlength="300"
                placeholder="Permissions, comma separated"
            />

            <input
                id="newExtensionRepository"
                type="url"
                placeholder="Repository / documentation URL (optional)"
            />

            <button
                id="publishExtensionButton"
                class="publishBtn"
                type="button"
            >
                🚀 Publish Extension
            </button>

            <div
                id="newExtensionStatus"
                class="authStatus"
            ></div>

        </div>
    `;

    document.body.appendChild(
        modal
    );

    modal
        .querySelector(
            "#closeCreateExtension"
        )
        .onclick =
            () => modal.remove();

    modal
        .querySelector(
            "#publishExtensionButton"
        )
        .onclick =
            async () => {

                await createCommunityExtension(
                    modal
                );
            };
}

/* ============================================================
   🚀 PUBLISH EXTENSION
   ============================================================ */

async function createCommunityExtension(
    modal
) {

    const name =
        modal
            .querySelector(
                "#newExtensionName"
            )
            ?.value
            .trim();

    const description =
        modal
            .querySelector(
                "#newExtensionDescription"
            )
            ?.value
            .trim();

    const icon =
        modal
            .querySelector(
                "#newExtensionIcon"
            )
            ?.value
            .trim();

    const category =
        modal
            .querySelector(
                "#newExtensionCategory"
            )
            ?.value ||
        "other";

    const version =
        modal
            .querySelector(
                "#newExtensionVersion"
            )
            ?.value
            .trim() ||
        "1.0.0";

    const permissionInput =
        modal
            .querySelector(
                "#newExtensionPermissions"
            )
            ?.value
            .trim();

    const repository =
        modal
            .querySelector(
                "#newExtensionRepository"
            )
            ?.value
            .trim();

    const status =
        modal
            .querySelector(
                "#newExtensionStatus"
            );

    if (!name) {

        status.innerText =
            "⚠️ Enter an extension name.";

        return;
    }

    if (!description) {

        status.innerText =
            "⚠️ Add an extension description.";

        return;
    }

    const permissions =
        permissionInput
            ? permissionInput
                .split(",")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
            : [];

    try {

        const profile =
            await getAwardsProfile();

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
                icon:
                    icon || "⚡",
                category,
                version,
                permissions,
                repository:
                    repository || "",
                authorId:
                    awardsUser.uid,
                authorName:
                    profile?.username ||
                    awardsUser.displayName ||
                    "CodeOS Creator",
                installs: 0,
                official: false,
                active: true,
                createdAt:
                    serverTimestamp()
            }
        );

        alert(
            `⚡ "${name}" published!`
        );

        modal.remove();

    } catch (error) {

        console.error(
            "Extension publishing error:",
            error
        );

        status.innerText =
            "❌ " +
            error.message;
    }
}

/* ============================================================
   🔐 AUTH
   ============================================================ */

onAuthStateChanged(
    auth,
    async user => {

        awardsUser =
            user;

        if (!user) {

            awardsProfile =
                null;

            if (awardsShrine) {
                await renderAwardsPage();
            }

            renderExtensions();
            updateExtensionStats();

            return;
        }

        awardsProfile =
            await getAwardsProfile();

        await updateAwardManagerVisibility();

        /*
            Check awards whenever Community loads.
        */
        await checkAndUnlockAwards();

        renderExtensions();
        updateExtensionStats();
    }
);

/* ============================================================
   🚀 INITIAL LOAD
   ============================================================ */

loadCommunityExtensions();

if (awardsShrine) {
    renderAwardsPage();
}

/* ============================================================
   🔄 REFRESH AWARDS WHEN USER VISITS PAGE
   ============================================================ */

document
    .querySelector(
        '[data-page="awards"]'
    )
    ?.addEventListener(
        "click",
        async () => {

            await checkAndUnlockAwards();
        }
    );

/* ============================================================
   🔄 REFRESH EXTENSIONS WHEN USER VISITS PAGE
   ============================================================ */

document
    .querySelector(
        '[data-page="extensions"]'
    )
    ?.addEventListener(
        "click",
        () => {

            renderExtensions();
            updateExtensionStats();
        }
    );