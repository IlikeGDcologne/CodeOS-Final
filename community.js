import {
    auth,
    db,
    googleProvider
} from "./firebase.js";

import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

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


const loginBtn =
    document.getElementById("loginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const loginModal =
    document.getElementById("loginModal");

const closeLogin =
    document.getElementById("closeLogin");

const googleLogin =
    document.getElementById("googleLogin");

const emailLogin =
    document.getElementById("emailLogin");

const emailSignup =
    document.getElementById("emailSignup");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const authStatus =
    document.getElementById("authStatus");

const userName =
    document.getElementById("loginBtn");

const postInput =
    document.getElementById("postInput");

const postType =
    document.getElementById("postType");

const postBtn =
    document.getElementById("postBtn");

const moderatorsNavItem =
    document.getElementById("moderatorsNavItem");

const ownerModeratorManagement =
    document.getElementById("ownerModeratorManagement");

const moderatorUserSearch =
    document.getElementById("moderatorUserSearch");

const moderatorUserResults =
    document.getElementById("moderatorUserResults");

const moderatorList =
    document.getElementById("moderatorList");

const feed =
    document.getElementById("feed");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profileRole = document.getElementById("profileRole");
const profileAvatar = document.getElementById("profileAvatar");
const profileStatus = document.getElementById("profileStatus");

const profileJoined = document.getElementById("profileJoined");

const profilePostCount =
    document.getElementById("profilePostCount");

const profileLikes =
    document.getElementById("profileLikes");

const profileLoves =
    document.getElementById("profileLoves");

const profileBadgeCount =
    document.getElementById("profileBadgeCount");

const profileBadges =
    document.getElementById("profileBadges");

const profilePosts =
    document.getElementById("profilePosts");

const editProfileBtn =
    document.getElementById("editProfileBtn");

const profileModal =
    document.getElementById("profileModal");

const closeProfileModal =
    document.getElementById("closeProfileModal");

const profileUsername =
    document.getElementById("profileUsername");

const profileBioInput =
    document.getElementById("profileBioInput");

const profileAvatarInput =
    document.getElementById("profileAvatarInput");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const profileSaveStatus =
    document.getElementById("profileSaveStatus");

const moderatorsTab =
    document.getElementById("moderatorsTab");

const moderatorsPage =
    document.getElementById("moderatorsPage");

const moderatorManagement =
    document.getElementById("moderatorManagement");

const moderationManagement =
    document.getElementById("moderationManagement");

const awardManagement =
    document.getElementById("awardManagement");

const testAccountManagement =
    document.getElementById("testAccountManagement");

// ========================================
// 🚀 PROJECT DISCOVERY PAGE
// ADDITION ONLY
// ========================================

const projectsPage =
    document.getElementById("projectsPage");

// ========================================
// 🧩 POST TYPE COMPOSER SYSTEM
// ========================================

const postTypeComposer =
    document.getElementById("postTypeComposer");

// ========================================
// 💎 CODEOS MODERATION SYSTEM
// ========================================

// 👑 The one and only Elder Moderator
const ELDER_MODERATOR_USERNAME = "ron_weasley";

// Current moderation information
let currentUserRole = "user";
let isElderModerator = false;
let isModerator = false;
let userIsModerator = false;

// Moderation data
let moderators = [];
let bannedUsers = [];
let activeFilter = "all";

// ========================================
// 🔐 MODERATION ROLE CHECK
// ========================================

function updateModerationRole(userData) {
    const username = userData?.username || "";

    // 👑 Elder Moderator
    if (username === ELDER_MODERATOR_USERNAME) {
        currentUserRole = "elderModerator";
        isElderModerator = true;
        isModerator = true;
        return;
    }

    // 💎 Regular Moderator
    if (userData?.role === "moderator") {
        currentUserRole = "moderator";
        isElderModerator = false;
        isModerator = true;
        return;
    }

    // 👤 Normal user
    currentUserRole = "user";
    isElderModerator = false;
    isModerator = false;
}

// ========================================
// 🛡️ PERMISSION HELPERS
// ========================================
async function canCurrentUserModerate() {
    if (!currentUser) return false;

    const snapshot = await get(
        ref(db, `users/${currentUser.uid}`)
    );

    if (!snapshot.exists()) return false;

    const profile = snapshot.val();

    return (
        profile.username === "ron_weasley" ||
        profile.isModerator === true
    );
}

function canManageModerators() {
    // ONLY ron_weasley
    return isElderModerator;
}

function canGiveAwards() {
    // ONLY ron_weasley
    return isElderModerator;
}

function canManageProjects() {
    return isElderModerator || isModerator;
}

const postTypeDefinitions = {

    post: {
        placeholder:
            "Share something with the community..."
    },

    idea: {
        title: "💡 Share an Idea",
        description:
            "Got a brilliant idea? Put it out there.",
        fields: `
            <div class="typeComposerIcon">💡</div>

            <div class="typeComposerFields">

                <label>Idea title</label>

                <input
                    id="ideaTitleInput"
                    type="text"
                    maxlength="120"
                    placeholder="A better way to..."
                >

                <label>What's the idea?</label>

                <textarea
                    id="ideaDescriptionInput"
                    maxlength="1500"
                    placeholder="Explain your idea..."
                ></textarea>

            </div>
        `
    },

    question: {
        title: "❓ Ask the Community",
        description:
            "Ask a question and get help from other builders.",
        fields: `
            <div class="typeComposerIcon">❓</div>

            <div class="typeComposerFields">

                <label>Your question</label>

                <textarea
                    id="questionInput"
                    maxlength="1500"
                    placeholder="How do I...?"
                ></textarea>

            </div>
        `
    },

    poll: {
        title: "📊 Create a Poll",
        description:
            "Ask the community and see what everyone thinks.",
        fields: `
            <div class="typeComposerIcon">📊</div>

            <div class="typeComposerFields">

                <label>Poll question</label>

                <input
                    id="pollQuestionInput"
                    type="text"
                    maxlength="200"
                    placeholder="Which programming language do you prefer?"
                >

                <div id="pollOptionsComposer">

                    <label>Option 1</label>

                    <input
                        class="pollOptionInput"
                        type="text"
                        maxlength="100"
                        placeholder="Option 1"
                    >

                    <label>Option 2</label>

                    <input
                        class="pollOptionInput"
                        type="text"
                        maxlength="100"
                        placeholder="Option 2"
                    >

                </div>

                <button
                    type="button"
                    id="addPollOptionBtn"
                    class="secondaryComposerButton"
                >
                    + Add option
                </button>

            </div>
        `
    },

    achievement: {
        title: "🏆 Share an Achievement",
        description:
            "Celebrate something awesome you've accomplished.",
        fields: `
            <div class="typeComposerIcon">🏆</div>

            <div class="typeComposerFields">

                <label>Achievement title</label>

                <input
                    id="achievementTitleInput"
                    type="text"
                    maxlength="120"
                    placeholder="Built my first robot!"
                >

                <label>Tell us about it</label>

                <textarea
                    id="achievementDescriptionInput"
                    maxlength="1000"
                    placeholder="What did you accomplish?"
                ></textarea>

            </div>
        `
    },

    tutorial: {
        title: "📚 Create a Tutorial",
        description:
            "Teach the community something you know.",
        fields: `
            <div class="typeComposerIcon">📚</div>

            <div class="typeComposerFields">

                <label>Tutorial title</label>

                <input
                    id="tutorialTitleInput"
                    type="text"
                    maxlength="150"
                    placeholder="How to build..."
                >

                <label>Tutorial mode</label>

                <div class="tutorialModeSelector">

                    <button
                        type="button"
                        class="tutorialModeBtn active"
                        data-mode="steps"
                    >
                        🪜 Step-by-step
                    </button>

                    <button
                        type="button"
                        class="tutorialModeBtn"
                        data-mode="normal"
                    >
                        📄 Normal
                    </button>

                </div>

                <div id="tutorialStepsComposer"></div>

            </div>
        `
    },

    showcase: {
        title: "🎨 Showcase Your Work",
        description:
            "Show everyone something you've created.",
        fields: `
            <div class="typeComposerIcon">🎨</div>

            <div class="typeComposerFields">

                <label>Showcase title</label>

                <input
                    id="showcaseTitleInput"
                    type="text"
                    maxlength="150"
                    placeholder="Check out what I made..."
                >

                <label>Description</label>

                <textarea
                    id="showcaseDescriptionInput"
                    maxlength="1500"
                    placeholder="Tell the community about it..."
                ></textarea>

                <label>Image URL</label>

                <input
                    id="showcaseImageInput"
                    type="url"
                    placeholder="https://..."
                >

                <label>Link</label>

                <input
                    id="showcaseLinkInput"
                    type="url"
                    placeholder="https://..."
                >

            </div>
        `
    }

};

let communityProjectGrid = null;


// ========================================
// CREATE PROJECT GRID
// ========================================

function setupCommunityProjectPage() {

    if (!projectsPage) return;

    if (communityProjectGrid) return;


    communityProjectGrid =
        document.createElement("div");

    communityProjectGrid.className =
        "communityProjectGrid";


    projectsPage.appendChild(
        communityProjectGrid
    );


    //loadCommunityProjects();

}


// ========================================
// LOAD PROJECT POSTS
// ========================================

function loadCommunityProjects() {

    if (!communityProjectGrid) return;

    const projectsRef =
        ref(db, "posts");

    // Get moderation information once
    get(ref(db, "projectModeration"))
        .then(moderationSnapshot => {

            const moderation =
                moderationSnapshot.exists()
                    ? moderationSnapshot.val()
                    : {};

            onValue(
                projectsRef,
                snapshot => {

                    communityProjectGrid.innerHTML = "";

                    if (!snapshot.exists()) {
                        communityProjectGrid.innerHTML = `
                            <div class="empty">
                                🚀 No community projects yet.
                                <br><br>
                                Be the first to publish one!
                            </div>
                        `;
                        return;
                    }

                    const projects = [];

                    snapshot.forEach(child => {

                        const post = {
                            id: child.key,
                            ...child.val()
                        };

                        if (
                            post.type === "project" &&
                            post.project
                        ) {

                            // ⭐ Attach moderation data
                            const mod =
                                moderation[post.id] || {};

                            post.moderation = mod;

                            projects.push(post);
                        }
                    });

                    projects.reverse();

                    if (projects.length === 0) {

                        communityProjectGrid.innerHTML = `
                            <div class="empty">
                                🚀 No community projects yet.
                            </div>
                        `;

                        return;
                    }

                    // ==================================================
                    // RENDER PROJECT CARDS
                    // ==================================================

                    projects.forEach(project => {

                        const card =
                            document.createElement("article");

                        card.className =
                            "communityProjectCard";

                        const projectData =
                            project.project || {};

                        card.innerHTML = `
                            <div class="projectCardContent">

                                <div class="projectCardIcon">
                                    🚀
                                </div>

                                <div class="projectCardInfo">

                                    <h3>
                                        ${escapeHTML(
                                            projectData.name ||
                                            project.title ||
                                            "Untitled Project"
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            projectData.description ||
                                            project.content ||
                                            "No description."
                                        )}
                                    </p>

                                </div>

                            </div>
                        `;

                        // ==================================================
                        // 💎 MODERATOR SEND PROJECT BUTTON
                        // ==================================================

                        if (canCurrentUserModerate()) {

                            const sendProjectBtn =
                                document.createElement("button");

                            sendProjectBtn.type =
                                "button";

                            sendProjectBtn.className =
                                "moderatorSendProjectBtn";

                            sendProjectBtn.innerHTML =
                                "💎 Send Project";

                            sendProjectBtn.onclick =
                                event => {

                                    event.stopPropagation();

                                    sendProjectToModerator(
                                        project.id,
                                        project.project
                                    );
                                };

                            card.appendChild(
                                sendProjectBtn
                            );
                        }

                        communityProjectGrid.appendChild(
                            card
                        );
                    });

                }
            );
        })
        .catch(error => {

            console.error(
                "Project moderation loading error:",
                error
            );

        });
}


// ========================================
// RENDER PROJECT CARD
// ========================================



// ========================================
// START PROJECT PAGE
// ========================================

setupCommunityProjectPage();

// ========================================
// 🚀 PROJECT POST FEATURE
// ADDITION ONLY
// ========================================

const projectComposer =
    document.getElementById("projectComposer");

const projectNameInput =
    document.getElementById("projectNameInput");

const projectDescriptionInput =
    document.getElementById("projectDescriptionInput");

const projectImageInput =
    document.getElementById("projectImageInput");

const chooseCodeOSProjectBtn =
    document.getElementById("chooseCodeOSProjectBtn");

const selectedCodeOSProject =
    document.getElementById("selectedCodeOSProject");

const projectPickerOverlay =
    document.getElementById("projectPickerOverlay");

const projectPickerSearch =
    document.getElementById("projectPickerSearch");

const projectPickerList =
    document.getElementById("projectPickerList");

const closeProjectPicker =
    document.getElementById("closeProjectPicker");

let selectedCodeOSWorkspace = null;


// ========================================
// TYPE CHANGE
// ========================================

// ========================================
// 🎛️ POST TYPE SWITCHER
// ========================================

let currentTutorialMode = "steps";

postType.addEventListener("change", () => {

    const type = postType.value;

    // Hide everything first
    projectComposer.classList.add("hidden");
    postTypeComposer.classList.add("hidden");

    postInput.classList.remove("hidden");

    // ------------------------------------
    // NORMAL POST
    // ------------------------------------

    if (type === "post") {

        postInput.placeholder =
            "Share something with the community...";

        return;
    }

    // ------------------------------------
    // PROJECT
    // ------------------------------------

    if (type === "project") {

        postInput.classList.add("hidden");

        projectComposer.classList.remove("hidden");

        return;
    }

    // ------------------------------------
    // OTHER TYPES
    // ------------------------------------

    const definition =
        postTypeDefinitions[type];

    if (!definition) return;

    postInput.classList.add("hidden");

    postTypeComposer.innerHTML = `

        <div class="typeComposerHeader">

            <div>
                <h3>
                    ${definition.title}
                </h3>

                <p>
                    ${definition.description}
                </p>
            </div>

        </div>

        <div class="typeComposerBody">

            ${definition.fields}

        </div>

    `;

    postTypeComposer.classList.remove("hidden");

    setupTypeComposer(type);

});


// ========================================
// GET CODEOS WORKSPACES
// ========================================

function getCommunityCodeOSProjects() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "codeosWorkspaces"
            ) || "[]"
        );

    }
    catch(error) {

        console.error(
            "Could not load CodeOS projects:",
            error
        );

        return [];

    }

}


// ========================================
// OPEN PICKER
// ========================================

chooseCodeOSProjectBtn.onclick = () => {

    renderCommunityCodeOSProjects();

    projectPickerOverlay.classList.remove(
        "hidden"
    );

    projectPickerSearch.value = "";

    setTimeout(() => {

        projectPickerSearch.focus();

    }, 50);

};


// ========================================
// CLOSE PICKER
// ========================================

closeProjectPicker.onclick = () => {

    projectPickerOverlay.classList.add(
        "hidden"
    );

};


projectPickerOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            projectPickerOverlay
        ) {

            projectPickerOverlay.classList.add(
                "hidden"
            );

        }

    }
);


// ========================================
// RENDER PROJECT PICKER
// ========================================

