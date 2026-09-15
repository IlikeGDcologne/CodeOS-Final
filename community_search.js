import {
    db
} from "./firebase.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

const communitySearch =
    document.getElementById("communitySearch");

if (communitySearch) {

    const style =
        document.createElement("style");

    style.textContent = `

        .communitySearchResults {
            position: fixed;
            top: 68px;
            right: 24px;
            width: min(470px, calc(100vw - 48px));
            max-height: 520px;
            overflow-y: auto;
            z-index: 99999;

            background:
                linear-gradient(
                    145deg,
                    #161727,
                    #10111b
                );

            border:
                1px solid
                rgba(255,255,255,.1);

            border-radius: 18px;

            box-shadow:
                0 25px 70px
                rgba(0,0,0,.5);

            padding: 8px;

            display: none;
        }

        .communitySearchResult {

            width: 100%;
            border: 0;

            background:
                rgba(255,255,255,.035);

            color: inherit;

            border-radius: 13px;

            padding: 13px;

            text-align: left;

            display: flex;
            gap: 12px;
            align-items: center;

            cursor: pointer;

            margin-bottom: 6px;

        }

        .communitySearchResult:hover {

            background:
                rgba(124,92,255,.15);

        }

        .communitySearchResultIcon {

            width: 40px;
            height: 40px;

            border-radius: 12px;

            display: grid;
            place-items: center;

            background:
                rgba(124,92,255,.16);

            font-size: 20px;

            flex: none;

        }

        .communitySearchResultMain {
            min-width: 0;
            flex: 1;
        }

        .communitySearchResultTitle {
            font-weight: 800;
        }

        .communitySearchResultMeta {

            color: #9498b0;
            font-size: 12px;
            margin-top: 3px;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

        }

        .communitySearchSection {

            color: #858aa2;
            font-size: 11px;
            font-weight: 800;

            letter-spacing: .08em;

            padding: 10px 9px 7px;

        }

        .communitySearchEmpty {

            padding: 28px;
            text-align: center;
            color: #9398ae;

        }

    `;

    document.head.appendChild(style);


    const resultBox =
        document.createElement("div");

    resultBox.className =
        "communitySearchResults";

    document.body.appendChild(resultBox);


    let searchTimer = null;


    function escapeSearchHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    }


    function closeSearch() {

        resultBox.style.display =
            "none";

    }


    async function searchCommunity(query) {

        query =
            query.trim().toLowerCase();

        resultBox.innerHTML = "";

        if (!query) {

            closeSearch();
            return;

        }

        resultBox.style.display =
            "block";


        const postsSnapshot =
            await get(ref(db, "posts"));

        const usersSnapshot =
            await get(ref(db, "users"));

        const extensionsSnapshot =
            await get(ref(db, "extensions"));


        const results = {

            projects: [],
            posts: [],
            users: [],
            extensions: []

        };


        /* =========================================
           PROJECTS + POSTS
        ========================================= */

        if (postsSnapshot.exists()) {

            postsSnapshot.forEach(child => {

                const post = {

                    id: child.key,
                    ...child.val()

                };

                const project =
                    post.project || {};

                const title =
                    project.name ||
                    post.title ||
                    "";

                const description =
                    project.description ||
                    post.content ||
                    post.description ||
                    "";

                const author =
                    post.authorName ||
                    "CodeOS Member";


                const searchable =
                    [
                        title,
                        description,
                        author,
                        post.type
                    ]
                        .join(" ")
                        .toLowerCase();


                if (
                    !searchable.includes(
                        query
                    )
                ) {
                    return;
                }


                if (
                    post.type ===
                    "project"
                ) {

                    results.projects.push(
                        post
                    );

                } else {

                    results.posts.push(
                        post
                    );

                }

            });

        }


        /* =========================================
           USERS
        ========================================= */

        if (usersSnapshot.exists()) {

            usersSnapshot.forEach(child => {

                const user =
                    child.val();

                const username =
                    String(
                        user.username || ""
                    );


                if (
                    username
                        .toLowerCase()
                        .includes(query)
                ) {

                    results.users.push({

                        id: child.key,
                        ...user

                    });

                }

            });

        }


        /* =========================================
           EXTENSIONS
        ========================================= */

        if (
            extensionsSnapshot.exists()
        ) {

            extensionsSnapshot.forEach(
                child => {

                    const extension =
                        child.val();

                    const searchable =
                        [
                            extension.name,
                            extension.description,
                            extension.category,
                            extension.authorName
                        ]
                            .join(" ")
                            .toLowerCase();


                    if (
                        searchable.includes(
                            query
                        )
                    ) {

                        results.extensions.push({

                            id: child.key,
                            ...extension

                        });

                    }

                }
            );

        }


        const total =
            results.projects.length +
            results.posts.length +
            results.users.length +
            results.extensions.length;


        if (!total) {

            resultBox.innerHTML = `

                <div class="communitySearchEmpty">

                    <div style="font-size:40px;">
                        🔎
                    </div>

                    <h3>
                        Nothing found
                    </h3>

                    <p>
                        Try a different search.
                    </p>

                </div>

            `;

            return;

        }


        /* =========================================
           RENDER
        ========================================= */

        function section(
            title,
            icon,
            items,
            callback,
            formatter
        ) {

            if (!items.length) {
                return "";
            }


            return `

                <div class="communitySearchSection">
                    ${icon} ${title}
                </div>

                ${
                    items
                        .slice(0, 5)
                        .map(
                            item => {

                                return `

                                    <button
                                        type="button"
                                        class="communitySearchResult"
                                        data-result-id="${escapeSearchHTML(
                                            item.id
                                        )}"
                                    >

                                        <div class="communitySearchResultIcon">
                                            ${formatter(item).icon}
                                        </div>

                                        <div class="communitySearchResultMain">

                                            <div class="communitySearchResultTitle">
                                                ${escapeSearchHTML(
                                                    formatter(item).title
                                                )}
                                            </div>

                                            <div class="communitySearchResultMeta">
                                                ${escapeSearchHTML(
                                                    formatter(item).meta
                                                )}
                                            </div>

                                        </div>

                                    </button>

                                `;

                            }
                        )
                        .join("")
                }

            `;

        }


        resultBox.innerHTML =

            section(
                "Projects",
                "🚀",
                results.projects,
                null,
                item => ({

                    icon: "🚀",

                    title:
                        item.project?.name ||
                        item.title ||
                        "Project",

                    meta:
                        item.project?.description ||
                        item.content ||
                        "Community Project"

                })
            ) +

            section(
                "Posts",
                "📢",
                results.posts,
                null,
                item => ({

                    icon:
                        item.type === "question"
                            ? "❓"
                            : item.type === "tutorial"
                                ? "📚"
                                : "📢",

                    title:
                        item.title ||
                        item.data?.title ||
                        item.content?.slice(
                            0,
                            70
                        ) ||
                        "Community Post",

                    meta:
                        item.authorName ||
                        "CodeOS Member"

                })
            ) +

            section(
                "People",
                "👤",
                results.users,
                null,
                item => ({

                    icon: "👤",

                    title:
                        item.username ||
                        "CodeOS Member",

                    meta:
                        item.bio ||
                        "CodeOS Community Member"

                })
            ) +

            section(
                "Extensions",
                "⚡",
                results.extensions,
                null,
                item => ({

                    icon:
                        item.icon ||
                        "⚡",

                    title:
                        item.name ||
                        "Extension",

                    meta:
                        item.description ||
                        "CodeOS Extension"

                })
            );


        resultBox
            .querySelectorAll(
                ".communitySearchResult"
            )
            .forEach(button => {

                const id =
                    button.dataset.resultId;


                button.onclick =
                    async () => {

                        const project =
                            results.projects.find(
                                item =>
                                    item.id === id
                            );

                        if (project) {

                            closeSearch();

                            window.codeosOpenCommunityProject?.(
                                project,
                                {
                                    ...(project.project || {}),
                                    title:
                                        project.project?.name ||
                                        project.title,
                                    description:
                                        project.project?.description ||
                                        project.content
                                }
                            );

                            return;

                        }


                        const post =
                            results.posts.find(
                                item =>
                                    item.id === id
                            );

                        if (post) {

                            closeSearch();

                            document
                                .querySelector(
                                    '[data-page="home"]'
                                )
                                ?.click();

                            setTimeout(() => {

                                const card =
                                    document.querySelector(
                                        `[data-post-id="${CSS.escape(id)}"]`
                                    );

                                card?.scrollIntoView({
                                    behavior:
                                        "smooth",
                                    block:
                                        "center"
                                });

                            }, 150);

                            return;

                        }


                        const user =
                            results.users.find(
                                item =>
                                    item.id === id
                            );

                        if (user) {

                            closeSearch();

                            window.codeosOpenProfile?.(
                                user.id
                            );

                            return;

                        }


                        const extension =
                            results.extensions.find(
                                item =>
                                    item.id === id
                            );

                        if (extension) {

                            closeSearch();

                            document
                                .querySelector(
                                    '[data-page="extensions"]'
                                )
                                ?.click();

                            setTimeout(() => {

                                window.codeosOpenExtension?.(
                                    extension
                                );

                            }, 150);

                        }

                    };

            });

    }


    communitySearch.addEventListener(
        "input",
        () => {

            clearTimeout(
                searchTimer
            );

            searchTimer =
                setTimeout(() => {

                    searchCommunity(
                        communitySearch.value
                    );

                }, 220);

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeSearch();

            }

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                    communitySearch ||
                resultBox.contains(
                    event.target
                )
            ) {

                return;

            }

            closeSearch();

        }
    );

}