function renderCommunityCodeOSProjects(
    search = ""
) {

    projectPickerList.innerHTML = "";

    const projects =
        getCommunityCodeOSProjects();

    const filtered =
        projects.filter(project =>

            (project.name || "")
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )

        );

    if (filtered.length === 0) {

        projectPickerList.innerHTML = `

            <div class="projectPickerEmpty">

                <div style="font-size:40px;">
                    💻
                </div>

                <h3>
                    ${
                        projects.length === 0
                            ? "No CodeOS projects yet"
                            : "No projects found"
                    }
                </h3>

                <p>
                    ${
                        projects.length === 0
                            ? "Create a workspace in CodeOS first."
                            : "Try another search."
                    }
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(project => {

        const item =
            document.createElement("div");

        item.className =
            "projectPickerItem";

        const fileCount =
            project.files?.length || 0;

        item.innerHTML = `

            <div class="projectPickerItemIcon">
                💻
            </div>

            <div class="projectPickerItemInfo">

                <div class="projectPickerItemName">
                    ${escapeHTML(
                        project.name ||
                        "Untitled Project"
                    )}
                </div>

                <div class="projectPickerItemMeta">
                    📄 ${fileCount} files
                </div>

            </div>

            <div>
                ➜
            </div>

        `;

        item.onclick = () => {

            selectCodeOSProject(project);

        };

        projectPickerList.appendChild(item);

    });

}


// ========================================
// SEARCH
// ========================================

projectPickerSearch.addEventListener(
    "input",
    () => {

        renderCommunityCodeOSProjects(
            projectPickerSearch.value
        );

    }
);


// ========================================
// SELECT PROJECT
// ========================================

function selectCodeOSProject(project) {

    selectedCodeOSWorkspace =
        project;

    projectNameInput.value =
        project.name || "";

    selectedCodeOSProject.innerHTML = `

        <div class="selectedCodeOSProjectName">

            💻 ${
                escapeHTML(
                    project.name ||
                    "Untitled Project"
                )
            }

        </div>

        <div class="selectedCodeOSProjectMeta">

            📄 ${
                project.files?.length || 0
            } files
            •
            CodeOS Workspace

        </div>

    `;

    selectedCodeOSProject.classList.remove(
        "hidden"
    );

    projectPickerOverlay.classList.add(
        "hidden"
    );

}


// ========================================
// PUBLISH PROJECT
// ========================================
//
// Capture phase lets us handle PROJECT
// posts without touching your existing
// post publishing code.
//

postBtn.addEventListener(
    "click",
    async event => {

        if (postType.value !== "project") {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();


        if (!currentUser) {

            loginModal.classList.remove(
                "hidden"
            );

            return;

        }


        const name =
            projectNameInput.value.trim();

        const description =
            projectDescriptionInput.value.trim();

        const image =
            projectImageInput.value.trim();


        if (!name) {

            alert(
                "Give your project a name."
            );

            return;

        }


        if (!description) {

            alert(
                "Add a short project description."
            );

            return;

        }


        if (!selectedCodeOSWorkspace) {

            alert(
                "Choose a CodeOS project first."
            );

            return;

        }


        if (!image) {

            alert(
                "Add a project image URL."
            );

            return;

        }


        postBtn.disabled = true;

        const workspaceToPublish =
    selectedCodeOSWorkspace;

if (
    !workspaceToPublish ||
    !workspaceToPublish.id
) {

    alert(
        "This CodeOS project doesn't have a valid workspace ID."
    );

    return;

}


        try {

            const profileSnapshot =
                await get(
                    ref(
                        db,
                        "users/" +
                        currentUser.uid
                    )
                );


            const profile =
                profileSnapshot.exists()
                    ? profileSnapshot.val()
                    : {};


            /* =========================================
   ☁️ GUARANTEE PROJECT EXISTS IN FIREBASE
========================================= */

await set(
    ref(
        db,
        `codeosWorkspaces/${workspaceToPublish.id}`
    ),
    structuredClone(
        workspaceToPublish
    )
);

            const postsRef =
                ref(db, "posts");

            const newPost =
                push(postsRef);


            await set(
                newPost,
                {

                    authorId:
                        currentUser.uid,

                    authorName:
                        profile.username ||
                        currentUser.displayName ||
                        currentUser.email
                            .split("@")[0],

                    authorAvatar:
                        profile.avatar ||
                        currentUser.photoURL ||
                        "",

                    type:
                        "project",

                    content:
                        description,

                    project: {

                        name:
                            name,

                        description:
                            description,

                        image:
                            image,

                        codeOSProjectId:
    workspaceToPublish.id,

codeOSProjectName:
    workspaceToPublish.name ||
    name
                    },

                    likes: 0,

                    loves: 0,

                    comments: 0,

                    createdAt:
                        serverTimestamp()

                }
            );


            // Reset project composer

            projectNameInput.value = "";

            projectDescriptionInput.value = "";

            projectImageInput.value = "";

            selectedCodeOSWorkspace =
                null;

            selectedCodeOSProject.classList.add(
                "hidden"
            );

            postType.value = "post";

            projectComposer.classList.add(
                "hidden"
            );


        }
        catch(error) {

            console.error(
                "Project post error:",
                error
            );

            alert(
                "Could not publish your project."
            );

        }
        finally {

            postBtn.disabled = false;

        }

    },
    true
);


let currentUser = null;


/* =========================
   LOGIN MODAL
========================= */

loginBtn.onclick = () => {

    loginModal.classList.remove("hidden");

};


closeLogin.onclick = () => {

    loginModal.classList.add("hidden");

};


/* =========================
   GOOGLE LOGIN
========================= */

googleLogin.onclick = async () => {

    try {

        await signInWithPopup(
            auth,
            googleProvider
        );

        loginModal.classList.add("hidden");

    }
    catch(error){

        authStatus.innerText =
            error.message;

    }

};


/* =========================
   EMAIL LOGIN
========================= */

emailLogin.onclick = async () => {

    try {

        await signInWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        loginModal.classList.add("hidden");

    }
    catch(error){

        authStatus.innerText =
            error.message;

    }

};


/* =========================
   CREATE ACCOUNT
========================= */

emailSignup.onclick = async () => {

    try {

        const result =
            await createUserWithEmailAndPassword(
                auth,
                email.value,
                password.value
            );

        await createProfile(
            result.user
        );

        loginModal.classList.add("hidden");

    }
    catch(error){

        authStatus.innerText =
            error.message;

    }

};


/* =========================
   LOGOUT
========================= */

logoutBtn.onclick = async () => {

    await signOut(auth);

};


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
    auth,
    async user => {

        currentUser = user;

        loadUserGroups();
loadPublicGroups();
loadNotifications();


        if(user){

            loginBtn.classList.add("hidden");

            logoutBtn.classList.remove("hidden");

            userName.innerText =
    "👤 " +
    (user.displayName ||
    user.email.split("@")[0]);

            await createProfile(user);
await loadMyProfile();
await refreshCurrentUserProfile();
await updateModeratorAccess();
updateOfficialChallengeButton();

        }
        else{

            loginBtn.classList.remove("hidden");

            logoutBtn.classList.add("hidden");

            userName.innerText = "👤 Login";

        }

    }
);


/* =========================
   CREATE PROFILE
========================= */

async function createProfile(user){

    const userRef =
        ref(db, "users/" + user.uid);

    const snapshot =
        await get(userRef);

    if(!snapshot.exists()){

        await set(userRef, {

            username:
                user.displayName ||
                user.email.split("@")[0],

            email:
                user.email,

            avatar:
                user.photoURL || "",

            role:
                "member",

            createdAt:
                serverTimestamp()

        });

    }

}


/* =========================
   CREATE POST
========================= */

postBtn.onclick = async () => {

    if (!currentUser) {
        loginModal.classList.remove("hidden");
        return;
    }

    const type = postType.value;
    const content = postInput.value.trim();

    // --------------------------------
    // GET USER PROFILE
    // --------------------------------

    const profileRef = ref(
        db,
        "users/" + currentUser.uid
    );

    const profileSnapshot =
        await get(profileRef);

    const profile =
        profileSnapshot.exists()
            ? profileSnapshot.val()
            : {};

    // --------------------------------
    // SPECIAL POST DATA
    // --------------------------------

    let data = {};

    // =================================
    // 💡 IDEA
    // =================================

    if (type === "idea") {

        const title =
            document.getElementById("ideaTitleInput")?.value.trim();

        const description =
            document.getElementById("ideaDescriptionInput")?.value.trim();

        if (!title || !description) {
            alert("Please enter an idea title and description.");
            return;
        }

        data = {
            title,
            description
        };
    }

    // =================================
    // ❓ QUESTION
    // =================================

    else if (type === "question") {

        const question =
            document.getElementById("questionInput")?.value.trim();

        if (!question) {
            alert("Please enter your question.");
            return;
        }

        data = {
            question
        };
    }

    // =================================
    // 📊 POLL
    // =================================

    else if (type === "poll") {

        const question =
            document.getElementById("pollQuestionInput")?.value.trim();

        const optionInputs =
            document.querySelectorAll(".pollOptionInput");

        const options =
            Array.from(optionInputs)
                .map(input => ({
                    text: input.value.trim()
                }))
                .filter(option => option.text);

        if (!question) {
            alert("Please enter a poll question.");
            return;
        }

        if (options.length < 2) {
            alert("A poll needs at least 2 options.");
            return;
        }

        data = {
            question,
            options
        };
    }

    // =================================
    // 🏆 ACHIEVEMENT
    // =================================

    else if (type === "achievement") {

        const title =
            document.getElementById("achievementTitleInput")?.value.trim();

        const description =
            document.getElementById("achievementDescriptionInput")?.value.trim();

        if (!title || !description) {
            alert("Please enter the achievement title and description.");
            return;
        }

        data = {
            title,
            description
        };
    }

    // =================================
    // 📚 TUTORIAL
    // =================================

    else if (type === "tutorial") {

        const title =
            document.getElementById("tutorialTitleInput")?.value.trim();

        const mode =
            document.getElementById("tutorialMode")?.value || "steps";

        if (!title) {
            alert("Please enter a tutorial title.");
            return;
        }

        // --------------------------------
        // NORMAL TUTORIAL
        // --------------------------------

        if (mode === "normal") {

            const tutorialContent =
                document
                    .getElementById("tutorialContentInput")
                    ?.value.trim();

            const image =
                document
                    .getElementById("tutorialImageInput")
                    ?.value.trim();

            if (!tutorialContent) {
                alert("Please enter your tutorial content.");
                return;
            }

            data = {
                title,
                mode: "normal",
                content: tutorialContent
            };

            // Only save image if one was provided
            if (image) {
                data.image = image;
            }

        }

        // --------------------------------
        // STEP-BY-STEP TUTORIAL
        // --------------------------------

        else {

            const stepCards =
                document.querySelectorAll(
                    ".tutorialComposerStep"
                );

            const steps = [];

            stepCards.forEach(step => {

                const description =
                    step
                        .querySelector(
                            ".tutorialStepDescription"
                        )
                        ?.value.trim();

                const image =
                    step
                        .querySelector(
                            ".tutorialStepImageInput"
                        )
                        ?.value.trim();

                if (!description) return;

                const stepData = {
                    description
                };

                // ⭐ IMPORTANT:
                // Only add image when it actually exists
                if (image) {
                    stepData.image = image;
                }

                steps.push(stepData);

            });

            if (!steps.length) {
                alert(
                    "Please add at least one tutorial step."
                );
                return;
            }

            data = {
                title,
                mode: "steps",
                steps
            };
        }
    }

    // =================================
    // 🎨 SHOWCASE
    // =================================

    else if (type === "showcase") {

        const title =
            document
                .getElementById("showcaseTitleInput")
                ?.value.trim();

        const description =
            document
                .getElementById("showcaseDescriptionInput")
                ?.value.trim();

        const image =
            document
                .getElementById("showcaseImageInput")
                ?.value.trim();

        const link =
            document
                .getElementById("showcaseLinkInput")
                ?.value.trim();

        if (!title || !description) {
            alert(
                "Please enter a showcase title and description."
            );
            return;
        }

        data = {
            title,
            description
        };

        if (image) {
            data.image = image;
        }

        if (link) {
            data.link = link;
        }
    }

    // =================================
    // ⚔️ CHALLENGE
    // =================================

    else if (type === "challenge") {

        const title =
            document
                .getElementById("challengeTitleInput")
                ?.value.trim();

        const description =
            document
                .getElementById("challengeDescriptionInput")
                ?.value.trim();

        if (!title || !description) {
            alert(
                "Please enter the challenge title and description."
            );
            return;
        }

        data = {
            title,
            description
        };
    }

    // =================================
    // 💬 DISCUSSION
    // =================================

    else if (type === "discussion") {

        if (!content) {
            alert(
                "Please enter your discussion."
            );
            return;
        }

        data = {};
    }

    // =================================
    // 📢 NORMAL POST
    // =================================

    else if (type === "post") {

        if (!content) {
            alert(
                "Please write something first."
            );
            return;
        }

        data = {};
    }

    // =================================
    // 🚀 PROJECT
    // =================================

    else if (type === "project") {

        const name =
            document
                .getElementById("projectNameInput")
                ?.value.trim();

        const description =
            document
                .getElementById("projectDescriptionInput")
                ?.value.trim();

        const image =
            document
                .getElementById("projectImageInput")
                ?.value.trim();

        const link =
            document
                .getElementById("projectLinkInput")
                ?.value.trim();

        if (!name || !description) {
            alert(
                "Please enter a project name and description."
            );
            return;
        }

        data = {
            name,
            description
        };

        if (image) {
            data.image = image;
        }

        if (link) {
            data.link = link;
        }
    }

    // =================================
    // CREATE FIREBASE POST
    // =================================

    try {

        postBtn.disabled = true;
        postBtn.innerText = "Publishing...";

        const postsRef =
            ref(db, "posts");

        const newPost =
            push(postsRef);

        await set(newPost, {

            authorId:
                currentUser.uid,

            authorName:
                profile.username ||
                currentUser.displayName ||
                currentUser.email.split("@")[0],

            authorAvatar:
                profile.avatar ||
                currentUser.photoURL ||
                "",

            type,

            content,

            data,

            likes: 0,
            loves: 0,
            comments: 0,

            createdAt:
                serverTimestamp()
        });

        // --------------------------------
        // RESET COMPOSER
        // --------------------------------

        postInput.value = "";

        postType.value = "post";

        if (
            typeof renderPostTypeComposer ===
            "function"
        ) {
            renderPostTypeComposer();
        }

        alert("Post published! 🚀");

    }

    catch (error) {

        console.error(
            "Create post error:",
            error
        );

        alert(
            "Could not publish your post: " +
            error.message
        );

    }

    finally {

        postBtn.disabled = false;
        postBtn.innerText = "Publish 🚀";

    }

};


/* =========================
   LOAD POSTS
========================= */

const postsRef =
    ref(db, "posts");


onValue(postsRef, snapshot => {

    feed.innerHTML = "";

    if(!snapshot.exists()){

        feed.innerHTML = `
            <div class="empty">
                🚀 No posts yet.
                Be the first!
            </div>
        `;

        return;

    }


    const posts = [];


    snapshot.forEach(child => {

        posts.push({

            id: child.key,

            ...child.val()

        });

    });


    posts.reverse();


    posts.forEach(post => {

        renderPost(post);

    });

});


/* =========================
   RENDER POST
========================= */

function renderPost(post) {

    const card =
        document.createElement("article");

    card.className = "post";

    card.dataset.postId = post.id;

    if (post.type === "project") {
        card.classList.add("projectPost");
    }

    if (post.type) {
        card.classList.add(
            `postType-${post.type}`
        );
    }

    const date =
        post.createdAt
            ? new Date(
                post.createdAt
            ).toLocaleString()
            : "Just now";

    card.innerHTML = `

        <!-- AUTHOR -->

        <div class="postHeader">

            <div class="avatar">

                ${
                    post.authorAvatar

                    ? `
                        <img
                            src="${escapeHTML(
                                post.authorAvatar
                            )}"
                            alt=""
                            class="postAvatar"
                        >
                    `

                    : "👤"
                }

            </div>

            <div>

                <div
                    class="username postUsername"
                    data-user-id="${post.authorId}"
                >
                    ${escapeHTML(
                        post.authorName ||
                        "CodeOS Member"
                    )}
                </div>

                <div class="role">
                    ${date}
                </div>

            </div>

        </div>

        <!-- TYPE-SPECIFIC CONTENT -->

        <div class="specialPostContent">

            ${renderPostTypeContent(post)}

        </div>

        <!-- ACTIONS -->

        <div class="postActions">

            <button class="likeBtn">
                ❤️ ${
                    Object.keys(
                        post.likedBy || {}
                    ).length
                }
            </button>

            <button class="loveBtn">
                💗 ${
                    Object.keys(
                        post.lovedBy || {}
                    ).length
                }
            </button>

            <button class="commentsBtn">
                💬 ${post.comments || 0}
            </button>

            ${
                currentUser &&
                currentUser.uid === post.authorId

                ? `
                    <button class="deletePostBtn">
                        🗑️ Delete
                    </button>
                `

                : ""
            }

        </div>

        <!-- COMMENTS -->

        <div class="commentsSection hidden">

            <div class="commentsList">

                <div class="noComments">
                    💬 No replies yet.
                </div>

            </div>

            <div class="replyBox">

                <input
                    class="replyInput"
                    type="text"
                    placeholder="Write a reply..."
                    maxlength="500"
                >

                <button class="replyBtn">
                    Reply 🚀
                </button>

            </div>

        </div>

    `;

    // Profile
    const usernameElement =
        card.querySelector(
            ".postUsername"
        );

    usernameElement.onclick = () => {
        openProfile(post.authorId);
    };

    // ------------------------------------
    // TYPE INTERACTIONS
    // ------------------------------------

    setupPostTypeInteractions(
        card,
        post
    );

    // ------------------------------------
    // ❤️ LIKE
    // ------------------------------------

    card.querySelector(
        ".likeBtn"
    ).onclick = async () => {

        if (!currentUser) {

            loginModal.classList.remove(
                "hidden"
            );

            return;
        }

        const likeRef =
            ref(
                db,
                `posts/${post.id}/likedBy/${currentUser.uid}`
            );

        const snapshot =
            await get(likeRef);

        if (snapshot.exists()) {

            await remove(likeRef);

        } else {

            await set(
                likeRef,
                true
            );

        }

    };

    // ------------------------------------
    // 💗 LOVE
    // ------------------------------------

    card.querySelector(
        ".loveBtn"
    ).onclick = async () => {

        if (!currentUser) {

            loginModal.classList.remove(
                "hidden"
            );

            return;
        }

        const loveRef =
            ref(
                db,
                `posts/${post.id}/lovedBy/${currentUser.uid}`
            );

        const snapshot =
            await get(loveRef);

        if (snapshot.exists()) {

            await remove(loveRef);

        } else {

            await set(
                loveRef,
                true
            );

        }

    };

    // ------------------------------------
    // COMMENTS
    // ------------------------------------

    const commentsSection =
        card.querySelector(
            ".commentsSection"
        );

    const commentsList =
        card.querySelector(
            ".commentsList"
        );

    const commentsBtn =
        card.querySelector(
            ".commentsBtn"
        );

    const replyInput =
        card.querySelector(
            ".replyInput"
        );

    const replyBtn =
        card.querySelector(
            ".replyBtn"
        );

    commentsBtn.onclick = () => {

        const hidden =
            commentsSection.classList.contains(
                "hidden"
            );

        if (hidden) {

            commentsSection.classList.remove(
                "hidden"
            );

            commentsBtn.classList.add(
                "active"
            );

        } else {

            commentsSection.classList.add(
                "hidden"
            );

            commentsBtn.classList.remove(
                "active"
            );

        }

    };

    const commentsRef =
        ref(
            db,
            "comments/" + post.id
        );

    onValue(
        commentsRef,
        snapshot => {

            commentsList.innerHTML = "";

            if (!snapshot.exists()) {

                commentsList.innerHTML = `
                    <div class="noComments">
                        💬 No replies yet. Be the first!
                    </div>
                `;

                return;
            }

            const comments = [];

            snapshot.forEach(child => {

                comments.push({
                    id: child.key,
                    ...child.val()
                });

            });

            comments.sort(
                (a, b) =>
                    (a.createdAt || 0) -
                    (b.createdAt || 0)
            );

            comments.forEach(comment => {

                renderComment(
                    comment,
                    commentsList,
                    post.id
                );

            });

        }
    );

    replyBtn.onclick = async () => {

        if (!currentUser) {

            loginModal.classList.remove(
                "hidden"
            );

            return;
        }

        const content =
            replyInput.value.trim();

        if (!content) return;

        replyBtn.disabled = true;

        try {

            const commentsRef =
                ref(
                    db,
                    "comments/" + post.id
                );

            const newComment =
                push(commentsRef);

            const profileSnapshot =
                await get(
                    ref(
                        db,
                        "users/" +
                        currentUser.uid
                    )
                );

            const profile =
                profileSnapshot.exists()
                    ? profileSnapshot.val()
                    : {};

            await set(
                newComment,
                {
                    postId: post.id,

                    authorId:
                        currentUser.uid,

                    authorName:
                        profile.username ||
                        currentUser.displayName ||
                        currentUser.email.split("@")[0],

                    authorAvatar:
                        profile.avatar ||
                        currentUser.photoURL ||
                        "",

                    content,

                    likes: 0,
                    loves: 0,

                    createdAt:
                        serverTimestamp()
                }
            );

            await update(
                ref(
                    db,
                    "posts/" + post.id
                ),
                {
                    comments:
                        (post.comments || 0) + 1
                }
            );

            replyInput.value = "";

        }
        catch(error) {

            console.error(
                "Reply error:",
                error
            );

            alert(
                "Could not post your reply."
            );

        }
        finally {

            replyBtn.disabled = false;

        }

    };

    // ------------------------------------
    // DELETE
    // ------------------------------------

    const deleteBtn =
        card.querySelector(
            ".deletePostBtn"
        );

    if (deleteBtn) {

        deleteBtn.onclick = async () => {

            const confirmed =
                confirm(
                    "Delete this post?\n\nThis cannot be undone."
                );

            if (!confirmed) return;

            try {

                await remove(
                    ref(
                        db,
                        "posts/" +
                        post.id
                    )
                );

            }
            catch(error) {

                console.error(error);

                alert(
                    "Could not delete the post."
                );

            }

        };

    }

    feed.appendChild(card);

}

// ========================================
// 🎨 RENDER SPECIAL POST UI
// ========================================

function renderPostTypeContent(post) {

    const data =
        post.data || {};

    // ====================================
    // 📢 NORMAL POST
    // ====================================

    if (post.type === "post") {

        return `

            <div class="normalPostContent">

                <div class="postType">
                    📢 Post
                </div>

                <div class="postContent">
                    ${escapeHTML(
                        post.content || ""
                    )}
                </div>

            </div>

        `;
    }

    // ====================================
    // 🚀 PROJECT
    // ====================================

    if (post.type === "project") {

        const project =
            post.project || {};

        return `

            <div class="beautifulProjectPost">

                <div class="beautifulProjectBadge">
                    🚀 PROJECT
                </div>

                ${
                    project.image

                    ? `
                        <img
                            class="beautifulProjectImage"
                            src="${escapeHTML(
                                project.image
                            )}"
                            alt="${escapeHTML(
                                project.name ||
                                "Project"
                            )}"
                        >
                    `

                    : `
                        <div class="beautifulProjectPlaceholder">
                            🚀
                        </div>
                    `
                }

                <div class="beautifulProjectBody">

                    <h2>
                        ${escapeHTML(
                            project.name ||
                            "Untitled Project"
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            project.description ||
                            post.content ||
                            ""
                        )}
                    </p>

                    ${
                        project.link

                        ? `
                            <a
                                class="beautifulProjectLink"
                                href="${escapeHTML(
                                    project.link
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open Project ↗
                            </a>
                        `

                        : ""
                    }

                </div>

            </div>

        `;
    }

    // ====================================
    // 💡 IDEA
    // ====================================

    if (post.type === "idea") {

        return `

            <div
                class="ideaPost"
                data-idea-id="${post.id}"
            >

                <div class="ideaBulbButton">

                    <div class="ideaBulbGlow"></div>

                    <div class="ideaBulb">
                        💡
                    </div>

                    <div class="ideaClickText">
                        Click to reveal
                    </div>

                </div>

                <div class="ideaReveal hidden">

                    <div class="ideaLabel">
                        💡 IDEA
                    </div>

                    <h2>
                        ${escapeHTML(
                            data.title ||
                            "Untitled Idea"
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            data.description ||
                            ""
                        )}
                    </p>

                </div>

            </div>

        `;
    }

    // ====================================
    // ❓ QUESTION
    // ====================================

    if (post.type === "question") {

        return `

            <div class="questionPost">

                <div class="questionVisual">
                    <div class="questionGlow"></div>
                    <div class="questionMark">
                        ?
                    </div>
                </div>

                <div class="questionBody">

                    <div class="questionLabel">
                        ❓ QUESTION
                    </div>

                    <h2>
                        ${escapeHTML(
                            data.question ||
                            post.content ||
                            ""
                        )}
                    </h2>

                </div>

            </div>

        `;
    }

    // ====================================
    // 📊 POLL
    // ====================================

    if (post.type === "poll") {

        const options =
            data.options || [];

        return `

            <div class="pollPost">

                <div class="pollHeader">

                    <div class="pollIcon">
                        📊
                    </div>

                    <div>

                        <div class="pollLabel">
                            COMMUNITY POLL
                        </div>

                        <h2>
                            ${escapeHTML(
                                data.question ||
                                "Poll"
                            )}
                        </h2>

                    </div>

                </div>

                <div class="pollOptions">

                    ${
                        options.map(
                            (option, index) => `
                                <button
                                    class="pollOption"
                                    data-option-index="${index}"
                                >

                                    <span>
                                        ${escapeHTML(
                                            option.text
                                        )}
                                    </span>

                                    <span class="pollPercent">
                                        0%
                                    </span>

                                </button>
                            `
                        ).join("")
                    }

                </div>

                <div class="pollFooter">
                    Choose an option
                </div>

            </div>

        `;
    }

    // ====================================
    // 🏆 ACHIEVEMENT
    // ====================================

    if (post.type === "achievement") {

        return `

            <div class="achievementPost">

                <div class="achievementGlow"></div>

                <div class="achievementTrophy">
                    🏆
                </div>

                <div class="achievementLabel">
                    ACHIEVEMENT UNLOCKED
                </div>

                <h2>
                    ${escapeHTML(
                        data.title ||
                        "Achievement"
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        data.description ||
                        ""
                    )}
                </p>

            </div>

        `;
    }

    // ====================================
    // 📚 TUTORIAL
    // ====================================

    if (post.type === "tutorial") {

        if (
            data.mode === "normal"
        ) {

            return `

                <div class="tutorialPost tutorialNormal">

                    <div class="tutorialHeader">

                        <div class="tutorialIcon">
                            📚
                        </div>

                        <div>

                            <div class="tutorialLabel">
                                TUTORIAL
                            </div>

                            <h2>
                                ${escapeHTML(
                                    data.title ||
                                    "Tutorial"
                                )}
                            </h2>

                        </div>

                    </div>

                    <div class="tutorialNormalContent">
                        ${escapeHTML(
                            data.content ||
                            ""
                        )}
                    </div>

                    ${
                        data.image

                        ? `
                            <img
                                class="tutorialImage"
                                src="${escapeHTML(
                                    data.image
                                )}"
                                alt=""
                            >
                        `

                        : ""
                    }

                </div>

            `;

        }

        return `

            <div
                class="tutorialPost tutorialSteps"
                data-tutorial-id="${post.id}"
            >

                <div class="tutorialHeader">

                    <div class="tutorialIcon">
                        📚
                    </div>

                    <div>

                        <div class="tutorialLabel">
                            STEP-BY-STEP TUTORIAL
                        </div>

                        <h2>
                            ${escapeHTML(
                                data.title ||
                                "Tutorial"
                            )}
                        </h2>

                    </div>

                </div>

                <div class="tutorialStepViewer">

                    <div class="tutorialStepNumber">
                        STEP 1
                    </div>

                    <p class="tutorialStepText">
                        ${escapeHTML(
                            data.steps?.[0]?.description ||
                            ""
                        )}
                    </p>

                    ${
                        data.steps?.[0]?.image

                        ? `
                            <img
                                class="tutorialStepImage"
                                src="${escapeHTML(
                                    data.steps[0].image
                                )}"
                                alt=""
                            >
                        `

                        : ""
                    }

                </div>

                <div class="tutorialNavigation">

                    <button
                        class="tutorialPrevBtn"
                        disabled
                    >
                        ← Previous
                    </button>

                    <span class="tutorialProgress">
                        1 / ${
                            data.steps?.length || 1
                        }
                    </span>

                    <button class="tutorialNextBtn">
                        Next Step →
                    </button>

                </div>

            </div>

        `;

    }

    // ====================================
    // 🎨 SHOWCASE
    // ====================================

    if (post.type === "showcase") {

        return `

            <div class="showcasePost">

                <div class="showcaseVisual">
                    <div class="showcaseGlow"></div>
                    <div class="showcaseArt">
                        🎨
                    </div>
                </div>

                <div class="showcaseBody">

                    <div class="showcaseLabel">
                        🎨 SHOWCASE
                    </div>

                    <h2>
                        ${escapeHTML(
                            data.title ||
                            "Showcase"
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            data.description ||
                            ""
                        )}
                    </p>

                    ${
                        data.image

                        ? `
                            <img
                                class="showcaseImage"
                                src="${escapeHTML(
                                    data.image
                                )}"
                                alt=""
                            >
                        `

                        : ""
                    }

                    ${
                        data.link

                        ? `
                            <a
                                class="showcaseLink"
                                href="${escapeHTML(
                                    data.link
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Creation ↗
                            </a>
                        `

                        : ""
                    }

                </div>

            </div>

        `;

    }

    // ====================================
    // FALLBACK
    // ====================================

    return `

        <div class="postType">
            ${getPostIcon(post.type)}
            ${escapeHTML(post.type || "Post")}
        </div>

        <div class="postContent">
            ${escapeHTML(
                post.content || ""
            )}
        </div>

    `;

}

// ========================================
// ✨ SPECIAL POST INTERACTIONS
// ========================================

function setupPostTypeInteractions(
    card,
    post
) {

    // ------------------------------------
    // 💡 IDEA REVEAL
    // ------------------------------------

    if (post.type === "idea") {

        const bulb =
            card.querySelector(
                ".ideaBulbButton"
            );

        const reveal =
            card.querySelector(
                ".ideaReveal"
            );

        if (bulb && reveal) {

            bulb.onclick = () => {

                if (
                    reveal.classList.contains(
                        "hidden"
                    )
                ) {

                    bulb.classList.add(
                        "ideaActivated"
                    );

                    setTimeout(() => {

                        reveal.classList.remove(
                            "hidden"
                        );

                        reveal.classList.add(
                            "ideaRevealIn"
                        );

                    }, 450);

                }

            };

        }

    }

    // ------------------------------------
    // 📊 POLL
    // ------------------------------------

    if (post.type === "poll") {

        const options =
            card.querySelectorAll(
                ".pollOption"
            );

        options.forEach(option => {

            option.onclick = async () => {

                if (!currentUser) {

                    loginModal.classList.remove(
                        "hidden"
                    );

                    return;
                }

                const index =
                    Number(
                        option.dataset.optionIndex
                    );

                const voteRef =
                    ref(
                        db,
                        `posts/${post.id}/votes/${currentUser.uid}`
                    );

                await set(
                    voteRef,
                    index
                );

                options.forEach(
                    button =>
                        button.classList.remove(
                            "selected"
                        )
                );

                option.classList.add(
                    "selected"
                );

            };

        });

    }

    // ------------------------------------
    // 📚 TUTORIAL
    // ------------------------------------

    if (post.type === "tutorial") {

        const steps =
            post.data?.steps || [];

        if (!steps.length) return;

        let currentStep = 0;

        const viewer =
            card.querySelector(
                ".tutorialStepViewer"
            );

        const next =
            card.querySelector(
                ".tutorialNextBtn"
            );

        const prev =
            card.querySelector(
                ".tutorialPrevBtn"
            );

        const progress =
            card.querySelector(
                ".tutorialProgress"
            );

        function renderStep() {

            const step =
                steps[currentStep];

            viewer.innerHTML = `

                <div class="tutorialStepNumber">
                    STEP ${currentStep + 1}
                </div>

                <p class="tutorialStepText">
                    ${escapeHTML(
                        step.description ||
                        ""
                    )}
                </p>

                ${
                    step.image

                    ? `
                        <img
                            class="tutorialStepImage"
                            src="${escapeHTML(
                                step.image
                            )}"
                            alt=""
                        >
                    `

                    : ""
                }

            `;

            progress.innerText =
                `${currentStep + 1} / ${steps.length}`;

            prev.disabled =
                currentStep === 0;

            next.innerText =
                currentStep ===
                steps.length - 1

                    ? "✓ Finish"

                    : "Next Step →";

        }

        next.onclick = () => {

            if (
                currentStep <
                steps.length - 1
            ) {

                currentStep++;

                renderStep();

            } else {

                next.innerText =
                    "✓ Completed!";

                next.disabled = true;

            }

        };

        prev.onclick = () => {

            if (currentStep > 0) {

                currentStep--;

                renderStep();

            }

        };

        renderStep();

    }

}


/* =========================
   POST ICON
========================= */

function getPostIcon(type){

    const icons = {

        post: "📢",

        project: "🚀",

        idea: "💡",

        question: "❓",

        poll: "📊",

        achievement: "🏆",

        discussion: "💬",

        tutorial: "📚",

        showcase: "🎨",

        challenge: "⚔️"

    };


    return icons[type] || "📢";

}


/* =========================
   SECURITY
========================= */

function escapeHTML(text){

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

// =========================================
// 🧭 COMMUNITY NAVIGATION
// =========================================

const navItems =
    document.querySelectorAll(".navItem");

const pages =
    document.querySelectorAll(".page");

const pageTitle =
    document.getElementById("pageTitle");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const page =
            item.dataset.page;

        navItems.forEach(nav =>
            nav.classList.remove("active")
        );

        item.classList.add("active");

        pages.forEach(section =>
            section.classList.remove("activePage")
        );

        const target =
            document.getElementById(
                page + "Page"
            );

        if(target){

            target.classList.add("activePage");

        }

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

        pageTitle.innerText =
            titles[page] || "Community";

    });

});

async function loadMyProfile() {

    if (!currentUser) return;

    const userRef =
        ref(db, "users/" + currentUser.uid);

    const snapshot =
        await get(userRef);

    if (!snapshot.exists()) return;

    const profile = snapshot.val();
currentUserProfile = profile;

userIsModerator =
    profile.username === "ron_weasley" ||
    profile.isModerator === true;
    

    const moderatorsNavItem =
    document.getElementById("moderatorsNavItem");

if (moderatorsNavItem) {
    if (
        profile.username === "ron_weasley" ||
        profile.isModerator === true
    ) {
        moderatorsNavItem.classList.remove("hidden");
    } else {
        moderatorsNavItem.classList.add("hidden");
    }
}

updateModeratorPage(profile);

    profileName.innerText =
        profile.username || "CodeOS Member";

    profileBio.innerText =
        profile.bio ||
        "Welcome to my CodeOS profile! 🚀";

    profileRole.innerText =
        profile.role || "Member";

    if (profileStatus) {
    profileStatus.textContent =
        getUserStatus(profile);
}

    if (profile.avatar) {

        profileAvatar.innerHTML = `
            <img
                src="${escapeHTML(profile.avatar)}"
                alt="Profile"
            >
        `;

    } else {

        profileAvatar.innerHTML = "👤";
    }

    if (profile.createdAt) {

        const date =
            new Date(profile.createdAt)
                .toLocaleDateString();

        profileJoined.innerText =
            "📅 Joined " + date;
    }

    profileUsername.value =
        profile.username || "";

    profileBioInput.value =
        profile.bio || "";

    profileAvatarInput.value =
        profile.avatar || "";

    const badges =
        profile.badges || {};

    const badgeList =
        Object.values(badges);

    profileBadgeCount.innerText =
        badgeList.length;

    if (badgeList.length) {

        profileBadges.innerHTML =
            badgeList.map(badge => `
                <div class="badge">
                    <div class="badgeIcon">
                        ${escapeHTML(badge.icon || "🏅")}
                    </div>

                    <div class="badgeName">
                        ${escapeHTML(badge.name || "Badge")}
                    </div>
                </div>
            `).join("");

    } else {

        profileBadges.innerHTML = `
            <div class="noBadges">
                No badges yet. Keep building! 🚀
            </div>
        `;
    }

    await loadProfilePosts();

}

async function loadProfilePosts() {

    if (!currentUser) return;

    const postsSnapshot =
        await get(ref(db, "posts"));

    let count = 0;
    let likes = 0;
    let loves = 0;

    profilePosts.innerHTML = "";

    if (!postsSnapshot.exists()) {

        profilePosts.innerHTML = `
            <div class="noBadges">
                No posts yet.
            </div>
        `;

        return;
    }

    postsSnapshot.forEach(child => {

        const post = child.val();

        if (
            post.authorId === currentUser.uid
        ) {

            count++;

            likes += post.likes || 0;
            loves += post.loves || 0;

            const postElement =
                document.createElement("div");

            postElement.className = "post";

            postElement.innerHTML = `
                <div class="postType">
                    ${getPostIcon(post.type)}
                    ${escapeHTML(post.type)}
                </div>

                <div class="postContent">
                    ${escapeHTML(post.content)}
                </div>
            `;

            profilePosts.prepend(postElement);
        }

    });

    profilePostCount.innerText = count;
    profileLikes.innerText = likes;
    profileLoves.innerText = loves;

    if (count === 0) {

        profilePosts.innerHTML = `
            <div class="noBadges">
                No posts yet.
            </div>
        `;
    }
}

editProfileBtn.onclick = async () => {

    if (!currentUser) {

        loginModal.classList.remove("hidden");

        return;
    }

    await loadMyProfile();

    profileModal.classList.remove("hidden");
};


closeProfileModal.onclick = () => {

    profileModal.classList.add("hidden");
};


saveProfileBtn.onclick = async () => {

    if (!currentUser) return;

    const username =
        profileUsername.value.trim();

    const bio =
        profileBioInput.value.trim();

    const avatar =
        profileAvatarInput.value.trim();

    if (!username) {

        profileSaveStatus.innerText =
            "Please enter a username.";

        return;
    }

    saveProfileBtn.disabled = true;

    try {

        await update(
            ref(
                db,
                "users/" + currentUser.uid
            ),
            {
                username: username,
                bio: bio,
                avatar: avatar
            }
        );

        await loadMyProfile();

        profileModal.classList.add("hidden");

        profileSaveStatus.innerText = "";

    } catch (error) {

        profileSaveStatus.innerText =
            error.message;

    } finally {

        saveProfileBtn.disabled = false;
    }
};

async function openProfile(userId) {

    console.log("Opening public profile:", userId);

    const userRef = ref(db, "users/" + userId);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        console.error("Profile not found:", userId);
        return;
    }

    const profile = snapshot.val();

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("activePage");
    });

    // Show public profile
    const publicProfile =
        document.getElementById("publicProfilePage");

    publicProfile.classList.add("activePage");

    // Basic profile info
    document.getElementById("publicProfileName").textContent =
        profile.username || "Unknown User";

    document.getElementById("publicProfileRole").textContent =
        profile.role || "Member";

    document.getElementById("publicProfileBio").textContent =
        profile.bio || "No bio yet.";

    // Avatar
    const avatar =
        document.getElementById("publicProfileAvatar");

    if (profile.avatar) {
        avatar.src = profile.avatar;
    } else {
        avatar.removeAttribute("src");
    }

    // Count their posts
    const postsSnapshot = await get(ref(db, "posts"));

    let postCount = 0;
    let projectCount = 0;
    let likeCount = 0;

    if (postsSnapshot.exists()) {

        postsSnapshot.forEach(child => {

            const post = child.val();

            if (post.authorId === userId) {

                postCount++;

                likeCount += post.likes || 0;

                if (post.type === "project") {
                    projectCount++;
                }
            }
        });
    }

    document.getElementById("publicPostCount").textContent =
        postCount;

    document.getElementById("publicProjectCount").textContent =
        projectCount;

    document.getElementById("publicLikeCount").textContent =
        likeCount;

    // Badges
    const badgesContainer =
        document.getElementById("publicBadges");

    badgesContainer.innerHTML = "";

    const badges = profile.badges || {};

    const badgeList = Array.isArray(badges)
        ? badges
        : Object.values(badges);

    if (badgeList.length) {

        badgeList.forEach(badge => {

            const badgeElement =
                document.createElement("span");

            badgeElement.className = "profileBadge";

            badgeElement.textContent =
                typeof badge === "string"
                    ? badge
                    : (badge.name || "🏅 Badge");

            badgesContainer.appendChild(badgeElement);

        });

    } else {

        badgesContainer.innerHTML =
            "<span>No badges yet.</span>";

    }

    // Page title
    document.getElementById("pageTitle").textContent =
        profile.username || "Profile";
}

document.getElementById(
    "backFromProfile"
).onclick = () => {

    document.querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("activePage");
        });

    document.getElementById(
        "homePage"
    ).classList.add("activePage");

    document.getElementById(
        "pageTitle"
    ).textContent = "Home";
};

// =========================================
// 💬 RENDER COMMENT
// =========================================

function renderComment(
    comment,
    container,
    postId
){

    const commentElement =
        document.createElement("div");

    commentElement.className =
        "comment";

    const date =
        comment.createdAt
            ? new Date(
                comment.createdAt
              ).toLocaleString()
            : "Just now";

    commentElement.innerHTML = `

        <div class="commentHeader">

            <div class="commentAvatar">

                ${
                    comment.authorAvatar

                    ? `
                        <img
                            src="${escapeHTML(
                                comment.authorAvatar
                            )}"
                            alt=""
                        >
                    `

                    : "👤"
                }

            </div>

            <div class="commentAuthor">

                <strong>
                    ${escapeHTML(
                        comment.authorName
                    )}
                </strong>

                <span>
                    ${date}
                </span>

            </div>

        </div>

        <div class="commentContent">

            ${escapeHTML(
                comment.content
            )}

        </div>

        <div class="commentActions">

            <button class="commentLikeBtn">
                ❤️ ${Object.keys(
                    comment.likedBy || {}
                ).length}
            </button>

            <button class="commentLoveBtn">
                💗 ${Object.keys(
                    comment.lovedBy || {}
                ).length}
            </button>

            ${
                currentUser &&
                currentUser.uid === comment.authorId

                ? `
                    <button class="deleteCommentBtn">
                        🗑️
                    </button>
                `

                : ""
            }

        </div>

    `;


    // ❤️ LIKE COMMENT

    commentElement
        .querySelector(".commentLikeBtn")
        .onclick = async () => {

            if (!currentUser) {

                loginModal.classList.remove(
                    "hidden"
                );

                return;

            }

            const likeRef =
                ref(
                    db,
                    `comments/${postId}/${comment.id}/likedBy/${currentUser.uid}`
                );

            const snapshot =
                await get(likeRef);

            if (snapshot.exists()) {

                await remove(likeRef);

            }
            else {

                await set(
                    likeRef,
                    true
                );

            }

        };


    // 💗 LOVE COMMENT

    commentElement
        .querySelector(".commentLoveBtn")
        .onclick = async () => {

            if (!currentUser) {

                loginModal.classList.remove(
                    "hidden"
                );

                return;

            }

            const loveRef =
                ref(
                    db,
                    `comments/${postId}/${comment.id}/lovedBy/${currentUser.uid}`
                );

            const snapshot =
                await get(loveRef);

            if (snapshot.exists()) {

                await remove(loveRef);

            }
            else {

                await set(
                    loveRef,
                    true
                );

            }

        };


    // 🗑️ DELETE COMMENT

    const deleteBtn =
        commentElement.querySelector(
            ".deleteCommentBtn"
        );

    if (deleteBtn) {

        deleteBtn.onclick = async () => {

            const confirmed =
                confirm(
                    "Delete this reply?"
                );

            if (!confirmed) return;

            try {

                await remove(
                    ref(
                        db,
                        `comments/${postId}/${comment.id}`
                    )
                );

                // Decrease comment count
                const postRef =
                    ref(
                        db,
                        "posts/" + postId
                    );

                const postSnapshot =
                    await get(postRef);

                if (
                    postSnapshot.exists()
                ) {

                    const post =
                        postSnapshot.val();

                    await update(
                        postRef,
                        {
                            comments:
                                Math.max(
                                    0,
                                    (post.comments || 0) - 1
                                )
                        }
                    );

                }

            }
            catch(error) {

                console.error(error);

                alert(
                    "Could not delete reply."
                );

            }

        };

    }


    container.appendChild(
        commentElement
    );

}

// ========================================
// 💻 CODEOS PROJECT IMPORTER
// ========================================

const addCodeOSProjectBtn =
    document.getElementById("addCodeOSProjectBtn");

const codeOSProjectOverlay =
    document.getElementById("codeOSProjectOverlay");

const codeOSProjectList =
    document.getElementById("codeOSProjectList");

const closeCodeOSProject =
    document.getElementById("closeCodeOSProject");


function getCodeOSProjects(){

    return JSON.parse(
        localStorage.getItem("codeosWorkspaces") || "[]"
    );

}


function openCodeOSProjectPicker(){

    renderCodeOSProjects();

    codeOSProjectOverlay.classList.remove("hidden");

}


function closeCodeOSProjectPicker(){

    codeOSProjectOverlay.classList.add("hidden");

}


function renderCodeOSProjects(){

    codeOSProjectList.innerHTML = "";

    const projects = getCodeOSProjects();

    if(projects.length === 0){

        codeOSProjectList.innerHTML = `
            <div class="codeosEmpty">

                <div class="codeosEmptyIcon">
                    💻
                </div>

                <h3>No CodeOS projects found</h3>

                <p>
                    Create a workspace in CodeOS first.
                </p>

            </div>
        `;

        return;
    }


    projects.forEach(project => {

        const card = document.createElement("div");

        card.className = "codeosProjectCard";

        const fileCount =
            project.files?.length || 0;

        const date =
            project.date
                ? new Date(project.date).toLocaleString()
                : "Unknown";


        card.innerHTML = `

            <div class="codeosProjectIcon">
                💻
            </div>

            <div class="codeosProjectInfo">

                <div class="codeosProjectName">
                    ${escapeHTML(project.name)}
                </div>

                <div class="codeosProjectMeta">
                    📄 ${fileCount} files
                    <br>
                    📅 ${date}
                </div>

            </div>

            <button class="selectCodeOSProject">
                Add
            </button>

        `;


        card.querySelector(
            ".selectCodeOSProject"
        ).onclick = () => {

            addCodeOSProjectToCommunity(project);

        };


        codeOSProjectList.appendChild(card);

    });

}


function addCodeOSProjectToCommunity(project){

    // ========================================
    // CREATE COMMUNITY PROJECT
    // ========================================

    const communityProject = {

        id:
            "community-codeos-" +
            Date.now(),

        type: "codeos",

        source: "CodeOS",

        name: project.name,

        files: structuredClone(
            project.files || []
        ),

        folders: structuredClone(
            project.folders || []
        ),

        date: Date.now(),

        codeOSProjectId: project.id

    };


    // ========================================
    // GET EXISTING COMMUNITY PROJECTS
    // ========================================

    const projects = JSON.parse(
        localStorage.getItem(
            "communityProjects"
        ) || "[]"
    );


    // ========================================
    // ADD PROJECT
    // ========================================

    projects.push(
        communityProject
    );


    localStorage.setItem(
        "communityProjects",
        JSON.stringify(projects)
    );


    // ========================================
    // CLOSE PICKER
    // ========================================

    closeCodeOSProjectPicker();


    // ========================================
    // REFRESH COMMUNITY
    // ========================================

    if(typeof renderProjects === "function"){

        renderProjects();

    }


    alert(
        `💻 "${project.name}" was added to Community!`
    );

}


// ========================================
// BUTTON
// ========================================

if(addCodeOSProjectBtn){

    addCodeOSProjectBtn.onclick =
        openCodeOSProjectPicker;

}


// ========================================
// CLOSE BUTTON
// ========================================

if(closeCodeOSProject){

    closeCodeOSProject.onclick =
        closeCodeOSProjectPicker;

}


// ========================================
// CLICK OUTSIDE
// ========================================

if(codeOSProjectOverlay){

    codeOSProjectOverlay.addEventListener(
        "click",
        e => {

            if(
                e.target ===
                codeOSProjectOverlay
            ){

                closeCodeOSProjectPicker();

            }

        }
    );

}


// ========================================
// ESC
// ========================================

document.addEventListener(
    "keydown",
    e => {

        if(
            e.key === "Escape" &&
            codeOSProjectOverlay &&
            !codeOSProjectOverlay.classList.contains("hidden")
        ){

            closeCodeOSProjectPicker();

        }

    }
);

// ============================================================
// 🚀 COMMUNITY PROJECT DISCOVERY
// ADD-ON — DO NOT REMOVE EXISTING CODE
// ============================================================

let currentProjectSort = "all";
let currentProjectSearch = "";
let communityProjectPosts = [];

const communityProjectsPage =
    document.getElementById("projectsPage");

const communityProjectFilters =
    communityProjectsPage
        ? communityProjectsPage.querySelectorAll(".filter")
        : [];


// ------------------------------------------------------------
// GET PROJECT DATA
// Supports the project field names used by the newer
// project-post system, while keeping old posts compatible.
// ------------------------------------------------------------

function getProjectData(post) {

    const project =
        post.project ||
        post.data ||
        {};

    return {

        title:
            project.name ||
            project.title ||
            post.projectTitle ||
            post.projectName ||
            post.title ||
            post.name ||
            "Untitled Project",

        description:
            project.description ||
            project.content ||
            post.projectDescription ||
            post.description ||
            post.content ||
            "No project description.",

        image:
            project.image ||
            post.projectImage ||
            post.image ||
            "",

        link:
            project.link ||
            post.projectLink ||
            post.link ||
            "",

        codeOSProjectId:
            project.codeOSProjectId ||
            project.workspaceId ||
            post.codeOSProjectId ||
            "",

        codeOSProjectName:
            project.codeOSProjectName ||
            project.name ||
            "",

        createdAt:
            post.createdAt || 0,

        likes:
            Object.keys(
                post.likedBy || {}
            ).length ||
            post.likes ||
            0,

        loves:
            Object.keys(
                post.lovedBy || {}
            ).length ||
            post.loves ||
            0,

        comments:
            post.comments || 0,

        authorName:
            post.authorName ||
            "CodeOS Member",

        authorId:
            post.authorId ||
            "",

        authorAvatar:
            post.authorAvatar ||
            "",

        postId:
            post.id
    };
}


// ------------------------------------------------------------
// ONE-LINE DESCRIPTION
// ------------------------------------------------------------

function shortenProjectDescription(text) {

    const clean = String(text || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!clean) {
        return "No project description.";
    }

    if (clean.length <= 120) {
        return clean;
    }

    return clean.substring(0, 117) + "...";

}


// ------------------------------------------------------------
// PROJECT CARD
// This is the SAME card style used by:
// 1. Projects discovery
// 2. Project posts in the feed
// ------------------------------------------------------------

function createCommunityProjectCard(post, options = {}) {
    const data = getProjectData(post);

    const card = document.createElement("article");

    card.className = "communityProjectCard";

    // Make the entire card feel clickable
    card.style.cursor = "pointer";

    const imageHTML = `
        <div class="communityProjectImageWrap ${
            data.image ? "" : "communityProjectNoImage"
        }">
            ${
                data.image
                    ? `
                        <img
                            class="communityProjectImage"
                            src="${escapeHTML(data.image)}"
                            alt="${escapeHTML(data.title)}"
                            loading="lazy"
                        >
                    `
                    : `
                        <div class="communityProjectPlaceholder">
                            🚀
                        </div>
                    `
            }
        </div>
    `;

    const safeDescription =
        shortenProjectDescription(data.description);

    card.innerHTML = `
        ${imageHTML}

        <div class="communityProjectBody">

            <div class="communityProjectTop">
                <div class="communityProjectBadge">
                    🚀 PROJECT
                </div>

                ${
                    data.createdAt
                        ? `
                            <span class="communityProjectDate">
                                ${new Date(
                                    data.createdAt
                                ).toLocaleDateString()}
                            </span>
                        `
                        : ""
                }
            </div>

            <h3 class="communityProjectTitle">
                ${escapeHTML(data.title)}
            </h3>

            <p class="communityProjectDescription">
                ${escapeHTML(safeDescription)}
            </p>

            <div class="communityProjectAuthor">
                <div class="communityProjectAuthorAvatar">
                    ${
                        data.authorAvatar
                            ? `
                                <img
                                    src="${escapeHTML(
                                        data.authorAvatar
                                    )}"
                                    alt=""
                                >
                            `
                            : "👤"
                    }
                </div>

                <span>
                    ${escapeHTML(data.authorName)}
                </span>
            </div>

            <div class="communityProjectStats">
                <span>
                    ❤️ ${data.likes}
                </span>

                <span>
                    💗 ${data.loves}
                </span>

                <span>
                    💬 ${data.comments}
                </span>
            </div>

            ${
                data.link
                    ? `
                        <button
                            class="communityProjectOpen"
                            type="button"
                        >
                            Open Project 🚀
                        </button>
                    `
                    : ""
            }

        </div>
    `;

    // ==========================================
    // 💎 MODERATOR SEND PROJECT
    // ==========================================

    if (
        canCurrentUserModerate() &&
        post.moderation?.sentToModerator !== true
    ) {
        const sendProjectBtn =
            document.createElement("button");

        sendProjectBtn.type = "button";

        sendProjectBtn.className =
            "moderatorSendProjectBtn";

        sendProjectBtn.innerHTML =
            "💎 Send Project";

        sendProjectBtn.onclick = event => {
            event.stopPropagation();

            sendProjectToModerator(
                post.id,
                post.project
            );
        };

        card.querySelector(
            ".communityProjectBody"
        ).appendChild(sendProjectBtn);
    }

    // ==========================================
    // 🚀 OPEN PROJECT
    // ==========================================

    card.onclick = event => {

        // Don't open when clicking buttons
        if (
            event.target.closest(
                ".communityProjectOpen"
            ) ||
            event.target.closest(
                ".moderatorSendProjectBtn"
            )
        ) {
            return;
        }

        openCommunityProject(
            post,
            data
        );
    };

    // ==========================================
    // 🚀 OPEN BUTTON
    // ==========================================

    const openButton =
        card.querySelector(
            ".communityProjectOpen"
        );

    if (openButton) {
        openButton.onclick = event => {
            event.stopPropagation();

            openCommunityProject(
                post,
                data
            );
        };
    }

    return card;
}

// ------------------------------------------------------------
// LOAD PROJECT POSTS FROM FIREBASE
// ------------------------------------------------------------

async function loadCommunityProjectPosts() {
    try {
        const snapshot = await get(
            ref(db, "posts")
        );

        const moderationSnapshot = await get(
            ref(db, "projectModeration")
        );

        const moderation =
            moderationSnapshot.exists()
                ? moderationSnapshot.val()
                : {};

        communityProjectPosts = [];

        if (!snapshot.exists()) {
            renderProjectDiscovery();
            return;
        }

        snapshot.forEach(child => {
            const post = {
                id: child.key,
                ...child.val()
            };

            if (post.type === "project") {
                const mod =
                    moderation[post.id] || {};

                post.moderation = mod;

                communityProjectPosts.push(post);
            }
        });

        renderProjectDiscovery();

    } catch (error) {
        console.error(
            "Project discovery error:",
            error
        );
    }
}


// ------------------------------------------------------------
// SORT PROJECTS
// ------------------------------------------------------------

function sortCommunityProjects(projects) {

    const sorted =
        [...projects];


    if (currentProjectSort === "recent") {

        sorted.sort(
            (a, b) =>
                (b.createdAt || 0) -
                (a.createdAt || 0)
        );

    }


    else if (currentProjectSort === "trending") {

        sorted.sort((a, b) => {

            const aLikes =
                Object.keys(
                    a.likedBy || {}
                ).length ||
                a.likes ||
                0;

            const aLoves =
                Object.keys(
                    a.lovedBy || {}
                ).length ||
                a.loves ||
                0;

            const aComments =
                a.comments || 0;


            const bLikes =
                Object.keys(
                    b.likedBy || {}
                ).length ||
                b.likes ||
                0;

            const bLoves =
                Object.keys(
                    b.lovedBy || {}
                ).length ||
                b.loves ||
                0;

            const bComments =
                b.comments || 0;


            const now =
                Date.now();

            const day =
                1000 * 60 * 60 * 24;


            const aAge =
                Math.max(
                    1,
                    (now - (a.createdAt || now)) /
                    day
                );

            const bAge =
                Math.max(
                    1,
                    (now - (b.createdAt || now)) /
                    day
                );


            const aScore =
                (
                    aLikes * 3 +
                    aLoves * 4 +
                    aComments * 2 +
                    1
                ) / Math.sqrt(aAge);


            const bScore =
                (
                    bLikes * 3 +
                    bLoves * 4 +
                    bComments * 2 +
                    1
                ) / Math.sqrt(bAge);


            return bScore - aScore;

        });

    }


    else if (currentProjectSort === "liked") {

        sorted.sort((a, b) => {

            const aLikes =
                Object.keys(
                    a.likedBy || {}
                ).length ||
                a.likes ||
                0;

            const bLikes =
                Object.keys(
                    b.likedBy || {}
                ).length ||
                b.likes ||
                0;

            return bLikes - aLikes;

        });

    }


    else if (currentProjectSort === "loved") {

        sorted.sort((a, b) => {

            const aLoves =
                Object.keys(
                    a.lovedBy || {}
                ).length ||
                a.loves ||
                0;

            const bLoves =
                Object.keys(
                    b.lovedBy || {}
                ).length ||
                b.loves ||
                0;

            return bLoves - aLoves;

        });

    }


    else {

        // ALL = newest first
        sorted.sort(
            (a, b) =>
                (b.createdAt || 0) -
                (a.createdAt || 0)
        );

    }


    return sorted;

}


// ------------------------------------------------------------
// RENDER PROJECT DISCOVERY
// ------------------------------------------------------------

function renderProjectDiscovery() {
    if (!projectsPage) return;

    const placeholder =
        projectsPage.querySelector(
            ".comingSoon"
        );

    if (!placeholder) return;

    placeholder.innerHTML = "";

    placeholder.classList.add(
        "projectDiscoveryContainer"
    );

    let projects =
    sortCommunityProjects(
        communityProjectPosts
    );

if (currentProjectSearch) {

    const query =
        currentProjectSearch
            .trim()
            .toLowerCase();

    projects =
        projects.filter(post => {

            const data =
                getProjectData(post);

            return [
                data.title,
                data.description,
                data.authorName,
                data.codeOSProjectName
            ]
                .join(" ")
                .toLowerCase()
                .includes(query);

        });

}

document
    .getElementById("projectSearchInput")
    ?.addEventListener(
        "input",
        event => {

            currentProjectSearch =
                event.target.value;

            renderProjectDiscovery();

        }
    );

    // =========================================
    // MODERATION FILTERS
    // =========================================

    if (activeFilter === "awarded") {
        projects = projects.filter(project =>
            project.moderation?.awarded === true
        );
    }

    if (activeFilter === "staff") {
        projects = projects.filter(project =>
            project.moderation?.staffPick === true
        );
    }

    // =========================================
    // EMPTY STATE
    // =========================================

    if (projects.length === 0) {
        placeholder.innerHTML = `
            <div class="communityProjectsEmpty">
                <div class="communityProjectsEmptyIcon">
                    ${
                        activeFilter === "awarded"
                            ? "🏆"
                            : activeFilter === "staff"
                                ? "👑"
                                : "🚀"
                    }
                </div>

                <h3>
                    ${
                        activeFilter === "awarded"
                            ? "No awarded projects yet"
                            : activeFilter === "staff"
                                ? "No Staff Picks yet"
                                : "No community projects yet"
                    }
                </h3>

                <p>
                    ${
                        activeFilter === "awarded"
                            ? "Featured projects will appear here."
                            : activeFilter === "staff"
                                ? "Projects rated 4–5 stars will appear here."
                                : "Be the first to publish one!"
                    }
                </p>
            </div>
        `;

        return;
    }

    // =========================================
    // PROJECT GRID
    // =========================================

    const grid =
        document.createElement("div");

    grid.className =
        "communityProjectsGrid";

    projects.forEach(post => {
        grid.appendChild(
            createCommunityProjectCard(post)
        );
    });

    placeholder.appendChild(grid);
}


// ------------------------------------------------------------
// PROJECT FILTER BUTTONS
// ------------------------------------------------------------

communityProjectFilters.forEach(filter => {

    filter.addEventListener(
        "click",
        () => {

            const text =
                filter.textContent
                    .toLowerCase();


            if (
                text.includes("recent")
            ) {

                currentProjectSort =
                    "recent";

            }

            else if (
                text.includes("trending")
            ) {

                currentProjectSort =
                    "trending";

            }

            else if (
                text.includes("most liked")
            ) {

                currentProjectSort =
                    "liked";

            }

            else if (
                text.includes("most loved")
            ) {

                currentProjectSort =
                    "loved";

            }

            else if (
                text.includes("all")
            ) {

                currentProjectSort =
                    "all";

            }

            else {

                return;

            }


            communityProjectFilters.forEach(
                button =>
                    button.classList.remove(
                        "active"
                    )
            );


            filter.classList.add(
                "active"
            );


            renderProjectDiscovery();

        }
    );

});


// ------------------------------------------------------------
// REAL-TIME PROJECT DISCOVERY
// ------------------------------------------------------------

const communityProjectPostsRef =
    ref(db, "posts");


onValue(
    communityProjectPostsRef,
    snapshot => {

        communityProjectPosts = [];


        if (snapshot.exists()) {

            snapshot.forEach(child => {

                const post = {

                    id: child.key,

                    ...child.val()

                };


                if (
                    post.type === "project"
                ) {

                    communityProjectPosts.push(
                        post
                    );

                }

            });

        }


        renderProjectDiscovery();

    }
);


// ------------------------------------------------------------
// LOAD ON STARTUP
// ------------------------------------------------------------

loadCommunityProjectPosts();

// ========================================
// 🧩 SETUP TYPE COMPOSER
// ========================================

function setupTypeComposer(type) {

    // ------------------------------------
    // POLL
    // ------------------------------------

    if (type === "poll") {

        const addBtn =
            document.getElementById(
                "addPollOptionBtn"
            );

        const optionsContainer =
            document.getElementById(
                "pollOptionsComposer"
            );

        addBtn.onclick = () => {

            const count =
                optionsContainer
                    .querySelectorAll(
                        ".pollOptionInput"
                    )
                    .length;

            if (count >= 6) {

                alert(
                    "Polls can have up to 6 options."
                );

                return;
            }

            const label =
                document.createElement("label");

            label.innerText =
                `Option ${count + 1}`;

            const input =
                document.createElement("input");

            input.className =
                "pollOptionInput";

            input.type = "text";

            input.maxLength = 100;

            input.placeholder =
                `Option ${count + 1}`;

            optionsContainer.appendChild(label);

            optionsContainer.appendChild(input);

        };

    }

    // ------------------------------------
    // TUTORIAL
    // ------------------------------------

    if (type === "tutorial") {

        tutorialStepCount = 0;

        const modeButtons =
            document.querySelectorAll(
                ".tutorialModeBtn"
            );

        modeButtons.forEach(button => {

            button.onclick = () => {

                modeButtons.forEach(btn =>
                    btn.classList.remove("active")
                );

                button.classList.add("active");

                currentTutorialMode =
                    button.dataset.mode;

                renderTutorialComposer();
            };

        });

        renderTutorialComposer();

    }

}

// ========================================
// 📚 TUTORIAL COMPOSER
// ========================================

function renderTutorialComposer() {

    const container =
        document.getElementById(
            "tutorialStepsComposer"
        );

    if (!container) return;

    if (currentTutorialMode === "normal") {

        container.innerHTML = `

            <label>Tutorial content</label>

            <textarea
                id="tutorialNormalContentInput"
                maxlength="5000"
                placeholder="Write your tutorial here..."
            ></textarea>

            <label>Image URL (optional)</label>

            <input
                id="tutorialNormalImageInput"
                type="url"
                placeholder="https://..."
            >

        `;

        return;
    }

    container.innerHTML = `

        <div id="tutorialStepList"></div>

        <button
            type="button"
            id="addTutorialStepBtn"
            class="secondaryComposerButton"
        >
            + Add Step
        </button>

    `;

    addTutorialStep();

    document.getElementById(
        "addTutorialStepBtn"
    ).onclick = addTutorialStep;

}

// ========================================
// 📚 ADD TUTORIAL STEP
// ========================================

let tutorialStepCount = 0;

function addTutorialStep() {

    const list =
        document.getElementById(
            "tutorialStepList"
        );

    if (!list) return;

    if (tutorialStepCount >= 20) {

        alert(
            "Tutorials can have up to 20 steps."
        );

        return;
    }

    tutorialStepCount++;

    const step =
        document.createElement("div");

    step.className =
        "tutorialComposerStep";

    step.dataset.step =
        tutorialStepCount;

    step.innerHTML = `

        <div class="tutorialComposerStepHeader">

            STEP ${tutorialStepCount}

        </div>

        <textarea
            class="tutorialStepDescription"
            maxlength="1500"
            placeholder="Explain what to do in this step..."
        ></textarea>

        <input
            class="tutorialStepImage"
            type="url"
            placeholder="Image URL (optional)"
        >

    `;

    list.appendChild(step);

}

// ========================================
// 🚀 OPEN COMMUNITY PROJECT IN CODEOS
// ========================================

function openCommunityProject(
    post,
    projectData
) {

    if (!projectData.codeOSProjectId) {

        if (projectData.link) {

            window.open(
                projectData.link,
                "_blank",
                "noopener,noreferrer"
            );

        } else {

            alert(
                "This project isn't connected to a CodeOS workspace."
            );

        }

        return;
    }

    /*
        Store the community project reference.

        CodeOS can read this when it opens and
        load the shared project.
    */

    localStorage.setItem(
        "communityOpenProject",
        JSON.stringify({

            projectId:
                projectData.codeOSProjectId,

            projectName:
                projectData.codeOSProjectName ||
                projectData.title,

            postId:
                post.id,

            authorId:
                post.authorId,

            authorName:
                post.authorName

        })
    );

    /*
        Change this path if your CodeOS workspace
        page has a different filename.
    */

    window.location.href =
        "workspace.html?communityProject=" +
        encodeURIComponent(
            projectData.codeOSProjectId
        );

}

// ============================================================
// 👥 CODEOS GROUP SYSTEM
// ============================================================

const groupFeature = {
    currentGroupId: null,
    currentGroupOwnerId: null,
    currentGroupAdminIds: {},
    groups: [],
    publicGroups: []
};


// ============================================================
// ELEMENTS
// ============================================================

const groupFeaturePage =
    document.getElementById("groupsPage");

const groupFeatureGrid =
    document.getElementById("yourGroupsGrid");

const publicGroupFeatureGrid =
    document.getElementById("publicGroupsGrid");

const groupSearchFeatureInput =
    document.getElementById("groupSearchInput");

const createPrivateGroupFeatureBtn =
    document.getElementById(
        "createPrivateGroupBtn"
    );

const createPublicGroupFeatureBtn =
    document.getElementById(
        "createPublicGroupBtn"
    );

const yourGroupCountFeature =
    document.getElementById(
        "yourGroupCount"
    );


// ============================================================
// CREATE GROUP MODAL
// ============================================================

function createGroupModal() {

    if (
        document.getElementById(
            "groupCreateModal"
        )
    ) {
        return;
    }

    const modal =
        document.createElement("div");

    modal.id =
        "groupCreateModal";

    modal.className =
        "modal hidden";

    modal.innerHTML = `

        <div class="modalBox groupCreateBox">

            <button
                class="closeModal"
                id="closeGroupCreate"
            >
                ✕
            </button>

            <div class="modalIcon">
                👥
            </div>

            <h2 id="groupCreateTitle">
                Create Group
            </h2>

            <p>
                Build your own CodeOS community.
            </p>


            <input
                id="groupNameInput"
                type="text"
                placeholder="Group name"
                maxlength="60"
            >


            <textarea
                id="groupDescriptionInput"
                placeholder="What is this group about?"
                maxlength="300"
            ></textarea>


            <div class="groupVisibilityPreview">

                <span id="groupVisibilityIcon">
                    🔒
                </span>

                <div>

                    <strong
                        id="groupVisibilityTitle"
                    >
                        Private Group
                    </strong>

                    <small
                        id="groupVisibilityText"
                    >
                        Only invited members can join.
                    </small>

                </div>

            </div>


            <label
                id="groupPostOption"
                class="groupCheckbox"
            >

                <input
                    id="groupCreatePostInput"
                    type="checkbox"
                >

                <span>
                    📢 Create a community post about this group
                </span>

            </label>


            <button
                id="saveGroupBtn"
                class="publishBtn"
                type="button"
            >
                ✨ Create Group
            </button>


            <div
                id="groupCreateStatus"
                class="authStatus"
            ></div>

        </div>

    `;

    document.body.appendChild(modal);


    document
        .getElementById("closeGroupCreate")
        .onclick = () => {

            modal.classList.add(
                "hidden"
            );

        };


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


createGroupModal();


// ============================================================
// OPEN CREATE GROUP
// ============================================================

function openCreateGroupModal(
    visibility
) {

    if (!currentUser) {

        loginModal.classList.remove(
            "hidden"
        );

        return;
    }

    const modal =
        document.getElementById(
            "groupCreateModal"
        );

    const title =
        document.getElementById(
            "groupCreateTitle"
        );

    const icon =
        document.getElementById(
            "groupVisibilityIcon"
        );

    const visibilityTitle =
        document.getElementById(
            "groupVisibilityTitle"
        );

    const visibilityText =
        document.getElementById(
            "groupVisibilityText"
        );

    const postOption =
        document.getElementById(
            "groupPostOption"
        );


    modal.dataset.visibility =
        visibility;


    if (
        visibility === "public"
    ) {

        title.innerText =
            "Create Public Group";

        icon.innerText =
            "🌎";

        visibilityTitle.innerText =
            "Public Group";

        visibilityText.innerText =
            "Anyone can discover and request to join.";

        postOption.style.display =
            "flex";

    }
    else {

        title.innerText =
            "Create Private Group";

        icon.innerText =
            "🔒";

        visibilityTitle.innerText =
            "Private Group";

        visibilityText.innerText =
            "Only people you invite can join.";

        postOption.style.display =
            "none";

    }


    document.getElementById(
        "groupNameInput"
    ).value = "";

    document.getElementById(
        "groupDescriptionInput"
    ).value = "";

    document.getElementById(
        "groupCreatePostInput"
    ).checked = false;

    document.getElementById(
        "groupCreateStatus"
    ).innerText = "";


    modal.classList.remove(
        "hidden"
    );

}


createPrivateGroupFeatureBtn.onclick =
    () => {

        openCreateGroupModal(
            "private"
        );

    };


createPublicGroupFeatureBtn.onclick =
    () => {

        openCreateGroupModal(
            "public"
        );

    };


// ============================================================
// CREATE GROUP
// ============================================================

document.getElementById(
    "saveGroupBtn"
).onclick = async () => {

    if (!currentUser) return;


    const modal =
        document.getElementById(
            "groupCreateModal"
        );

    const name =
        document.getElementById(
            "groupNameInput"
        ).value.trim();

    const description =
        document.getElementById(
            "groupDescriptionInput"
        ).value.trim();

    const visibility =
        modal.dataset.visibility ||
        "private";

    const createPost =
        document.getElementById(
            "groupCreatePostInput"
        ).checked;


    if (!name) {

        document.getElementById(
            "groupCreateStatus"
        ).innerText =
            "Please enter a group name.";

        return;
    }


    if (!description) {

        document.getElementById(
            "groupCreateStatus"
        ).innerText =
            "Please add a description.";

        return;
    }


    const profileSnapshot =
        await get(
            ref(
                db,
                "users/" +
                currentUser.uid
            )
        );


    const profile =
        profileSnapshot.exists()
            ? profileSnapshot.val()
            : {};


    const groupsRef =
        ref(db, "groups");

    const groupRef =
        push(groupsRef);


    const groupId =
        groupRef.key;


    const groupData = {

        name,

        description,

        type:
            visibility,

        ownerId:
            currentUser.uid,

        ownerName:
            profile.username ||
            currentUser.displayName ||
            "CodeOS Member",

        createdAt:
            serverTimestamp(),

        members: {

            [currentUser.uid]:
                "admin"

        },

        pendingMembers: {},

        invitedMembers: {}

    };


    try {

        await set(
            groupRef,
            groupData
        );


        /*
            Optional public announcement post.
        */

        if (
            visibility === "public" &&
            createPost
        ) {

            const postRef =
                push(
                    ref(
                        db,
                        "posts"
                    )
                );

            await set(
                postRef,
                {

                    authorId:
                        currentUser.uid,

                    authorName:
                        profile.username ||
                        currentUser.displayName ||
                        "CodeOS Member",

                    authorAvatar:
                        profile.avatar ||
                        currentUser.photoURL ||
                        "",

                    type:
                        "discussion",

                    content:
                        `🌎 I created a new public group: ${name}`,

                    data: {

                        title:
                            name,

                        description:
                            description,

                        groupId

                    },

                    likes: 0,

                    loves: 0,

                    comments: 0,

                    createdAt:
                        serverTimestamp()

                }
            );

        }


        modal.classList.add(
            "hidden"
        );


        loadUserGroups();

        alert(
            `👥 "${name}" created!`
        );

    }
    catch(error) {

        console.error(
            "Create group error:",
            error
        );

        document.getElementById(
            "groupCreateStatus"
        ).innerText =
            error.message;

    }

};


// ============================================================
// LOAD USER GROUPS
// ============================================================

function loadUserGroups() {

    if (!groupFeatureGrid) return;

    // Remove old listener
    if (groupFeature.groupsUnsubscribe) {
        groupFeature.groupsUnsubscribe();
        groupFeature.groupsUnsubscribe = null;
    }

    if (!currentUser) {
        groupFeature.groups = [];

        groupFeatureGrid.innerHTML = `
            <div class="groupsEmpty">
                🔐 Sign in to see your groups.
            </div>
        `;

        if (yourGroupCountFeature) {
            yourGroupCountFeature.innerText = "0 groups";
        }

        return;
    }

    const groupsRef = ref(db, "groups");

    groupFeature.groupsUnsubscribe = onValue(
        groupsRef,
        snapshot => {

            groupFeature.groups = [];

            if (snapshot.exists()) {

                snapshot.forEach(child => {

                    const group = {
                        id: child.key,
                        ...child.val()
                    };

                    // Only show groups this user belongs to
                    if (
                        group.members &&
                        Object.prototype.hasOwnProperty.call(
                            group.members,
                            currentUser.uid
                        )
                    ) {
                        groupFeature.groups.push(group);
                    }

                });
            }

            renderUserGroups();
        },

        error => {
            console.error(
                "Failed to load groups:",
                error
            );

            groupFeatureGrid.innerHTML = `
                <div class="groupsEmpty">
                    ❌ Couldn't load your groups.
                    <br>
                    <small>${escapeHTML(error.message)}</small>
                </div>
            `;
        }
    );
}


function renderUserGroups() {

    groupFeatureGrid.innerHTML = "";


    yourGroupCountFeature.innerText =
        `${groupFeature.groups.length} ${
            groupFeature.groups.length === 1
                ? "group"
                : "groups"
        }`;


    if (
        groupFeature.groups.length === 0
    ) {

        groupFeatureGrid.innerHTML = `

            <div class="groupsEmpty">

                <div class="groupsEmptyIcon">
                    👥
                </div>

                <h3>
                    You haven't joined any groups yet
                </h3>

                <p>
                    Create one or discover a public group.
                </p>

            </div>

        `;

        return;
    }


    groupFeature.groups.forEach(group => {
    renderGroupCard(group);
});
}


// ============================================================
// GROUP CARD
// ============================================================

function renderGroupCard(
    group,
    container = groupFeatureGrid
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "fancyGroupCard";


    const memberCount =
        Object.keys(
            group.members || {}
        ).length;


    const isAdmin =
        group.ownerId ===
        currentUser?.uid ||
        group.members?.[
            currentUser?.uid
        ] === "admin";


    card.innerHTML = `

        <div class="groupCardGlow"></div>

        <div class="groupCardIcon">

            ${
                group.type === "public"
                    ? "🌎"
                    : "🔒"
            }

        </div>


        <div class="groupCardContent">

            <div class="groupCardTop">

                <span class="groupVisibilityBadge">

                    ${
                        group.type === "public"
                            ? "PUBLIC"
                            : "PRIVATE"
                    }

                </span>

                ${
                    isAdmin
                        ? `
                            <span class="groupAdminBadge">
                                👑 ADMIN
                            </span>
                        `
                        : ""
                }

            </div>


            <h3>
                ${escapeHTML(
                    group.name
                )}
            </h3>


            <p>
                ${escapeHTML(
                    group.description
                )}
            </p>


            <div class="groupCardMeta">

                👥 ${memberCount} ${
                    memberCount === 1
                        ? "member"
                        : "members"
                }

            </div>

        </div>


        <div class="groupCardArrow">
            →
        </div>

    `;


    card.onclick = () => {

        openGroup(
            group.id
        );

    };


    container.appendChild(
        card
    );

}


// ============================================================
// PUBLIC GROUP SEARCH
// ============================================================

function loadPublicGroups(search = "") {

    if (!publicGroupFeatureGrid) return;

    if (groupFeature.publicGroupsUnsubscribe) {
        groupFeature.publicGroupsUnsubscribe();
        groupFeature.publicGroupsUnsubscribe = null;
    }

    if (!currentUser) {
        publicGroupFeatureGrid.innerHTML = `
            <div class="groupsEmpty">
                🔐 Sign in to discover groups.
            </div>
        `;
        return;
    }

    const groupsRef = ref(db, "groups");

    groupFeature.publicGroupsUnsubscribe = onValue(
        groupsRef,
        snapshot => {

            groupFeature.publicGroups = [];

            const query = search
                .toLowerCase()
                .trim();

            if (snapshot.exists()) {

                snapshot.forEach(child => {

                    const group = {
                        id: child.key,
                        ...child.val()
                    };

                    if (group.type !== "public") {
                        return;
                    }

                    if (
                        query &&
                        !(group.name || "")
                            .toLowerCase()
                            .includes(query) &&
                        !(group.description || "")
                            .toLowerCase()
                            .includes(query)
                    ) {
                        return;
                    }

                    groupFeature.publicGroups.push(group);
                });
            }

            renderPublicGroups();
        },

        error => {
            console.error(
                "Failed to load public groups:",
                error
            );
        }
    );
}


function renderPublicGroups() {

    publicGroupFeatureGrid.innerHTML =
        "";


    if (
        groupFeature.publicGroups.length ===
        0
    ) {

        publicGroupFeatureGrid.innerHTML = `

            <div class="groupsEmpty">

                <div class="groupsEmptyIcon">
                    🔎
                </div>

                <h3>
                    No public groups found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    groupFeature.publicGroups
        .forEach(group => {

            /*
                Don't show a join button
                for groups we're already in.
            */

            const alreadyMember =
                !!group.members?.[
                    currentUser?.uid
                ];


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "fancyGroupCard publicDiscoveryCard";


            const memberCount =
                Object.keys(
                    group.members || {}
                ).length;


            card.innerHTML = `

                <div class="groupCardIcon">
                    🌎
                </div>

                <div class="groupCardContent">

                    <span
                        class="groupVisibilityBadge"
                    >
                        PUBLIC
                    </span>

                    <h3>
                        ${escapeHTML(
                            group.name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            group.description
                        )}
                    </p>

                    <div class="groupCardMeta">
                        👥 ${memberCount} members
                    </div>

                </div>


                <button
                    class="joinGroupBtn"
                    type="button"
                    ${
                        alreadyMember
                            ? "disabled"
                            : ""
                    }
                >

                    ${
                        alreadyMember
                            ? "✓ Joined"
                            : "Request to Join"
                    }

                </button>

            `;


            const joinBtn =
                card.querySelector(
                    ".joinGroupBtn"
                );


            if (
                !alreadyMember
            ) {

                joinBtn.onclick =
                    event => {

                        event.stopPropagation();

                        requestToJoinGroup(
                            group
                        );

                    };

            }


            publicGroupFeatureGrid
                .appendChild(card);

        });

}


groupSearchFeatureInput
    .addEventListener(
        "input",
        () => {

            loadPublicGroups(
                groupSearchFeatureInput.value
            );

        }
    );


// ============================================================
// REQUEST TO JOIN
// ============================================================

async function requestToJoinGroup(
    group
) {

    if (!currentUser) {

        loginModal.classList.remove(
            "hidden"
        );

        return;

    }


    const requestRef =
        ref(
            db,
            `groups/${group.id}/pendingMembers/${currentUser.uid}`
        );


    const existing =
        await get(requestRef);


    if (
        existing.exists()
    ) {

        alert(
            "⏳ You've already requested to join this group."
        );

        return;

    }


    await set(
        requestRef,
        true
    );


    /*
        Notify every admin.
    */

    const members =
        group.members || {};


    const profileSnapshot =
        await get(
            ref(
                db,
                "users/" +
                currentUser.uid
            )
        );


    const profile =
        profileSnapshot.exists()
            ? profileSnapshot.val()
            : {};


    for (
        const uid of Object.keys(
            members
        )
    ) {

        if (
            members[uid] !== "admin" &&
            uid !== group.ownerId
        ) {
            continue;
        }


        await createNotification(
            uid,
            {

                type:
                    "group_join_request",

                title:
                    "New group request",

                message:
                    `${
                        profile.username ||
                        "Someone"
                    } wants to join "${group.name}".`,

                groupId:
                    group.id,

                groupName:
                    group.name,

                fromUserId:
                    currentUser.uid,

                fromUserName:
                    profile.username ||
                    "CodeOS Member",

                action:
                    "review_group_request"

            }
        );

    }


    alert(
        `📨 Request sent to "${group.name}"!`
    );

}


// ============================================================
// OPEN GROUP
// ============================================================

async function openGroup(
    groupId
) {

    const snapshot =
        await get(
            ref(
                db,
                "groups/" +
                groupId
            )
        );


    if (
        !snapshot.exists()
    ) {

        alert(
            "This group no longer exists."
        );

        return;

    }


    const group =
        snapshot.val();

    group.id =
        groupId;


    groupFeature.currentGroupId = groupId;

groupFeature.currentGroupOwnerId = group.ownerId;

groupFeature.currentGroupAdminIds = {};

Object.entries(group.members || {}).forEach(
    ([uid, role]) => {
        if (role === "admin") {
            groupFeature.currentGroupAdminIds[uid] = true;
        }
    }
);

renderGroupDiscussionPage(group);

}


// ============================================================
// GROUP DISCUSSION PAGE
// ============================================================

function renderGroupDiscussionPage(
    group
) {

    document
        .querySelectorAll(".page")
        .forEach(page =>
            page.classList.remove(
                "activePage"
            )
        );


    /*
        Re-use the existing Discuss page
        instead of creating another page.
    */

    const discussPage =
        document.getElementById(
            "discussPage"
        );


    discussPage.innerHTML = `

        <div class="groupDiscussionPage">

            <button
                id="leaveGroupDiscussion"
                class="backButton"
                type="button"
            >
                ← Back to Groups
            </button>


            <div class="groupDiscussionHeader">

                <div class="groupDiscussionIcon">

                    ${
                        group.type === "public"
                            ? "🌎"
                            : "🔒"
                    }

                </div>

                <div>

                    <span>
                        ${
                            group.type === "public"
                                ? "PUBLIC GROUP"
                                : "PRIVATE GROUP"
                        }
                    </span>

                    <h2>
                        ${escapeHTML(
                            group.name
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            group.description
                        )}
                    </p>

                </div>

            </div>


            <div
                id="groupMessages"
                class="groupMessages"
            ></div>


            <div class="groupMessageComposer">

                <input
                    id="groupMessageInput"
                    type="text"
                    maxlength="1000"
                    placeholder="Message the group..."
                >

                <button
                    id="sendGroupMessageBtn"
                    type="button"
                >
                    🚀 Send
                </button>

            </div>

        </div>

    `;


    discussPage.classList.add(
        "activePage"
    );


    document.getElementById(
        "pageTitle"
    ).innerText =
        group.name;


    document.getElementById(
    "leaveGroupDiscussion"
).onclick = () => {

    // Stop listening to old group's messages
    if (groupFeature.messagesUnsubscribe) {
        groupFeature.messagesUnsubscribe();
        groupFeature.messagesUnsubscribe = null;
    }

    groupFeature.currentGroupId = null;

    document
        .querySelectorAll(".page")
        .forEach(page =>
            page.classList.remove(
                "activePage"
            )
        );

    groupFeaturePage.classList.add(
        "activePage"
    );

    document.getElementById(
        "pageTitle"
    ).innerText = "Groups";

    loadUserGroups();
    loadPublicGroups(
        groupSearchFeatureInput?.value || ""
    );
};


    loadGroupMessages(
        group.id
    );


    document.getElementById(
        "sendGroupMessageBtn"
    ).onclick =
        sendGroupMessage;


    document.getElementById(
        "groupMessageInput"
    ).addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                sendGroupMessage();

            }

        }
    );

}


// ============================================================
// GROUP MESSAGES
// ============================================================

function loadGroupMessages(groupId) {
    onValue(
        ref(db, `groups/${groupId}/messages`),
        snapshot => {
            const container = document.getElementById("groupMessages");

            if (!container) return;

            container.innerHTML = "";

            if (!snapshot.exists()) {
                container.innerHTML = `
                    <div class="groupMessagesEmpty">
                        💬 No messages yet.<br>
                        Start the conversation!
                    </div>
                `;
                return;
            }

            snapshot.forEach(child => {
                const message = child.val();
                const messageId = child.key;

                const bubble = document.createElement("div");
                bubble.className = "groupMessage";

                if (message.authorId === currentUser?.uid) {
                    bubble.classList.add("mine");
                }

                // Admin check
                const isAdmin =
                    message.groupOwnerId === currentUser?.uid ||
                    message.groupAdminIds?.[currentUser?.uid] === true;

                const canDelete =
                    message.authorId === currentUser?.uid ||
                    isAdmin;

                bubble.innerHTML = `
                    <div class="groupMessageHeader">
                        <div class="groupMessageAuthor">
                            ${escapeHTML(
                                message.authorName || "Member"
                            )}
                        </div>

                        ${
                            canDelete
                                ? `
                                    <button
                                        class="deleteGroupMessageBtn"
                                        type="button"
                                        title="Delete message"
                                    >
                                        🗑️
                                    </button>
                                `
                                : ""
                        }
                    </div>

                    <div class="groupMessageText">
                        ${escapeHTML(message.content || "")}
                    </div>
                `;

                const deleteBtn = bubble.querySelector(
                    ".deleteGroupMessageBtn"
                );

                if (deleteBtn) {
                    deleteBtn.onclick = async event => {
                        event.stopPropagation();

                        const confirmed = confirm(
                            "Delete this message?"
                        );

                        if (!confirmed) return;

                        try {
                            await remove(
                                ref(
                                    db,
                                    `groups/${groupId}/messages/${messageId}`
                                )
                            );
                        } catch (error) {
                            console.error(
                                "Delete message error:",
                                error
                            );

                            alert(
                                "Couldn't delete the message."
                            );
                        }
                    };
                }

                container.appendChild(bubble);
            });

            container.scrollTop = container.scrollHeight;
        }
    );
}


async function sendGroupMessage() {

    if (!currentUser) {
        loginModal.classList.remove("hidden");
        return;
    }

    const input =
        document.getElementById("groupMessageInput");

    const button =
        document.getElementById("sendGroupMessageBtn");

    if (!input) return;

    const content =
        input.value.trim();

    if (!content) return;

    const groupId =
        groupFeature.currentGroupId;

    if (!groupId) {
        console.error(
            "No current group selected."
        );
        return;
    }

    try {

        if (button) {
            button.disabled = true;
            button.innerText = "Sending...";
        }

        // Verify group still exists
        const groupSnapshot = await get(
            ref(db, `groups/${groupId}`)
        );

        if (!groupSnapshot.exists()) {

            alert(
                "This group no longer exists."
            );

            return;
        }

        const group =
            groupSnapshot.val();

        // Verify membership
        const role =
            group.members?.[currentUser.uid];

        if (!role) {

            alert(
                "You are no longer a member of this group."
            );

            return;
        }

        const profileSnapshot = await get(
            ref(
                db,
                `users/${currentUser.uid}`
            )
        );

        const profile =
            profileSnapshot.exists()
                ? profileSnapshot.val()
                : {};

        const messagesRef = ref(
            db,
            `groups/${groupId}/messages`
        );

        const messageRef =
            push(messagesRef);

        await set(
    messageRef,
    {
        authorId:
            currentUser.uid,

        authorName:
            profile.username ||
            currentUser.displayName ||
            "CodeOS Member",

        authorAvatar:
            profile.avatar ||
            currentUser.photoURL ||
            "",

        content,

        groupOwnerId:
            groupFeature.currentGroupOwnerId,

        groupAdminIds:
            groupFeature.currentGroupAdminIds,

        createdAt:
            serverTimestamp()
    }
);

        input.value = "";

    } catch (error) {

        console.error(
            "Send group message error:",
            error
        );

        alert(
            "Couldn't send message: " +
            error.message
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.innerText = "🚀 Send";
        }
    }
}

// ============================================================
// 🔔 NOTIFICATION SYSTEM
// ============================================================

async function createNotification(
    userId,
    notification
) {
    if (!areCodeOSNotificationsAllowed()) {
        return;
    }

    const notificationsRef =
        ref(
            db,
            `notifications/${userId}`
        );

    const notificationRef =
        push(
            notificationsRef
        );

    await set(
        notificationRef,
        {
            ...notification,
            createdAt:
                serverTimestamp(),
            read:
                false
        }
    );
}


// ============================================================
// LOAD NOTIFICATIONS
// ============================================================

function loadNotifications() {

    if (!currentUser)
        return;


    onValue(
        ref(
            db,
            `notifications/${currentUser.uid}`
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


            notifications.sort(
                (a, b) =>
                    (b.createdAt || 0) -
                    (a.createdAt || 0)
            );


            renderNotifications(
                notifications
            );

        }
    );

}


// ============================================================
// RENDER FULL NOTIFICATIONS
// ============================================================

function renderNotifications(
    notifications
) {

    const list =
        document.getElementById(
            "notificationsList"
        );


    if (!list)
        return;


    list.innerHTML =
        "";


    if (
        notifications.length === 0
    ) {

        list.innerHTML = `

            <div class="notificationsEmpty">

                <div class="notificationsEmptyIcon">
                    🔔
                </div>

                <h3>
                    No notifications yet
                </h3>

                <p>
                    You're all caught up!
                </p>

            </div>

        `;

        return;

    }


    notifications.forEach(
        notification => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "notificationCard";


            if (
                !notification.read
            ) {

                card.classList.add(
                    "unread"
                );

            }


            card.innerHTML = `

                <div class="notificationIcon">

                    ${
                        notification.type ===
                        "group_join_request"

                            ? "👥"

                            : "🔔"
                    }

                </div>


                <div class="notificationBody">

                    <strong>
                        ${escapeHTML(
                            notification.title ||
                            "Notification"
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            notification.message ||
                            ""
                        )}
                    </p>


                    ${
                        notification.type ===
                        "group_join_request"

                            ? `

                                <div class="notificationActions">

                                    <button
                                        class="acceptGroupRequest"
                                    >
                                        ✓ Accept
                                    </button>

                                    <button
                                        class="declineGroupRequest"
                                    >
                                        ✕ Decline
                                    </button>

                                </div>

                              `

                            : ""

                    }

                </div>

            `;


            if (
                notification.type ===
                "group_join_request"
            ) {

                const accept =
                    card.querySelector(
                        ".acceptGroupRequest"
                    );


                const decline =
                    card.querySelector(
                        ".declineGroupRequest"
                    );


                accept.onclick =
                    () => {

                        acceptGroupRequest(
                            notification
                        );

                    };


                decline.onclick =
                    () => {

                        declineGroupRequest(
                            notification
                        );

                    };

            }


            list.appendChild(
                card
            );

        }
    );

}


// ============================================================
// ACCEPT GROUP REQUEST
// ============================================================

async function acceptGroupRequest(
    notification
) {

    if (!currentUser)
        return;


    const groupRef =
        ref(
            db,
            `groups/${notification.groupId}`
        );


    const snapshot =
        await get(groupRef);


    if (
        !snapshot.exists()
    )
        return;


    const group =
        snapshot.val();


    const isAdmin =
        group.ownerId ===
            currentUser.uid ||
        group.members?.[
            currentUser.uid
        ] === "admin";


    if (!isAdmin) {

        alert(
            "Only group admins can accept requests."
        );

        return;

    }


    await update(
        groupRef,
        {

            [`members/${notification.fromUserId}`]:
                "member",

            [`pendingMembers/${notification.fromUserId}`]:
                null

        }
    );


    await createNotification(
        notification.fromUserId,
        {

            type:
                "group_request_accepted",

            title:
                "You're in! 🎉",

            message:
                `Your request to join "${notification.groupName}" was accepted.`,

            groupId:
                notification.groupId,

            groupName:
                notification.groupName,

            action:
                "open_group"

        }
    );


    await remove(
        ref(
            db,
            `notifications/${currentUser.uid}/${notification.id}`
        )
    );


    loadUserGroups();

}


// ============================================================
// DECLINE GROUP REQUEST
// ============================================================

async function declineGroupRequest(
    notification
) {

    if (!currentUser)
        return;


    const groupRef =
        ref(
            db,
            `groups/${notification.groupId}`
        );


    const snapshot =
        await get(groupRef);


    if (
        !snapshot.exists()
    )
        return;


    const group =
        snapshot.val();


    const isAdmin =
        group.ownerId ===
            currentUser.uid ||
        group.members?.[
            currentUser.uid
        ] === "admin";


    if (!isAdmin) {

        alert(
            "Only group admins can decline requests."
        );

        return;

    }


    await remove(
        ref(
            db,
            `groups/${notification.groupId}/pendingMembers/${notification.fromUserId}`
        )
    );


    await remove(
        ref(
            db,
            `notifications/${currentUser.uid}/${notification.id}`
        )
    );

}

// ========================================
// 💎 SHOW/HIDE MODERATOR SYSTEM
// ========================================

function updateModeratorUI() {

    if (!moderatorsTab) return;

    // Everyone starts hidden
    moderatorsTab.style.display = "none";

    if (moderatorManagement) {
        moderatorManagement.style.display = "none";
    }

    if (moderationManagement) {
        moderationManagement.style.display = "none";
    }

    if (awardManagement) {
        awardManagement.style.display = "none";
    }

    if (testAccountManagement) {
        testAccountManagement.style.display = "none";
    }

    // 👤 Normal users get NOTHING
    if (!canCurrentUserModerate()) {
        return;
    }

    // 💎 Mods + Elder can see Moderators
    moderatorsTab.style.display = "flex";

    if (moderationManagement) {
        moderationManagement.style.display = "block";
    }

    // 👑 Elder-only controls
    if (isElderModerator) {

        if (moderatorManagement) {
            moderatorManagement.style.display = "block";
        }

        if (awardManagement) {
            awardManagement.style.display = "block";
        }

        if (testAccountManagement) {
            testAccountManagement.style.display = "block";
        }
    }
}

moderatorsTab?.addEventListener("click", () => {

    // Don't allow normal users to open it
    if (!canCurrentUserModerate()) {
        return;
    }

    // Hide other pages
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });

    // Show Moderators
    if (moderatorsPage) {
        moderatorsPage.style.display = "block";
    }

    updateModeratorUI();
});

function getUserStatus(profile) {
    if (!profile) {
        return "👤 Member";
    }

    if (checkIsElderModerator(profile)) {
        return "💎 Elder Moderator";
    }

    if (checkIsModerator(profile)) {
        return "🛡️ Moderator";
    }

    return "👤 Member";
}

function checkIsElderModerator(profile) {
    return profile?.username === "ron_weasley";
}

function checkIsModerator(profile) {
    return (
        profile?.username === "ron_weasley" ||
        profile?.isModerator === true
    );
}

async function updateModeratorAccess() {
    if (!currentUser) {
        moderatorsNavItem?.classList.add("hidden");
        return;
    }

    const snapshot = await get(
        ref(db, "users/" + currentUser.uid)
    );

    if (!snapshot.exists()) {
        moderatorsNavItem?.classList.add("hidden");
        return;
    }

    const profile = snapshot.val();

    if (checkIsModerator(profile)) {
        moderatorsNavItem?.classList.remove("hidden");
    } else {
        moderatorsNavItem?.classList.add("hidden");
    }

    // ONLY ron_weasley gets moderator management
    if (ownerModeratorManagement) {
        if (checkIsElderModerator(profile)) {
            ownerModeratorManagement.classList.remove("hidden");
        } else {
            ownerModeratorManagement.classList.add("hidden");
        }
    }
}

let moderatorSearchTimeout;

moderatorUserSearch?.addEventListener(
    "input",
    () => {

        clearTimeout(moderatorSearchTimeout);

        moderatorSearchTimeout = setTimeout(
            searchUsersForModeration,
            250
        );
    }
);

async function searchUsersForModeration() {

    if (!currentUser) return;

    const currentSnapshot = await get(
        ref(db, "users/" + currentUser.uid)
    );

    if (!currentSnapshot.exists()) return;

    const currentProfile = currentSnapshot.val();

    // SECURITY CHECK
    if (!checkIsElderModerator(currentProfile)) {
        return;
    }

    const query =
        moderatorUserSearch.value
            .trim()
            .toLowerCase();

    moderatorUserResults.innerHTML = "";

    if (!query) {
        return;
    }

    const usersSnapshot =
        await get(ref(db, "users"));

    if (!usersSnapshot.exists()) {
        return;
    }

    const users = usersSnapshot.val();

    Object.entries(users).forEach(
        ([uid, user]) => {

            const username =
                (user.username || "")
                    .toLowerCase();

            if (!username.includes(query)) {
                return;
            }

            if (uid === currentUser.uid) {
                return;
            }

            const card =
                document.createElement("div");

            card.className =
                "moderatorUserCard";

            card.innerHTML = `
                <div>
                    <strong>
                        ${escapeHTML(
                            user.username ||
                            "CodeOS Member"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            getUserStatus(user)
                        )}
                    </span>
                </div>

                <button
                    type="button"
                    class="moderatorActionButton"
                >
                    ${
                        user.isModerator
                            ? "❌ Remove Moderator"
                            : "🛡️ Make Moderator"
                    }
                </button>
            `;

            const button =
                card.querySelector(
                    ".moderatorActionButton"
                );

            button.addEventListener(
                "click",
                async () => {

                    if (user.isModerator) {

                        await update(
                            ref(
                                db,
                                "users/" + uid
                            ),
                            {
                                isModerator: false
                            }
                        );

                    } else {

                        await update(
                            ref(
                                db,
                                "users/" + uid
                            ),
                            {
                                isModerator: true
                            }
                        );
                    }

                    await searchUsersForModeration();
                    await loadModeratorList();
                }
            );

            moderatorUserResults.appendChild(card);
        }
    );
}

async function loadModeratorList() {

    if (!moderatorList) return;

    const snapshot =
        await get(ref(db, "users"));

    if (!snapshot.exists()) {
        moderatorList.innerHTML =
            "<p>No moderators.</p>";
        return;
    }

    const users =
        snapshot.val();

    moderatorList.innerHTML = "";

    Object.entries(users).forEach(
        ([uid, user]) => {

            if (
                user.username !== "ron_weasley" &&
                user.isModerator !== true
            ) {
                return;
            }

            const card =
                document.createElement("div");

            card.className =
                "moderatorListCard";

            const elder =
                user.username === "ron_weasley";

            card.innerHTML = `
                <div>
                    <strong>
                        ${escapeHTML(
                            user.username ||
                            "Unknown"
                        )}
                    </strong>

                    <span>
                        ${
                            elder
                                ? "💎 Elder Moderator"
                                : "🛡️ Moderator"
                        }
                    </span>
                </div>

                ${
                    elder
                        ? ""
                        : `
                        <button
                            type="button"
                            class="removeModeratorButton"
                        >
                            Remove
                        </button>
                        `
                }
            `;

            if (!elder) {

                card
                    .querySelector(
                        ".removeModeratorButton"
                    )
                    .addEventListener(
                        "click",
                        async () => {

                            await update(
                                ref(
                                    db,
                                    "users/" + uid
                                ),
                                {
                                    isModerator: false
                                }
                            );

                            await loadModeratorList();
                        }
                    );
            }

            moderatorList.appendChild(card);
        }
    );
}

moderatorsNavItem?.addEventListener(
    "click",
    () => {
        loadModeratorList();
    }
);

async function updateModeratorPage(profile) {

    const elder =
        checkIsElderModerator(profile);

    const moderator =
        checkIsModerator(profile);

    if (!elder && !moderator) {
        return;
    }

    moderationTools?.classList.remove("hidden");

    if (elder) {
        elderModeratorTools?.classList.remove("hidden");

        await loadCurrentModerators();

    } else {
        elderModeratorTools?.classList.add("hidden");
    }
}

async function searchModeratorUsers() {

    if (!currentUser) return;

    const mySnapshot = await get(
        ref(db, "users/" + currentUser.uid)
    );

    if (!mySnapshot.exists()) return;

    const myProfile = mySnapshot.val();

    if (!checkIsElderModerator(myProfile)) {
        return;
    }

    const search =
        moderatorUserSearch.value
            .trim()
            .toLowerCase();

    if (!search) {
        moderatorSearchResults.innerHTML =
            "<p>🔎 Enter a username to search.</p>";
        return;
    }

    const usersSnapshot =
        await get(ref(db, "users"));

    if (!usersSnapshot.exists()) {
        moderatorSearchResults.innerHTML =
            "<p>No users found.</p>";
        return;
    }

    const users = usersSnapshot.val();

    const matches = Object.entries(users)
        .filter(([uid, user]) => {

            const username =
                String(user.username || "")
                    .toLowerCase();

            return username.includes(search);
        });

    if (!matches.length) {

        moderatorSearchResults.innerHTML =
            "<p>😕 No matching users.</p>";

        return;
    }

    moderatorSearchResults.innerHTML =
        matches.map(([uid, user]) => {

            const moderator =
                user.isModerator === true;

            const elder =
                user.username === "ron_weasley";

            return `
                <div class="moderatorUserCard">

                    <div>
                        <strong>
                            ${escapeHTML(
                                user.username ||
                                "CodeOS Member"
                            )}
                        </strong>

                        <span>
                            ${
                                elder
                                    ? "💎 Elder Moderator"
                                    : moderator
                                        ? "🛡️ Moderator"
                                        : "👤 Member"
                            }
                        </span>
                    </div>

                    ${
                        elder
                            ? ""
                            : moderator
                                ? `
                                    <button
                                        type="button"
                                        onclick="removeModerator('${uid}')"
                                    >
                                        ❌ Remove Moderator
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        onclick="makeModerator('${uid}')"
                                    >
                                        🛡️ Make Moderator
                                    </button>
                                `
                    }

                </div>
            `;

        }).join("");
}

moderatorSearchBtn?.addEventListener(
    "click",
    searchModeratorUsers
);

moderatorUserSearch?.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            searchModeratorUsers();
        }

    }
);

window.makeModerator = async function(uid) {

    if (!currentUser) return;

    const mySnapshot = await get(
        ref(db, "users/" + currentUser.uid)
    );

    if (!mySnapshot.exists()) return;

    const me = mySnapshot.val();

    if (!checkIsElderModerator(me)) {
        alert("You do not have permission to do this.");
        return;
    }

    await update(
        ref(db, "users/" + uid),
        {
            isModerator: true
        }
    );

    alert("🛡️ User is now a moderator!");

    searchModeratorUsers();
    loadCurrentModerators();
};

window.removeModerator = async function(uid) {

    if (!currentUser) return;

    const mySnapshot = await get(
        ref(db, "users/" + currentUser.uid)
    );

    if (!mySnapshot.exists()) return;

    const me = mySnapshot.val();

    if (!checkIsElderModerator(me)) {
        alert("You do not have permission to do this.");
        return;
    }

    const targetSnapshot =
        await get(ref(db, "users/" + uid));

    if (!targetSnapshot.exists()) return;

    const target =
        targetSnapshot.val();

    if (target.username === "ron_weasley") {
        alert("💎 The Elder Moderator cannot be removed.");
        return;
    }

    await update(
        ref(db, "users/" + uid),
        {
            isModerator: false
        }
    );

    alert("❌ Moderator removed.");

    searchModeratorUsers();
    loadCurrentModerators();
};

async function loadCurrentModerators() {

    if (!currentUser) return;

    const mySnapshot = await get(
        ref(db, "users/" + currentUser.uid)
    );

    if (!mySnapshot.exists()) return;

    const me = mySnapshot.val();

    if (!checkIsElderModerator(me)) return;

    const usersSnapshot =
        await get(ref(db, "users"));

    if (!usersSnapshot.exists()) return;

    const users =
        usersSnapshot.val();

    const moderators =
        Object.entries(users)
            .filter(([uid, user]) =>
                user.username === "ron_weasley" ||
                user.isModerator === true
            );

    currentModeratorsList.innerHTML =
        moderators.map(([uid, user]) => {

            const elder =
                user.username === "ron_weasley";

            return `
                <div class="currentModeratorCard">

                    <div>
                        <strong>
                            ${escapeHTML(
                                user.username ||
                                "CodeOS Member"
                            )}
                        </strong>

                        <span>
                            ${
                                elder
                                    ? "💎 Elder Moderator"
                                    : "🛡️ Moderator"
                            }
                        </span>
                    </div>

                </div>
            `;

        }).join("");
}

// ============================================================
// 💎 MODERATOR TOOLS
// ============================================================

let moderatorToolModal = null;

// ------------------------------------------------------------
// MOD TOOL MODAL
// ------------------------------------------------------------

function createModeratorToolModal() {
    if (document.getElementById("moderatorToolModal")) {
        return;
    }

    moderatorToolModal = document.createElement("div");
    moderatorToolModal.id = "moderatorToolModal";
    moderatorToolModal.className = "modal hidden";

    moderatorToolModal.innerHTML = `
        <div class="modalBox moderatorToolModalBox">
            <button
                type="button"
                class="closeModal"
                id="closeModeratorToolModal"
            >
                ✕
            </button>

            <div id="moderatorToolModalContent"></div>
        </div>
    `;

    document.body.appendChild(moderatorToolModal);

    document
        .getElementById("closeModeratorToolModal")
        ?.addEventListener("click", closeModeratorToolModal);

    moderatorToolModal.addEventListener("click", event => {
        if (event.target === moderatorToolModal) {
            closeModeratorToolModal();
        }
    });
}

function openModeratorToolModal(title, content) {
    createModeratorToolModal();

    const contentBox =
        document.getElementById(
            "moderatorToolModalContent"
        );

    contentBox.innerHTML = `
        <div class="moderatorModalHeader">
            <div class="moderatorModalDiamond">💎</div>
            <div>
                <h2>${escapeHTML(title)}</h2>
                <p>CodeOS Moderator Tools</p>
            </div>
        </div>

        ${content}
    `;

    moderatorToolModal.classList.remove("hidden");
}

function closeModeratorToolModal() {
    if (moderatorToolModal) {
        moderatorToolModal.classList.add("hidden");
    }
}

// ------------------------------------------------------------
// MODERATOR PERMISSION CHECK
// ------------------------------------------------------------

async function moderatorToolsCheck() {
    if (!currentUser) {
        alert("🔐 Please sign in first.");
        return false;
    }

    const snapshot = await get(
        ref(db, `users/${currentUser.uid}`)
    );

    if (!snapshot.exists()) {
        alert("❌ Your account profile could not be found.");
        return false;
    }

    const profile = snapshot.val();

    if (!checkIsModerator(profile)) {
        alert("🚫 You do not have moderator permissions.");
        return false;
    }

    return true;
}

// ============================================================
// 🚫 BAN ACCOUNTS
// ============================================================

async function openBanAccountsTool() {
    if (!(await moderatorToolsCheck())) return;

    openModeratorToolModal(
        "Ban Accounts",
        `
        <div class="moderatorToolIntro danger">
            <span>🚫</span>
            <p>
                Restrict accounts that violate CodeOS
                Community rules.
            </p>
        </div>

        <input
            id="banUserSearch"
            class="moderatorToolSearch"
            type="search"
            placeholder="🔎 Search username..."
        />

        <div
            id="banUsersResults"
            class="moderatorToolResults"
        >
            Search for a user to begin.
        </div>
        `
    );

    document
        .getElementById("banUserSearch")
        ?.addEventListener(
            "input",
            loadBanUsers
        );
}

async function loadBanUsers() {
    const input =
        document.getElementById(
            "banUserSearch"
        );

    const container =
        document.getElementById(
            "banUsersResults"
        );

    if (!input || !container) return;

    const query =
        input.value.trim().toLowerCase();

    if (!query) {
        container.innerHTML =
            "🔎 Search for a username to begin.";
        return;
    }

    const snapshot =
        await get(ref(db, "users"));

    if (!snapshot.exists()) {
        container.innerHTML =
            "No users found.";
        return;
    }

    container.innerHTML = "";

    snapshot.forEach(child => {
        const uid = child.key;
        const user = child.val();

        const username =
            String(
                user.username || ""
            ).toLowerCase();

        if (!username.includes(query)) {
            return;
        }

        if (uid === currentUser.uid) {
            return;
        }

        const banned =
            user.isBanned === true;

        const card =
            document.createElement("div");

        card.className =
            "moderatorUserCard";

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
                        banned
                            ? "🚫 Banned"
                            : "🟢 Active"
                    }
                </span>
            </div>

            <button
                type="button"
                class="${
                    banned
                        ? "moderatorActionButton"
                        : "moderatorDangerButton"
                }"
            >
                ${
                    banned
                        ? "Unban"
                        : "🚫 Ban"
                }
            </button>
        `;

        card
            .querySelector("button")
            .addEventListener(
                "click",
                async () => {
                    if (!banned) {
                        const confirmed =
                            confirm(
                                `Ban @${user.username}?`
                            );

                        if (!confirmed) {
                            return;
                        }
                    }

                    await update(
                        ref(
                            db,
                            `users/${uid}`
                        ),
                        {
                            isBanned:
                                !banned,
                            bannedAt:
                                !banned
                                    ? serverTimestamp()
                                    : null,
                            bannedBy:
                                !banned
                                    ? currentUser.uid
                                    : null
                        }
                    );

                    await loadBanUsers();
                }
            );

        container.appendChild(card);
    });
}

// ============================================================
// 👤 ACCOUNT VIEW / IMPERSONATION
// ============================================================

async function openImpersonateTool() {
    if (!(await moderatorToolsCheck())) return;

    openModeratorToolModal(
        "Account Preview",
        `
        <div class="moderatorToolIntro">
            <span>👤</span>
            <p>
                View a community member's public profile
                as a moderator.
            </p>
        </div>

        <input
            id="impersonateSearch"
            class="moderatorToolSearch"
            type="search"
            placeholder="🔎 Search username..."
        />

        <div
            id="impersonateResults"
            class="moderatorToolResults"
        >
            Search for a user.
        </div>
        `
    );

    document
        .getElementById(
            "impersonateSearch"
        )
        ?.addEventListener(
            "input",
            loadImpersonateUsers
        );
}

async function loadImpersonateUsers() {
    const input =
        document.getElementById(
            "impersonateSearch"
        );

    const container =
        document.getElementById(
            "impersonateResults"
        );

    if (!input || !container) return;

    const query =
        input.value.trim().toLowerCase();

    if (!query) {
        container.innerHTML =
            "🔎 Search for a user.";
        return;
    }

    const snapshot =
        await get(ref(db, "users"));

    if (!snapshot.exists()) {
        container.innerHTML =
            "No users found.";
        return;
    }

    container.innerHTML = "";

    snapshot.forEach(child => {
        const uid = child.key;
        const user = child.val();

        const username =
            String(
                user.username || ""
            ).toLowerCase();

        if (!username.includes(query)) {
            return;
        }

        const card =
            document.createElement("div");

        card.className =
            "moderatorUserCard";

        card.innerHTML = `
            <div>
                <strong>
                    ${escapeHTML(
                        user.username ||
                        "CodeOS Member"
                    )}
                </strong>

                <span>
                    👤 Community Member
                </span>
            </div>

            <button
                type="button"
                class="moderatorActionButton"
            >
                Open Profile
            </button>
        `;

        card
            .querySelector("button")
            .addEventListener(
                "click",
                async () => {
                    closeModeratorToolModal();

                    await openPublicProfile(uid);
                }
            );

        container.appendChild(card);
    });
}

// ============================================================
// 🧪 TEST ACCOUNTS
// ============================================================

async function openTestAccountsTool() {
    if (!(await moderatorToolsCheck())) return;

    openModeratorToolModal(
        "Test Accounts",
        `
        <div class="moderatorToolIntro">
            <span>🧪</span>
            <p>
                Create temporary community test profiles.
            </p>
        </div>

        <div class="testAccountForm">

            <label>
                Username
            </label>

            <input
                id="testAccountUsername"
                type="text"
                maxlength="30"
                placeholder="test_user_01"
            />

            <label>
                Display Name
            </label>

            <input
                id="testAccountDisplayName"
                type="text"
                maxlength="50"
                placeholder="CodeOS Test User"
            />

            <button
                id="createTestAccountBtn"
                type="button"
                class="moderatorPrimaryButton"
            >
                🧪 Create Test Account
            </button>

        </div>

        <div
            id="testAccountStatus"
            class="moderatorStatus"
        ></div>

        <div
            id="testAccountsList"
            class="moderatorToolResults"
        ></div>
        `
    );

    document
        .getElementById(
            "createTestAccountBtn"
        )
        ?.addEventListener(
            "click",
            createTestAccountProfile
        );

    await loadTestAccounts();
}

async function createTestAccountProfile() {
    if (!(await moderatorToolsCheck())) return;

    const username =
        document
            .getElementById(
                "testAccountUsername"
            )
            ?.value
            .trim();

    const displayName =
        document
            .getElementById(
                "testAccountDisplayName"
            )
            ?.value
            .trim();

    const status =
        document.getElementById(
            "testAccountStatus"
        );

    if (!username) {
        if (status) {
            status.innerText =
                "⚠️ Enter a username.";
        }
        return;
    }

    const testRef =
        push(ref(db, "testAccounts"));

    await set(testRef, {
        username,
        displayName:
            displayName ||
            "CodeOS Test User",
        createdBy:
            currentUser.uid,
        createdAt:
            serverTimestamp(),
        active: true
    });

    if (status) {
        status.innerText =
            "✅ Test account created!";
    }

    document.getElementById(
        "testAccountUsername"
    ).value = "";

    document.getElementById(
        "testAccountDisplayName"
    ).value = "";

    await loadTestAccounts();
}

async function loadTestAccounts() {
    const container =
        document.getElementById(
            "testAccountsList"
        );

    if (!container) return;

    const snapshot =
        await get(
            ref(db, "testAccounts")
        );

    if (!snapshot.exists()) {
        container.innerHTML = `
            <div class="moderatorEmpty">
                🧪 No test accounts yet.
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h3>🧪 Existing Test Accounts</h3>
    `;

    snapshot.forEach(child => {
        const account = child.val();

        const card =
            document.createElement("div");

        card.className =
            "moderatorUserCard";

        card.innerHTML = `
            <div>
                <strong>
                    ${escapeHTML(
                        account.username ||
                        "Test Account"
                    )}
                </strong>

                <span>
                    ${
                        account.active
                            ? "🟢 Active"
                            : "⚪ Disabled"
                    }
                </span>
            </div>

            <button
                type="button"
                class="moderatorDangerButton"
            >
                Disable
            </button>
        `;

        card
            .querySelector("button")
            .addEventListener(
                "click",
                async () => {
                    await update(
                        ref(
                            db,
                            `testAccounts/${child.key}`
                        ),
                        {
                            active: false
                        }
                    );

                    await loadTestAccounts();
                }
            );

        container.appendChild(card);
    });
}

// ============================================================
// 🔗 CONNECT MODERATOR PAGE BUTTONS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById(
                "moderatorFeaturedProjectsBtn"
            )
            ?.addEventListener(
                "click",
                openFeaturedProjectManager
            );

        document
            .getElementById(
                "moderatorRateProjectsBtn"
            )
            ?.addEventListener(
                "click",
                openProjectRatingManager
            );

        document
            .getElementById(
                "moderatorBanAccountsBtn"
            )
            ?.addEventListener(
                "click",
                openBanAccountsTool
            );

        document
            .getElementById(
                "moderatorImpersonateBtn"
            )
            ?.addEventListener(
                "click",
                openImpersonateTool
            );

        document
            .getElementById(
                "moderatorTestAccountsBtn"
            )
            ?.addEventListener(
                "click",
                openTestAccountsTool
            );

    }
);

// ============================================================
// 💎 PROJECT MODERATION SYSTEM
// ============================================================

const PROJECT_MODERATION_PATH = "projectModeration";

function isCurrentUserElderModerator() {
    return !!currentUser &&
        currentUserProfile?.username === "ron_weasley";
}

// ------------------------------------------------------------
// GET CURRENT USER PROFILE
// ------------------------------------------------------------

let currentUserProfile = null;

async function refreshCurrentUserProfile() {
    if (!currentUser) {
        currentUserProfile = null;
        return;
    }

    const snapshot = await get(
        ref(db, `users/${currentUser.uid}`)
    );

    currentUserProfile =
        snapshot.exists()
            ? snapshot.val()
            : null;
}

// ------------------------------------------------------------
// SEND PROJECT TO ELDER MODERATOR
// ------------------------------------------------------------

async function sendProjectToModerator(projectId, project) {
    if (!currentUser) {
        loginModal.classList.remove("hidden");
        return;
    }

    const profileSnapshot = await get(
        ref(db, `users/${currentUser.uid}`)
    );

    const profile =
        profileSnapshot.exists()
            ? profileSnapshot.val()
            : {};

    const moderationRef = ref(
        db,
        `${PROJECT_MODERATION_PATH}/${projectId}`
    );

    const existing = await get(moderationRef);

    if (existing.exists()) {
        const data = existing.val();

        if (data.sent === true) {
            alert("📨 This project has already been sent to moderation.");
            return;
        }
    }

    await set(moderationRef, {
        sent: true,
        sentBy: currentUser.uid,
        sentByUsername:
            profile.username ||
            currentUser.displayName ||
            "CodeOS Member",
        sentAt: serverTimestamp(),

        featured: false,
        awarded: false,

        rating: null,
        staffPick: false,

        projectId: projectId
    });

    alert(
        `📨 "${project?.name || "Project"}" has been sent to the Elder Moderator!`
    );
}

async function openFeaturedProjectManager() {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can manage featured projects."
        );
        return;
    }

    const postsSnapshot =
        await get(ref(db, "posts"));

    if (!postsSnapshot.exists()) {
        showProjectModerationPopup(
            "Featured Projects",
            `<div class="moderationEmpty">
                🚀 No projects have been sent for review yet.
            </div>`
        );
        return;
    }

    const projects = [];

    postsSnapshot.forEach(child => {
        const post = child.val();

        if (
            post.type !== "project" ||
            !post.project
        ) {
            return;
        }

        projects.push({
            id: child.key,
            ...post
        });
    });

    const moderationSnapshot =
        await get(
            ref(db, PROJECT_MODERATION_PATH)
        );

    const moderation =
        moderationSnapshot.exists()
            ? moderationSnapshot.val()
            : {};

    const pendingProjects =
        projects.filter(project => {
            const mod =
                moderation[project.id];

            return (
                mod &&
                mod.sent === true &&
                mod.featured !== true
            );
        });

    if (!pendingProjects.length) {
        showProjectModerationPopup(
            "Featured Projects",
            `<div class="moderationEmpty">
                ✨ No projects are waiting for review.
            </div>`
        );
        return;
    }

    const html = pendingProjects
        .map(project => {
            const p = project.project || {};

            return `
                <div class="moderationProjectCard">
                    <div class="moderationProjectIcon">
                        🚀
                    </div>

                    <div class="moderationProjectInfo">
                        <h3>
                            ${escapeHTML(
                                p.name ||
                                project.title ||
                                "Untitled Project"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                p.description ||
                                project.content ||
                                "No description."
                            )}
                        </p>

                        <span>
                            Sent by
                            ${escapeHTML(
                                project.authorName ||
                                "CodeOS Member"
                            )}
                        </span>
                    </div>

                    <button
                        class="featureProjectBtn"
                        type="button"
                        data-project-id="${project.id}"
                    >
                        ⭐ Feature
                    </button>
                </div>
            `;
        })
        .join("");

    showProjectModerationPopup(
        "Featured Projects",
        html
    );

    document
        .querySelectorAll(".featureProjectBtn")
        .forEach(button => {
            button.onclick = async () => {
                await featureProject(
                    button.dataset.projectId
                );
            };
        });
}

async function featureProject(projectId) {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can feature projects."
        );
        return;
    }

    const postSnapshot =
        await get(
            ref(
                db,
                `posts/${projectId}`
            )
        );

    if (!postSnapshot.exists()) {
        alert("❌ Project post not found.");
        return;
    }

    const post =
        postSnapshot.val();

    const moderationRef =
        ref(
            db,
            `${PROJECT_MODERATION_PATH}/${projectId}`
        );

    const existingSnapshot =
        await get(moderationRef);

    const existing =
        existingSnapshot.exists()
            ? existingSnapshot.val()
            : {};

    await update(
        moderationRef,
        {
            featured: true,
            awarded: true,
            featuredBy:
                currentUser.uid,
            featuredAt:
                serverTimestamp()
        }
    );

    if (
        existing.featured !== true &&
        post.authorId
    ) {
        const claimExpiresAt =
            Date.now() +
            BADGE_CLAIM_DURATION;

        await createNotification(
            post.authorId,
            {
                type:
                    "project_featured",
                title:
                    "🌟 Your project was featured!",
                message:
                    `"${post.project?.name || "Your project"}" has been featured by the Elder Moderator!`,
                projectId,
                badgeIcon:
                    "🌟",
                badgeName:
                    "Featured Creator",
                claimExpiresAt,
                action:
                    "claim_badge"
            }
        );
    }

    alert(
        "⭐ Project featured! It now appears in Awarded."
    );

    closeProjectModerationPopup();
}

async function openProjectRatingManager() {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can rate projects."
        );
        return;
    }

    const postsSnapshot =
        await get(ref(db, "posts"));

    const moderationSnapshot =
        await get(
            ref(db, PROJECT_MODERATION_PATH)
        );

    if (!postsSnapshot.exists()) {
        showProjectModerationPopup(
            "Rate Projects",
            `<div class="moderationEmpty">
                🚀 No projects found.
            </div>`
        );
        return;
    }

    const moderation =
        moderationSnapshot.exists()
            ? moderationSnapshot.val()
            : {};

    const projects = [];

    postsSnapshot.forEach(child => {
        const post = child.val();

        if (
            post.type !== "project" ||
            !post.project
        ) {
            return;
        }

        const mod =
            moderation[child.key];

        if (
            !mod ||
            mod.featured !== true
        ) {
            return;
        }

        projects.push({
            id: child.key,
            ...post,
            moderation: mod
        });
    });

    if (!projects.length) {
        showProjectModerationPopup(
            "Rate Projects",
            `<div class="moderationEmpty">
                ⭐ No featured projects are ready to rate.
            </div>`
        );
        return;
    }

    const html = projects
        .map(project => {
            const p = project.project || {};
            const rating =
                project.moderation.rating;

            return `
                <div class="ratingProjectCard">
                    <div class="ratingProjectTop">
                        <div class="moderationProjectIcon">
                            🚀
                        </div>

                        <div>
                            <h3>
                                ${escapeHTML(
                                    p.name ||
                                    project.title ||
                                    "Untitled Project"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    p.description ||
                                    "No description."
                                )}
                            </p>
                        </div>
                    </div>

                    <div class="projectRatingArea">
                        <span>
                            ${
                                rating !== null &&
                                rating !== undefined
                                    ? `Current rating: ${rating}/5`
                                    : "Not rated yet"
                            }
                        </span>

                        <div class="ratingStars">
                            ${[1,2,3,4,5]
                                .map(star => `
                                    <button
                                        type="button"
                                        class="ratingStarBtn ${
                                            rating >= star
                                                ? "selected"
                                                : ""
                                        }"
                                        data-project-id="${project.id}"
                                        data-rating="${star}"
                                    >
                                        ★
                                    </button>
                                `)
                                .join("")}
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");

    showProjectModerationPopup(
        "Rate Projects",
        html
    );

    document
        .querySelectorAll(".ratingStarBtn")
        .forEach(button => {
            button.onclick = async () => {
                await rateProject(
                    button.dataset.projectId,
                    Number(button.dataset.rating)
                );
            };
        });
}

async function rateProject(
    projectId,
    rating
) {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can rate projects."
        );
        return;
    }

    if (
        !Number.isInteger(rating) ||
        rating < 0 ||
        rating > 5
    ) {
        return;
    }

    const postSnapshot =
        await get(
            ref(
                db,
                `posts/${projectId}`
            )
        );

    if (!postSnapshot.exists()) {
        alert("❌ Project not found.");
        return;
    }

    const post =
        postSnapshot.val();

    const moderationRef =
        ref(
            db,
            `${PROJECT_MODERATION_PATH}/${projectId}`
        );

    const oldSnapshot =
        await get(moderationRef);

    const oldData =
        oldSnapshot.exists()
            ? oldSnapshot.val()
            : {};

    const wasStaffPick =
        oldData.staffPick === true;

    const isStaffPick =
        rating >= 4;

    await update(
        moderationRef,
        {
            rating,
            staffPick:
                isStaffPick,
            ratedBy:
                currentUser.uid,
            ratedAt:
                serverTimestamp()
        }
    );

    if (
        isStaffPick &&
        !wasStaffPick &&
        post.authorId
    ) {
        const claimExpiresAt =
            Date.now() +
            BADGE_CLAIM_DURATION;

        await createNotification(
            post.authorId,
            {
                type:
                    "staff_pick",
                title:
                    "👑 Your project became a Staff Pick!",
                message:
                    `"${post.project?.name || "Your project"}" received ${rating}/5 from the Elder Moderator and is now a Staff Pick!`,
                projectId,
                rating,
                badgeIcon:
                    "👑",
                badgeName:
                    "Staff Pick Creator",
                claimExpiresAt,
                action:
                    "claim_badge"
            }
        );
    }

    alert(
        isStaffPick
            ? `⭐ ${rating}/5 — Project added to Staff Picks!`
            : `⭐ ${rating}/5 — Rating saved.`
    );

    closeProjectModerationPopup();
}

function showProjectModerationPopup(
    title,
    content
) {
    closeProjectModerationPopup();

    const overlay =
        document.createElement("div");

    overlay.id =
        "projectModerationPopup";

    overlay.className =
        "projectModerationOverlay";

    overlay.innerHTML = `
        <div class="projectModerationModal">

            <button
                type="button"
                class="projectModerationClose"
                id="closeProjectModeration"
            >
                ✕
            </button>

            <div class="projectModerationHeader">
                <div class="projectModerationHeaderIcon">
                    💎
                </div>

                <div>
                    <h2>
                        ${escapeHTML(title)}
                    </h2>

                    <p>
                        CodeOS Project Moderation
                    </p>
                </div>
            </div>

            <div class="projectModerationContent">
                ${content}
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    document
        .getElementById(
            "closeProjectModeration"
        )
        .onclick =
            closeProjectModerationPopup;

    overlay.onclick = event => {
        if (
            event.target === overlay
        ) {
            closeProjectModerationPopup();
        }
    };
}

function closeProjectModerationPopup() {
    document
        .getElementById(
            "projectModerationPopup"
        )
        ?.remove();
}

document
    .querySelectorAll("#projectsPage .filter")
    .forEach(button => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll("#projectsPage .filter")
                .forEach(btn => {
                    btn.classList.remove("active");
                });

            button.classList.add("active");

            activeFilter =
                button.dataset.filter || "all";

            renderProjectDiscovery();
        });
    });

    // ============================================================
// ⚙️ CODEOS SETTINGS SYSTEM
// ============================================================

const CODEOS_SETTINGS_KEY = "codeos-settings";

const DEFAULT_CODEOS_SETTINGS = {
    theme: "dark",
    accentColour: "#7c5cff",
    uiDensity: "comfortable",
    animations: true,
    notifications: true
};

function getCodeOSSettings() {
    try {
        const saved =
            JSON.parse(
                localStorage.getItem(
                    CODEOS_SETTINGS_KEY
                )
            ) || {};

        return {
            ...DEFAULT_CODEOS_SETTINGS,
            ...saved
        };
    } catch (error) {
        console.error(
            "Failed to load CodeOS settings:",
            error
        );

        return {
            ...DEFAULT_CODEOS_SETTINGS
        };
    }
}

function saveCodeOSSettings(settings) {
    localStorage.setItem(
        CODEOS_SETTINGS_KEY,
        JSON.stringify(settings)
    );
}

function updateCodeOSSetting(key, value) {
    const settings =
        getCodeOSSettings();

    settings[key] = value;

    saveCodeOSSettings(settings);

    applyCodeOSSettings();
}

// ============================================================
// APPLY SETTINGS
// ============================================================

function applyCodeOSSettings() {
    const settings =
        getCodeOSSettings();

    const root =
        document.documentElement;

    // --------------------------------------------------------
    // THEME
    // --------------------------------------------------------

    root.dataset.theme =
        settings.theme;

    document.body.classList.remove(
        "theme-dark",
        "theme-light",
        "theme-system"
    );

    document.body.classList.add(
        `theme-${settings.theme}`
    );

    // --------------------------------------------------------
    // ACCENT COLOUR
    // --------------------------------------------------------

    root.style.setProperty(
        "--accent-color",
        settings.accentColour
    );

    // Extra aliases so the setting works with different
    // parts of CodeOS that may use different variable names.
    root.style.setProperty(
        "--accent",
        settings.accentColour
    );

    root.style.setProperty(
        "--primary-color",
        settings.accentColour
    );

    // --------------------------------------------------------
    // UI DENSITY
    // --------------------------------------------------------

    document.body.classList.remove(
        "ui-density-compact",
        "ui-density-comfortable",
        "ui-density-spacious"
    );

    document.body.classList.add(
        `ui-density-${settings.uiDensity}`
    );

    // --------------------------------------------------------
    // ANIMATIONS
    // --------------------------------------------------------

    document.body.classList.toggle(
        "no-animations",
        settings.animations === false
    );
}

// ============================================================
// LOAD SETTINGS INTO CONTROLS
// ============================================================

function loadSettingsIntoUI() {
    const settings =
        getCodeOSSettings();

    const theme =
        document.getElementById(
            "themeSetting"
        );

    const accent =
        document.getElementById(
            "accentColourSetting"
        );

    const density =
        document.getElementById(
            "uiDensitySetting"
        );

    const animations =
        document.getElementById(
            "animationsSetting"
        );

    const notifications =
        document.getElementById(
            "notificationsSetting"
        );

    if (theme) {
        theme.value =
            settings.theme;
    }

    if (accent) {
        accent.value =
            settings.accentColour;
    }

    if (density) {
        density.value =
            settings.uiDensity;
    }

    if (animations) {
        animations.checked =
            settings.animations;
    }

    if (notifications) {
        notifications.checked =
            settings.notifications;
    }

    applyCodeOSSettings();
}

// ============================================================
// CONNECT SETTINGS CONTROLS
// ============================================================

function setupCodeOSSettings() {
    const theme =
        document.getElementById(
            "themeSetting"
        );

    const accent =
        document.getElementById(
            "accentColourSetting"
        );

    const density =
        document.getElementById(
            "uiDensitySetting"
        );

    const animations =
        document.getElementById(
            "animationsSetting"
        );

    const notifications =
        document.getElementById(
            "notificationsSetting"
        );

    theme?.addEventListener(
        "change",
        () => {
            updateCodeOSSetting(
                "theme",
                theme.value
            );
        }
    );

    accent?.addEventListener(
        "input",
        () => {
            updateCodeOSSetting(
                "accentColour",
                accent.value
            );
        }
    );

    density?.addEventListener(
        "change",
        () => {
            updateCodeOSSetting(
                "uiDensity",
                density.value
            );
        }
    );

    animations?.addEventListener(
        "change",
        () => {
            updateCodeOSSetting(
                "animations",
                animations.checked
            );
        }
    );

    notifications?.addEventListener(
        "change",
        () => {
            updateCodeOSSetting(
                "notifications",
                notifications.checked
            );
        }
    );

    loadSettingsIntoUI();
}

// ============================================================
// 🔕 NOTIFICATION PERMISSION
// ============================================================

function areCodeOSNotificationsAllowed() {
    const settings =
        getCodeOSSettings();

    return settings.notifications !== false;
}

// Modify your existing createNotification()
// by adding this check at the beginning.

// ============================================================
// 🚫 BLOCKED USERS
// ============================================================

async function openBlockedUsersManager() {
    if (!currentUser) {
        loginModal?.classList.remove(
            "hidden"
        );
        return;
    }

    const overlay =
        document.createElement("div");

    overlay.className =
        "settingsModalOverlay";

    overlay.id =
        "blockedUsersModal";

    overlay.innerHTML = `
        <div class="settingsModal">
            <button
                type="button"
                class="settingsModalClose"
                id="closeBlockedUsersModal"
            >
                ✕
            </button>

            <div class="settingsModalHeader">
                <span>🚫</span>
                <div>
                    <h2>Blocked Users</h2>
                    <p>
                        Manage users you've blocked.
                    </p>
                </div>
            </div>

            <div
                id="blockedUsersList"
                class="blockedUsersList"
            >
                Loading...
            </div>

            <div class="blockedUserSearch">
                <input
                    id="blockedUserSearchInput"
                    type="search"
                    placeholder="🔎 Search a user to block..."
                    maxlength="50"
                >

                <div
                    id="blockedUserSearchResults"
                    class="blockedUserSearchResults"
                ></div>
            </div>
        </div>
    `;

    document.body.appendChild(
        overlay
    );

    document
        .getElementById(
            "closeBlockedUsersModal"
        )
        ?.addEventListener(
            "click",
            () => overlay.remove()
        );

    overlay.addEventListener(
        "click",
        event => {
            if (
                event.target === overlay
            ) {
                overlay.remove();
            }
        }
    );

    await loadBlockedUsers();

    document
        .getElementById(
            "blockedUserSearchInput"
        )
        ?.addEventListener(
            "input",
            searchUsersToBlock
        );
}

// ============================================================
// LOAD BLOCKED USERS
// ============================================================

async function loadBlockedUsers() {
    const container =
        document.getElementById(
            "blockedUsersList"
        );

    if (!container || !currentUser)
        return;

    const snapshot =
        await get(
            ref(
                db,
                `users/${currentUser.uid}/blockedUsers`
            )
        );

    container.innerHTML = `
        <h3>🚫 Blocked Users</h3>
    `;

    if (!snapshot.exists()) {
        container.innerHTML += `
            <div class="blockedUsersEmpty">
                You haven't blocked anyone.
            </div>
        `;

        return;
    }

    const blocked =
        snapshot.val();

    for (
        const uid of Object.keys(blocked)
    ) {
        const userSnapshot =
            await get(
                ref(
                    db,
                    `users/${uid}`
                )
            );

        const user =
            userSnapshot.exists()
                ? userSnapshot.val()
                : {};

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "blockedUserCard";

        card.innerHTML = `
            <div>
                <strong>
                    ${escapeHTML(
                        user.username ||
                        "CodeOS Member"
                    )}
                </strong>

                <span>
                    🚫 Blocked
                </span>
            </div>

            <button
                type="button"
                class="unblockUserBtn"
            >
                Unblock
            </button>
        `;

        card
            .querySelector(
                ".unblockUserBtn"
            )
            .addEventListener(
                "click",
                async () => {
                    await remove(
                        ref(
                            db,
                            `users/${currentUser.uid}/blockedUsers/${uid}`
                        )
                    );

                    await loadBlockedUsers();
                }
            );

        container.appendChild(
            card
        );
    }
}

// ============================================================
// SEARCH USERS TO BLOCK
// ============================================================

async function searchUsersToBlock() {
    const input =
        document.getElementById(
            "blockedUserSearchInput"
        );

    const container =
        document.getElementById(
            "blockedUserSearchResults"
        );

    if (
        !input ||
        !container ||
        !currentUser
    ) {
        return;
    }

    const query =
        input.value
            .trim()
            .toLowerCase();

    container.innerHTML = "";

    if (!query) {
        return;
    }

    const snapshot =
        await get(
            ref(db, "users")
        );

    if (!snapshot.exists()) {
        return;
    }

    snapshot.forEach(
        child => {
            const uid =
                child.key;

            const user =
                child.val();

            const username =
                String(
                    user.username || ""
                ).toLowerCase();

            if (
                uid ===
                currentUser.uid
            ) {
                return;
            }

            if (
                !username.includes(
                    query
                )
            ) {
                return;
            }

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "blockedSearchCard";

            card.innerHTML = `
                <div>
                    <strong>
                        ${escapeHTML(
                            user.username ||
                            "CodeOS Member"
                        )}
                    </strong>
                </div>

                <button
                    type="button"
                    class="blockUserBtn"
                >
                    🚫 Block
                </button>
            `;

            card
                .querySelector(
                    ".blockUserBtn"
                )
                .addEventListener(
                    "click",
                    async () => {
                        await set(
                            ref(
                                db,
                                `users/${currentUser.uid}/blockedUsers/${uid}`
                            ),
                            true
                        );

                        input.value = "";

                        container.innerHTML = "";

                        await loadBlockedUsers();
                    }
                );

            container.appendChild(
                card
            );
        }
    );
}

// ============================================================
// ♻️ RESET SETTINGS
// ============================================================

function resetAllCodeOSSettings() {
    const confirmed =
        confirm(
            "♻️ Reset all CodeOS settings to their defaults?"
        );

    if (!confirmed) {
        return;
    }

    saveCodeOSSettings({
        ...DEFAULT_CODEOS_SETTINGS
    });

    loadSettingsIntoUI();

    alert(
        "✅ CodeOS settings have been reset."
    );
}

// ============================================================
// 🗑️ DELETE ACCOUNT
// ============================================================

async function deleteCodeOSAccount() {
    if (!currentUser) {
        loginModal?.classList.remove(
            "hidden"
        );
        return;
    }

    const firstConfirm =
        confirm(
            "⚠️ Are you sure you want to delete your CodeOS account?"
        );

    if (!firstConfirm) {
        return;
    }

    const secondConfirm =
        confirm(
            "This permanently deletes your account. This cannot be undone. Continue?"
        );

    if (!secondConfirm) {
        return;
    }

    const uid =
        currentUser.uid;

    try {
        // Remove the user's profile data.
        await remove(
            ref(
                db,
                `users/${uid}`
            )
        );

        // Remove local settings.
        localStorage.removeItem(
            CODEOS_SETTINGS_KEY
        );

        // Delete Firebase Authentication account.
        await deleteUser(
            currentUser
        );

        alert(
            "🗑️ Your CodeOS account has been deleted."
        );

        window.location.reload();

    } catch (error) {
        console.error(
            "Account deletion error:",
            error
        );

        if (
            error.code ===
            "auth/requires-recent-login"
        ) {
            alert(
                "🔐 For security, please sign in again and then try deleting your account."
            );
        } else {
            alert(
                "❌ Couldn't delete your account: " +
                error.message
            );
        }
    }
}

// ============================================================
// ⚙️ SETTINGS BUTTON CONNECTIONS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupCodeOSSettings();

        document
            .getElementById(
                "blockedUsersBtn"
            )
            ?.addEventListener(
                "click",
                openBlockedUsersManager
            );

        document
            .getElementById(
                "resetSettingsBtn"
            )
            ?.addEventListener(
                "click",
                resetAllCodeOSSettings
            );

        document
            .getElementById(
                "deleteAccountBtn"
            )
            ?.addEventListener(
                "click",
                deleteCodeOSAccount
            );
    }
);  

// ============================================================
// 🏆 CHALLENGE SYSTEM
// ============================================================

const CHALLENGES_PATH = "challenges";
const COMMUNITY_CHALLENGES_PATH = "communityChallenges";

const CHALLENGE_SUBMISSIONS_PATH =
    "challengeSubmissions";

const BADGE_CLAIM_DURATION =
    2 * 24 * 60 * 60 * 1000;

let currentChallengeId = null;

// ============================================================
// CHALLENGE MODERATOR CHECK
// ============================================================

function canCreateOfficialChallenge() {
    if (!currentUser || !currentUserProfile) {
        return false;
    }

    return checkIsModerator(currentUserProfile);
}

function isChallengeElderModerator() {
    return (
        currentUser &&
        currentUserProfile?.username === "ron_weasley"
    );
}

// ============================================================
// SHOW MODERATOR BUTTON
// ============================================================

async function updateChallengeModeratorUI() {
    const button =
        document.getElementById(
            "addOfficialChallengeBtn"
        );

    if (!button) return;

    await refreshCurrentUserProfile();

    if (canCreateOfficialChallenge()) {
        button.classList.remove("hidden");
    } else {
        button.classList.add("hidden");
    }
}

// ============================================================
// BADGE LIST
// ============================================================

const challengeBadges = [
    // Animals
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
    "🦈",

    // Food
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
    "🍿",

    // 💀 Gen Alpha chaos
    "💀",
    "🥀",
    "😭",
    "👾",
    "😎"
];

// ============================================================
// CREATE OFFICIAL CHALLENGE POPUP
// ============================================================

function openCreateOfficialChallengePopup() {

    if (!canCreateOfficialChallenge()) {
        alert(
            "🚫 Only moderators can create official challenges."
        );
        return;
    }

    const badgeOptions =
        challengeBadges
            .map(
                badge => `
                    <button
                        type="button"
                        class="challengeBadgeOption"
                        data-badge="${badge}"
                    >
                        ${badge}
                    </button>
                `
            )
            .join("");

    const overlay =
        document.createElement("div");

    overlay.id =
        "officialChallengePopup";

    overlay.className =
        "challengeModalOverlay";

    overlay.innerHTML = `
        <div class="challengeModal">

            <button
                type="button"
                class="challengeModalClose"
                id="closeOfficialChallengePopup"
            >
                ✕
            </button>

            <div class="challengeModalHeader">
                <div class="challengeModalIcon">
                    🏆
                </div>

                <div>
                    <h2>
                        Create Official Challenge
                    </h2>

                    <p>
                        Create a competition for the whole community.
                    </p>
                </div>
            </div>

            <div class="challengeForm">

                <label>
                    Challenge Name
                </label>

                <input
                    id="officialChallengeName"
                    type="text"
                    maxlength="80"
                    placeholder="e.g. Build the Coolest Calculator"
                >

                <label>
                    Description
                </label>

                <textarea
                    id="officialChallengeDescription"
                    maxlength="1000"
                    placeholder="Explain what participants have to create..."
                ></textarea>

                <div class="challengeDateGrid">

                    <div>
                        <label>
                            Starts
                        </label>

                        <input
                            id="officialChallengeStart"
                            type="datetime-local"
                        >
                    </div>

                    <div>
                        <label>
                            Ends
                        </label>

                        <input
                            id="officialChallengeEnd"
                            type="datetime-local"
                        >
                    </div>

                </div>

                <label>
                    Prize Badge
                </label>

                <div
                    id="challengeBadgePicker"
                    class="challengeBadgePicker"
                >
                    ${badgeOptions}
                </div>

                <div
                    id="selectedChallengeBadge"
                    class="selectedChallengeBadge"
                >
                    No badge selected
                </div>

                <button
                    id="createOfficialChallengeBtn"
                    type="button"
                    class="challengeCreateButton"
                >
                    🏆 Create Challenge
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    document
        .getElementById(
            "closeOfficialChallengePopup"
        )
        ?.addEventListener(
            "click",
            () => overlay.remove()
        );

    overlay.addEventListener(
        "click",
        event => {
            if (event.target === overlay) {
                overlay.remove();
            }
        }
    );

    let selectedBadge = null;

    overlay
        .querySelectorAll(
            ".challengeBadgeOption"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    overlay
                        .querySelectorAll(
                            ".challengeBadgeOption"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "selected"
                                )
                        );

                    button.classList.add(
                        "selected"
                    );

                    selectedBadge =
                        button.dataset.badge;

                    document
                        .getElementById(
                            "selectedChallengeBadge"
                        )
                        .innerText =
                            `Prize: ${selectedBadge}`;
                }
            );

        });

    document
        .getElementById(
            "createOfficialChallengeBtn"
        )
        ?.addEventListener(
            "click",
            () => {
                createOfficialChallenge(
                    selectedBadge
                );
            }
        );
}

// ============================================================
// CREATE OFFICIAL CHALLENGE
// ============================================================

async function createOfficialChallenge(
    selectedBadge
) {

    if (!canCreateOfficialChallenge()) {
        alert(
            "🚫 You do not have permission."
        );
        return;
    }

    const name =
        document
            .getElementById(
                "officialChallengeName"
            )
            ?.value
            .trim();

    const description =
        document
            .getElementById(
                "officialChallengeDescription"
            )
            ?.value
            .trim();

    const start =
        document
            .getElementById(
                "officialChallengeStart"
            )
            ?.value;

    const end =
        document
            .getElementById(
                "officialChallengeEnd"
            )
            ?.value;

    if (!name) {
        alert(
            "⚠️ Enter a challenge name."
        );
        return;
    }

    if (!description) {
        alert(
            "⚠️ Enter a description."
        );
        return;
    }

    if (!start || !end) {
        alert(
            "⚠️ Choose both dates."
        );
        return;
    }

    const startTime =
        new Date(start).getTime();

    const endTime =
        new Date(end).getTime();

    if (
        !Number.isFinite(startTime) ||
        !Number.isFinite(endTime)
    ) {
        alert(
            "⚠️ Invalid dates."
        );
        return;
    }

    if (endTime <= startTime) {
        alert(
            "⚠️ The ending date must be after the starting date."
        );
        return;
    }

    if (!selectedBadge) {
        alert(
            "🏅 Choose a prize badge."
        );
        return;
    }

    try {

        const challengeRef =
            push(
                ref(
                    db,
                    CHALLENGES_PATH
                )
            );

        await set(
            challengeRef,
            {
                name,
                description,

                startAt:
                    startTime,

                endAt:
                    endTime,

                prizeBadge:
                    selectedBadge,

                createdBy:
                    currentUser.uid,

                createdByUsername:
                    currentUserProfile?.username ||
                    "Moderator",

                createdAt:
                    serverTimestamp(),

                official:
                    true,

                active:
                    true
            }
        );

        alert(
            `🏆 "${name}" created!`
        );

        document
            .getElementById(
                "officialChallengePopup"
            )
            ?.remove();

        loadOfficialChallenges();

    } catch (error) {

        console.error(
            "Create challenge error:",
            error
        );

        alert(
            "❌ Couldn't create the challenge: " +
            error.message
        );
    }
}

// ============================================================
// LOAD OFFICIAL CHALLENGES
// ============================================================

function loadOfficialChallenges() {

    const container =
        document.getElementById(
            "officialChallengesList"
        );

    if (!container) return;

    onValue(
        ref(
            db,
            CHALLENGES_PATH
        ),
        snapshot => {

            container.innerHTML = "";

            if (!snapshot.exists()) {

                container.innerHTML = `
                    <div class="challengeEmpty">
                        <div>🏆</div>
                        <h3>
                            No official challenges yet
                        </h3>
                        <p>
                            Check back soon for the next competition!
                        </p>
                    </div>
                `;

                return;
            }

            const challenges = [];

            snapshot.forEach(
                child => {

                    challenges.push({
                        id:
                            child.key,
                        ...child.val()
                    });

                }
            );

            challenges.sort(
                (a, b) =>
                    (a.startAt || 0) -
                    (b.startAt || 0)
            );

            challenges.forEach(
                challenge => {

                    renderOfficialChallengeCard(
                        challenge,
                        container
                    );

                }
            );
        }
    );
}

// ============================================================
// CHALLENGE CARD
// ============================================================

function renderOfficialChallengeCard(
    challenge,
    container
) {

    const now =
        Date.now();

    let status =
        "UPCOMING";

    if (
        now >= challenge.startAt &&
        now <= challenge.endAt
    ) {
        status = "LIVE";
    }

    if (
        now > challenge.endAt
    ) {
        status = "ENDED";
    }

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "officialChallengeCard";

    card.dataset.challengeId =
        challenge.id;

    card.innerHTML = `

        <div class="challengeCardGlow"></div>

        <div class="challengeCardTop">

            <span class="challengeOfficialBadge">
                🏆 OFFICIAL
            </span>

            <span class="
                challengeStatus
                challengeStatus-${status.toLowerCase()}
            ">
                ${
                    status === "LIVE"
                        ? "🔴 LIVE"
                        : status === "UPCOMING"
                            ? "🕐 UPCOMING"
                            : "🏁 ENDED"
                }
            </span>

        </div>

        <div class="challengeCardMain">

            <div class="challengePrize">
                ${escapeHTML(
                    challenge.prizeBadge ||
                    "🏅"
                )}
            </div>

            <div class="challengeCardInfo">

                <h3>
                    ${escapeHTML(
                        challenge.name ||
                        "Untitled Challenge"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        challenge.description ||
                        ""
                    )}
                </p>

                <div class="challengeDates">

                    <span>
                        📅
                        ${formatChallengeDate(
                            challenge.startAt
                        )}
                    </span>

                    <span>
                        → 
                        ${formatChallengeDate(
                            challenge.endAt
                        )}
                    </span>

                </div>

                <div
                    class="challengeCountdown"
                    data-countdown-end="${challenge.endAt}"
                    data-challenge-status="${status}"
                >
                    ${getChallengeCountdownText(
                        challenge
                    )}
                </div>

            </div>

        </div>

        <div class="challengeCardBottom">

            <span>
                🏅 Prize:
                ${escapeHTML(
                    challenge.prizeBadge ||
                    "Badge"
                )}
            </span>

            ${
                status === "LIVE"
                    ? `
                        <button
                            type="button"
                            class="submitChallengeBtn"
                            data-challenge-id="${challenge.id}"
                        >
                            🚀 Submit Project
                        </button>
                    `
                    : status === "ENDED"
                        ? `
                            <span class="challengeEndedText">
                                Challenge ended
                            </span>
                        `
                        : `
                            <span class="challengeWaitingText">
                                Get ready...
                            </span>
                        `
            }

        </div>

    `;

    container.appendChild(card);

    card
        .querySelector(
            ".submitChallengeBtn"
        )
        ?.addEventListener(
            "click",
            () => {
                openChallengeSubmission(
                    challenge
                );
            }
        );
}

// ============================================================
// DATE HELPERS
// ============================================================

function formatChallengeDate(
    timestamp
) {

    if (!timestamp) {
        return "Unknown";
    }

    return new Date(
        timestamp
    ).toLocaleString(
        [],
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}

function getChallengeCountdownText(
    challenge
) {

    const now =
        Date.now();

    if (
        now < challenge.startAt
    ) {
        return (
            "Starts in " +
            formatChallengeCountdown(
                challenge.startAt - now
            )
        );
    }

    if (
        now <= challenge.endAt
    ) {
        return (
            "Ends in " +
            formatChallengeCountdown(
                challenge.endAt - now
            )
        );
    }

    return "🏁 Challenge ended";
}

function formatChallengeCountdown(
    milliseconds
) {

    const totalSeconds =
        Math.max(
            0,
            Math.floor(
                milliseconds / 1000
            )
        );

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    const hours =
        Math.floor(
            (totalSeconds % 86400) /
            3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) /
            60
        );

    const seconds =
        totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}

// ============================================================
// LIVE COUNTDOWN
// ============================================================

setInterval(
    () => {

        document
            .querySelectorAll(
                ".challengeCountdown"
            )
            .forEach(
                element => {

                    const card =
                        element.closest(
                            ".officialChallengeCard"
                        );

                    if (!card) return;

                    const challengeId =
                        card.dataset.challengeId;

                    if (!challengeId) return;

                    get(
                        ref(
                            db,
                            `${CHALLENGES_PATH}/${challengeId}`
                        )
                    ).then(
                        snapshot => {

                            if (
                                !snapshot.exists()
                            ) {
                                return;
                            }

                            element.innerText =
                                getChallengeCountdownText(
                                    {
                                        id:
                                            challengeId,
                                        ...snapshot.val()
                                    }
                                );

                        }
                    );

                }
            );

    },
    1000
);

// ============================================================
// CHALLENGE TABS
// ============================================================

document
    .querySelectorAll(
        ".challengeTab"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".challengeTab"
                        )
                        .forEach(
                            tab =>
                                tab.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    const tab =
                        button.dataset.challengeTab;

                    document
                        .getElementById(
                            "officialChallengesList"
                        )
                        ?.classList.toggle(
                            "hidden",
                            tab !== "official"
                        );

                    document
                        .getElementById(
                            "communityChallengesList"
                        )
                        ?.classList.toggle(
                            "hidden",
                            tab !== "community"
                        );

                }
            );

        }
    );

// ============================================================
// CONNECT OFFICIAL CHALLENGE BUTTON
// ============================================================

document
    .getElementById(
        "addOfficialChallengeBtn"
    )
    ?.addEventListener(
        "click",
        openCreateOfficialChallengePopup
    );

// ============================================================
// INITIALIZE CHALLENGES
// ============================================================

async function initializeChallengeSystem() {
    loadOfficialChallenges();
}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeChallengeSystem
    );

} else {

    initializeChallengeSystem();

}

// ============================================================
// 🏆 OFFICIAL CHALLENGE BUTTON
// ============================================================

function updateOfficialChallengeButton() {
    const button = document.getElementById(
        "addOfficialChallengeBtn"
    );

    if (!button) {
        console.log(
            "❌ Official Challenge button not found in DOM"
        );
        return;
    }

    console.log("👤 Current user:", currentUser);
console.log("📋 Current profile:", currentUserProfile);
console.log("🛡️ Moderator check:", checkIsModerator(currentUserProfile));

    const allowed =
        canCreateOfficialChallenge();

    console.log(
        "🏆 Can current user create official challenge?",
        allowed
    );

    button.style.display =
        allowed ? "flex" : "none";
}

// ============================================================
// 🚀 OFFICIAL CHALLENGE SUBMISSIONS
// ============================================================

async function openChallengeSubmission(challenge) {
    if (!currentUser) {
        loginModal?.classList.remove("hidden");
        return;
    }

    const now = Date.now();

    if (
        now < challenge.startAt ||
        now > challenge.endAt
    ) {
        alert("🚫 Project submissions are only open while the challenge is LIVE.");
        return;
    }

    const postsSnapshot =
        await get(ref(db, "posts"));

    const myProjects = [];

    if (postsSnapshot.exists()) {
        postsSnapshot.forEach(child => {
            const post = child.val();

            if (
                post.authorId === currentUser.uid &&
                post.type === "project" &&
                post.project
            ) {
                myProjects.push({
                    id: child.key,
                    ...post
                });
            }
        });
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "challengeSubmissionPopup";

    overlay.className =
        "challengeModalOverlay";

    overlay.innerHTML = `
        <div class="challengeModal">
            <button
                type="button"
                class="challengeModalClose"
                id="closeChallengeSubmission"
            >
                ✕
            </button>

            <div class="challengeModalHeader">
                <div class="challengeModalIcon">
                    🚀
                </div>

                <div>
                    <h2>
                        Submit to ${escapeHTML(
                            challenge.name ||
                            "Challenge"
                        )}
                    </h2>

                    <p>
                        Choose one of your community projects.
                    </p>
                </div>
            </div>

            <div
                id="challengeSubmissionProjects"
                class="challengeSubmissionProjects"
            >
                ${
                    myProjects.length
                        ? myProjects.map(project => `
                            <button
                                type="button"
                                class="challengeProjectChoice"
                                data-project-id="${project.id}"
                            >
                                <span class="challengeProjectChoiceIcon">
                                    🚀
                                </span>

                                <span>
                                    <strong>
                                        ${escapeHTML(
                                            project.project?.name ||
                                            project.title ||
                                            "Untitled Project"
                                        )}
                                    </strong>

                                    <small>
                                        ${escapeHTML(
                                            project.project?.description ||
                                            project.content ||
                                            ""
                                        )}
                                    </small>
                                </span>
                            </button>
                        `).join("")
                        : `
                            <div class="challengeEmpty">
                                <div>🚀</div>
                                <h3>No projects yet</h3>
                                <p>
                                    Create a project post first.
                                </p>
                            </div>
                        `
                }
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document
        .getElementById("closeChallengeSubmission")
        ?.addEventListener(
            "click",
            () => overlay.remove()
        );

    overlay.addEventListener(
        "click",
        event => {
            if (event.target === overlay) {
                overlay.remove();
            }
        }
    );

    overlay
        .querySelectorAll(
            ".challengeProjectChoice"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    await submitProjectToChallenge(
                        challenge,
                        button.dataset.projectId
                    );

                    overlay.remove();
                }
            );
        });
}

async function submitProjectToChallenge(
    challenge,
    projectPostId
) {
    if (!currentUser) return;

    const challengeRef =
        ref(
            db,
            `${CHALLENGES_PATH}/${challenge.id}`
        );

    const challengeSnapshot =
        await get(challengeRef);

    if (!challengeSnapshot.exists()) {
        alert("❌ This challenge no longer exists.");
        return;
    }

    const liveChallenge =
        challengeSnapshot.val();

    const now = Date.now();

    if (
        now < liveChallenge.startAt ||
        now > liveChallenge.endAt
    ) {
        alert("🚫 This challenge is no longer accepting submissions.");
        return;
    }

    const submissionsRef =
        ref(
            db,
            `${CHALLENGES_PATH}/${challenge.id}/submissions`
        );

    const submissionsSnapshot =
        await get(submissionsRef);

    let alreadySubmitted = false;

    if (submissionsSnapshot.exists()) {
        submissionsSnapshot.forEach(child => {
            const submission = child.val();

            if (
                submission.userId === currentUser.uid
            ) {
                alreadySubmitted = true;
            }
        });
    }

    if (alreadySubmitted) {
        alert(
            "⚠️ You've already submitted a project to this challenge."
        );
        return;
    }

    const postSnapshot =
        await get(
            ref(
                db,
                `posts/${projectPostId}`
            )
        );

    if (!postSnapshot.exists()) {
        alert("❌ Project not found.");
        return;
    }

    const post =
        postSnapshot.val();

    if (
        post.authorId !== currentUser.uid ||
        post.type !== "project"
    ) {
        alert("🚫 You can only submit your own project.");
        return;
    }

    const submissionRef =
        push(submissionsRef);

    const submissionCount =
        submissionsSnapshot.exists()
            ? Object.keys(
                submissionsSnapshot.val()
            ).length
            : 0;

    const rollNumber =
        String(
            submissionCount + 1
        ).padStart(3, "0");

    await set(
        submissionRef,
        {
            rollNumber,
            projectPostId,
            projectName:
                post.project?.name ||
                post.title ||
                "Untitled Project",
            projectDescription:
                post.project?.description ||
                post.content ||
                "",
            projectImage:
                post.project?.image ||
                "",
            userId:
                currentUser.uid,
            username:
                post.authorName ||
                currentUser.displayName ||
                "CodeOS Member",
            submittedAt:
                serverTimestamp(),
            winner:
                false
        }
    );

    alert(
        `🚀 Project submitted!\n\nYour Roll No. is ${rollNumber}.`
    );
}

// ============================================================
// 👑 CHOOSE OFFICIAL CHALLENGE WINNER
// ============================================================

async function openChallengeWinnerTool() {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can choose challenge winners."
        );
        return;
    }

    const snapshot =
        await get(
            ref(db, CHALLENGES_PATH)
        );

    const challenges = [];

    if (snapshot.exists()) {
        snapshot.forEach(child => {
            const challenge = child.val();

            challenges.push({
                id: child.key,
                ...challenge
            });
        });
    }

    const ended =
        challenges.filter(
            challenge =>
                challenge.endAt &&
                Date.now() > challenge.endAt &&
                !challenge.winnerSubmissionId
        );

    openModeratorToolModal(
        "Choose Challenge Winner",
        `
        <div class="moderatorToolIntro">
            <span>👑</span>
            <p>
                Choose the winner of an ended official challenge.
            </p>
        </div>

        <div
            id="challengeWinnerChallengeList"
            class="moderatorToolResults"
        >
            ${
                ended.length
                    ? ended.map(challenge => `
                        <button
                            type="button"
                            class="moderatorUserCard challengeWinnerChallenge"
                            data-challenge-id="${challenge.id}"
                        >
                            <div>
                                <strong>
                                    🏆 ${escapeHTML(
                                        challenge.name ||
                                        "Untitled Challenge"
                                    )}
                                </strong>

                                <span>
                                    Prize:
                                    ${escapeHTML(
                                        challenge.prizeBadge ||
                                        "🏅"
                                    )}
                                </span>
                            </div>

                            <span>
                                Choose →
                            </span>
                        </button>
                    `).join("")
                    : `
                        <div class="moderatorEmpty">
                            🏁 No ended challenges need a winner.
                        </div>
                    `
            }
        </div>
        `
    );

    document
        .querySelectorAll(
            ".challengeWinnerChallenge"
        )
        .forEach(button => {
            button.onclick = () => {
                loadChallengeWinnerSubmissions(
                    button.dataset.challengeId
                );
            };
        });
}

async function loadChallengeWinnerSubmissions(
    challengeId
) {
    const snapshot =
        await get(
            ref(
                db,
                `${CHALLENGES_PATH}/${challengeId}`
            )
        );

    if (!snapshot.exists()) {
        alert("❌ Challenge not found.");
        return;
    }

    const challenge =
        snapshot.val();

    const submissionsSnapshot =
        await get(
            ref(
                db,
                `${CHALLENGES_PATH}/${challengeId}/submissions`
            )
        );

    const submissions = [];

    if (submissionsSnapshot.exists()) {
        submissionsSnapshot.forEach(child => {
            submissions.push({
                id: child.key,
                ...child.val()
            });
        });
    }

    const html = `
        <div class="moderatorToolIntro">
            <span>👑</span>
            <p>
                Select the winning submission for
                <strong>
                    ${escapeHTML(
                        challenge.name ||
                        "Challenge"
                    )}
                </strong>.
            </p>
        </div>

        <input
            id="challengeWinnerSearch"
            class="moderatorToolSearch"
            type="search"
            placeholder="🔎 Search project or Roll No..."
        />

        <div
            id="challengeWinnerResults"
            class="moderatorToolResults"
        ></div>
    `;

    openModeratorToolModal(
        "Choose Challenge Winner",
        html
    );

    const render =
        () => {
            const query =
                document
                    .getElementById(
                        "challengeWinnerSearch"
                    )
                    ?.value
                    ?.trim()
                    .toLowerCase() || "";

            const container =
                document.getElementById(
                    "challengeWinnerResults"
                );

            if (!container) return;

            const filtered =
                submissions.filter(
                    submission => {
                        const name =
                            String(
                                submission.projectName ||
                                ""
                            ).toLowerCase();

                        const roll =
                            String(
                                submission.rollNumber ||
                                ""
                            ).toLowerCase();

                        return (
                            !query ||
                            name.includes(query) ||
                            roll.includes(query)
                        );
                    }
                );

            if (!filtered.length) {
                container.innerHTML = `
                    <div class="moderatorEmpty">
                        🔎 No matching submissions.
                    </div>
                `;
                return;
            }

            container.innerHTML =
                filtered.map(
                    submission => `
                        <div
                            class="moderatorProjectCard"
                        >
                            <div
                                class="moderatorProjectIcon"
                            >
                                ${
                                    submission.winner
                                        ? "👑"
                                        : "🚀"
                                }
                            </div>

                            <div
                                class="moderatorProjectInfo"
                            >
                                <strong>
                                    ${escapeHTML(
                                        submission.projectName ||
                                        "Untitled Project"
                                    )}
                                </strong>

                                <span>
                                    Roll No.
                                    <strong>
                                        ${escapeHTML(
                                            submission.rollNumber
                                        )}
                                    </strong>
                                    ·
                                    ${escapeHTML(
                                        submission.username ||
                                        "CodeOS Member"
                                    )}
                                </span>
                            </div>

                            <button
                                type="button"
                                class="moderatorPrimaryButton"
                                data-winner-id="${submission.id}"
                            >
                                👑 Choose Winner
                            </button>
                        </div>
                    `
                ).join("");

            container
                .querySelectorAll(
                    "[data-winner-id]"
                )
                .forEach(button => {
                    button.onclick = async () => {
                        await chooseChallengeWinner(
                            challengeId,
                            button.dataset.winnerId
                        );
                    };
                });
        };

    render();

    document
        .getElementById(
            "challengeWinnerSearch"
        )
        ?.addEventListener(
            "input",
            render
        );
}

async function chooseChallengeWinner(
    challengeId,
    submissionId
) {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can choose the winner."
        );
        return;
    }

    const submissionRef =
        ref(
            db,
            `${CHALLENGES_PATH}/${challengeId}/submissions/${submissionId}`
        );

    const submissionSnapshot =
        await get(submissionRef);

    if (!submissionSnapshot.exists()) {
        alert("❌ Submission not found.");
        return;
    }

    const submission =
        submissionSnapshot.val();

    const challengeSnapshot =
        await get(
            ref(
                db,
                `${CHALLENGES_PATH}/${challengeId}`
            )
        );

    if (!challengeSnapshot.exists()) {
        return;
    }

    const challenge =
        challengeSnapshot.val();

    const confirmed =
        confirm(
            `👑 Make Roll No. ${submission.rollNumber} — ${submission.projectName} — the winner?`
        );

    if (!confirmed) return;

    const submissionsSnapshot =
        await get(
            ref(
                db,
                `${CHALLENGES_PATH}/${challengeId}/submissions`
            )
        );

    const updates = {};

    if (submissionsSnapshot.exists()) {
        submissionsSnapshot.forEach(child => {
            updates[
                `${CHALLENGES_PATH}/${challengeId}/submissions/${child.key}/winner`
            ] =
                child.key === submissionId;
        });
    }

    updates[
        `${CHALLENGES_PATH}/${challengeId}/winnerSubmissionId`
    ] = submissionId;

    updates[
        `${CHALLENGES_PATH}/${challengeId}/winnerUserId`
    ] = submission.userId;

    updates[
        `${CHALLENGES_PATH}/${challengeId}/winnerRollNumber`
    ] = submission.rollNumber;

    updates[
        `${CHALLENGES_PATH}/${challengeId}/winnerChosenAt`
    ] = serverTimestamp();

    await update(
        ref(db),
        updates
    );

    const claimExpiresAt =
        Date.now() +
        BADGE_CLAIM_DURATION;

    await createNotification(
        submission.userId,
        {
            type:
                "official_challenge_winner",
            title:
                "🏆 YOU WON AN OFFICIAL CHALLENGE!",
            message:
                `You won "${challenge.name}" with Roll No. ${submission.rollNumber}!`,
            challengeId,
            challengeName:
                challenge.name,
            badgeIcon:
                challenge.prizeBadge ||
                "🏅",
            badgeName:
                challenge.name ||
                "Challenge Winner",
            claimExpiresAt,
            action:
                "claim_badge"
        }
    );

    alert(
        `👑 ${submission.projectName} is the winner!`
    );

    closeModeratorToolModal();
}

// ============================================================
// 🏅 BADGE CLAIM SYSTEM
// ============================================================

async function claimNotificationBadge(
    notification
) {
    if (!currentUser) return;

    const expiresAt =
        Number(
            notification.claimExpiresAt
        );

    if (
        !Number.isFinite(expiresAt) ||
        Date.now() > expiresAt
    ) {
        alert(
            "⌛ This badge claim has expired."
        );
        return;
    }

    const badgeId =
        push(
            ref(
                db,
                `users/${currentUser.uid}/badges`
            )
        ).key;

    await set(
        ref(
            db,
            `users/${currentUser.uid}/badges/${badgeId}`
        ),
        {
            icon:
                notification.badgeIcon ||
                "🏅",
            name:
                notification.badgeName ||
                "CodeOS Badge",
            earnedAt:
                serverTimestamp(),
            sourceNotificationId:
                notification.id
        }
    );

    await update(
        ref(
            db,
            `notifications/${currentUser.uid}/${notification.id}`
        ),
        {
            badgeClaimed: true,
            claimedAt:
                serverTimestamp()
        }
    );

    alert(
        `🏅 Badge earned: ${notification.badgeIcon || "🏅"} ${notification.badgeName || "CodeOS Badge"}!`
    );

    loadMyProfile();
}

setInterval(() => {
    document
        .querySelectorAll(
            ".badgeClaimCountdown"
        )
        .forEach(element => {
            const expires =
                Number(
                    element.dataset.expires
                );

            const remaining =
                expires - Date.now();

            if (
                !Number.isFinite(expires) ||
                remaining <= 0
            ) {
                element.innerText =
                    "⌛ Claim expired";

                const card =
                    element.closest(
                        ".notificationCard"
                    );

                card
                    ?.querySelector(
                        ".earnBadgeBtn"
                    )
                    ?.remove();

                return;
            }

            element.innerText =
                `⏳ ${formatChallengeCountdown(
                    remaining
                )} left to claim`;
        });
}, 1000);

document
    .getElementById(
        "moderatorSendNotificationBtn"
    )
    ?.addEventListener(
        "click",
        openSendNotificationTool
    );

    async function openSendNotificationTool() {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can send direct notifications."
        );
        return;
    }

    openModeratorToolModal(
        "Send Notification",
        `
        <div class="directNotificationComposer">

            <div class="mailField">
                <label>To</label>

                <input
                    id="directNotificationTo"
                    type="search"
                    placeholder="Search username..."
                    autocomplete="off"
                />
            </div>

            <div
                id="directNotificationUsers"
                class="directNotificationUsers"
            ></div>

            <div class="mailField">
                <label>Subject</label>

                <input
                    id="directNotificationSubject"
                    type="text"
                    maxlength="120"
                    placeholder="Notification subject..."
                />
            </div>

            <div class="mailField">
                <label>Message</label>

                <textarea
                    id="directNotificationMessage"
                    maxlength="2000"
                    placeholder="Write your message..."
                ></textarea>
            </div>

            <button
                id="sendDirectNotificationBtn"
                type="button"
                class="moderatorPrimaryButton"
            >
                📤 Send Notification
            </button>

            <div
                id="directNotificationStatus"
                class="moderatorStatus"
            ></div>

        </div>
        `
    );

    document
        .getElementById(
            "directNotificationTo"
        )
        ?.addEventListener(
            "input",
            searchNotificationRecipients
        );

    document
        .getElementById(
            "sendDirectNotificationBtn"
        )
        ?.addEventListener(
            "click",
            sendDirectNotification
        );
}

let selectedNotificationRecipient =
    null;

async function searchNotificationRecipients() {
    const input =
        document.getElementById(
            "directNotificationTo"
        );

    const container =
        document.getElementById(
            "directNotificationUsers"
        );

    if (!input || !container) return;

    const query =
        input.value
            .trim()
            .toLowerCase();

    selectedNotificationRecipient =
        null;

    container.innerHTML = "";

    if (!query) return;

    const snapshot =
        await get(
            ref(db, "users")
        );

    if (!snapshot.exists()) return;

    snapshot.forEach(child => {
        const user =
            child.val();

        const username =
            String(
                user.username || ""
            ).toLowerCase();

        if (
            !username.includes(query)
        ) {
            return;
        }

        const card =
            document.createElement("button");

        card.type = "button";
        card.className =
            "directNotificationUser";

        card.innerHTML = `
            <strong>
                ${escapeHTML(
                    user.username ||
                    "CodeOS Member"
                )}
            </strong>
        `;

        card.onclick = () => {
            selectedNotificationRecipient =
                child.key;

            input.value =
                user.username ||
                "";

            container.innerHTML = `
                <div class="selectedNotificationRecipient">
                    ✓ Sending to
                    <strong>
                        ${escapeHTML(
                            user.username ||
                            "CodeOS Member"
                        )}
                    </strong>
                </div>
            `;
        };

        container.appendChild(card);
    });
}

async function sendDirectNotification() {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        return;
    }

    const subject =
        document
            .getElementById(
                "directNotificationSubject"
            )
            ?.value
            .trim();

    const message =
        document
            .getElementById(
                "directNotificationMessage"
            )
            ?.value
            .trim();

    const status =
        document.getElementById(
            "directNotificationStatus"
        );

    if (!selectedNotificationRecipient) {
        if (status) {
            status.innerText =
                "⚠️ Choose a recipient.";
        }
        return;
    }

    if (!subject) {
        if (status) {
            status.innerText =
                "⚠️ Enter a subject.";
        }
        return;
    }

    if (!message) {
        if (status) {
            status.innerText =
                "⚠️ Enter a message.";
        }
        return;
    }

    await createNotification(
        selectedNotificationRecipient,
        {
            type:
                "direct_message",
            title:
                subject,
            message,
            fromUserId:
                currentUser.uid,
            fromUsername:
                currentUserProfile?.username ||
                "ron_weasley"
        }
    );

    if (status) {
        status.innerText =
            "✅ Notification sent!";
    }

    document
        .getElementById(
            "directNotificationSubject"
        ).value = "";

    document
        .getElementById(
            "directNotificationMessage"
        ).value = "";
}

async function deleteChallenge(
    challengeId,
    community = false
) {
    if (!currentUser) return;

    await refreshCurrentUserProfile();

    if (!isCurrentUserElderModerator()) {
        alert(
            "💎 Only the Elder Moderator can delete challenges."
        );
        return;
    }

    const path =
        community
            ? COMMUNITY_CHALLENGES_PATH
            : CHALLENGES_PATH;

    const confirmed =
        confirm(
            "🗑️ Delete this challenge permanently?"
        );

    if (!confirmed) return;

    await remove(
        ref(
            db,
            `${path}/${challengeId}`
        )
    );

    alert(
        "🗑️ Challenge deleted."
    );

    if (community) {
        loadCommunityChallenges();
    } else {
        loadOfficialChallenges();
    }
}

document
    .getElementById(
        "moderatorChooseChallengeWinnerBtn"
    )
    ?.addEventListener(
        "click",
        openChallengeWinnerTool
    );


window.codeosOpenCommunityProject =
    openCommunityProject;

window.codeosOpenProfile =
    openProfile;