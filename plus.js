/* =========================================================
   👑 CDX PLUS+ PAGE
========================================================= */

(function () {

    "use strict";

    console.log("👑 CDX Plus+ page loaded.");

    const paymentOverlay =
        document.getElementById("paymentOverlay");

    const codeOverlay =
        document.getElementById("codeOverlay");

    const planStep =
        document.getElementById("planStep");

    const payStep =
        document.getElementById("payStep");

    const successStep =
        document.getElementById("successStep");

    const continuePayment =
        document.getElementById("continuePayment");

    const paymentProgressFill =
        document.getElementById("paymentProgressFill");

    const paymentStatus =
        document.getElementById("paymentStatus");

    const paymentSubtext =
        document.getElementById("paymentSubtext");

    const secretCode =
        document.getElementById("secretCode");

    let selectedPlan = null;

    const DEVTOOLS_STORAGE =
        "codeosDevToolsAccess";


    /* =====================================================
       PARTICLES
    ===================================================== */

    function createParticles() {

        const container =
            document.getElementById("particles");

        if (!container) return;

        for (let i = 0; i < 70; i++) {

            const particle =
                document.createElement("div");

            particle.className =
                "particle";

            particle.style.left =
                Math.random() * 100 + "%";

            particle.style.animationDuration =
                (8 + Math.random() * 16) + "s";

            particle.style.animationDelay =
                (-Math.random() * 18) + "s";

            const size =
                1 + Math.random() * 2;

            particle.style.width =
                size + "px";

            particle.style.height =
                size + "px";

            container.appendChild(
                particle
            );

        }

    }


    /* =====================================================
       DEVTOOLS CODE
    ===================================================== */

    function generateDevToolsCode() {

        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

        let code = "";

        for (let i = 0; i < 6; i++) {

            code += chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

        }

        return code;

    }


    function getDevToolsAccess() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    DEVTOOLS_STORAGE
                ) || "null"
            );

        } catch {

            return null;

        }

    }


    function createDevToolsAccess() {

        const account =
            window.CodeOSPlus.getAccount();

        let access =
            getDevToolsAccess();

        if (
            access &&
            access.code &&
            access.valid === true
        ) {

            return access;

        }

        access = {

            code:
                generateDevToolsCode(),

            valid:
                true,

            created:
                Date.now(),

            owner:
                account.displayName ||
                "CodeOS Creator"

        };

        localStorage.setItem(
            DEVTOOLS_STORAGE,
            JSON.stringify(access)
        );

        return access;

    }


    function invalidateDevToolsAccess() {

        const access =
            getDevToolsAccess();

        if (!access) return;

        access.valid = false;

        localStorage.setItem(
            DEVTOOLS_STORAGE,
            JSON.stringify(access)
        );

    }


    /* =====================================================
       ACCOUNT UI
    ===================================================== */

    function refreshAccountUI() {

        const account =
            window.CodeOSPlus.getStatus();

        const title =
            document.getElementById(
                "accountStatusTitle"
            );

        const text =
            document.getElementById(
                "accountStatusText"
            );

        const unsubscribeButton =
            document.getElementById(
                "unsubscribeButton"
            );

        if (account.isPlus) {

            title.textContent =
                "👑 You're officially a CDX Plus+ member.";

            text.textContent =
                `Welcome, ${
                    account.displayName ||
                    "CodeOS Creator"
                }. Your Plus+ features are active.`;

            unsubscribeButton.style.display =
                "block";

        } else {

            title.textContent =
                "You're currently using CodeOS Free.";

            text.textContent =
                "Upgrade to unlock the complete CodeOS ecosystem.";

            unsubscribeButton.style.display =
                "none";

        }

    }


    /* =====================================================
       OPEN PAYMENT
    ===================================================== */

    function openPayment() {

        selectedPlan = null;

        document
            .querySelectorAll(".modalPlan")
            .forEach(button => {
                button.classList.remove(
                    "selected"
                );
            });

        continuePayment.disabled =
            true;

        planStep.classList.add("active");
        payStep.classList.remove("active");
        successStep.classList.remove("active");

        paymentOverlay.classList.remove(
            "hidden"
        );

    }


    function closePayment() {

        paymentOverlay.classList.add(
            "hidden"
        );

    }


    /* =====================================================
       SELECT PLAN
    ===================================================== */

    document
        .querySelectorAll(".modalPlan")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".modalPlan"
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

                    selectedPlan =
                        button.dataset.plan;

                    continuePayment.disabled =
                        false;

                }
            );

        });


    /* =====================================================
       FAKE PAYMENT
    ===================================================== */

    async function processPayment() {

        if (!selectedPlan) return;

        planStep.classList.remove(
            "active"
        );

        payStep.classList.add(
            "active"
        );

        paymentProgressFill.style.width =
            "0%";

        paymentStatus.textContent =
            "Processing...";

        paymentSubtext.textContent =
            selectedPlan === "monthly"
                ? "Preparing your imaginary monthly subscription."
                : "Preparing your imaginary lifetime upgrade.";

        const stages = [

            {
                progress: 22,
                text: "Connecting to CDX Pay...",
                sub:
                    "Opening a completely fake payment gateway."
            },

            {
                progress: 47,
                text: "Authorizing transaction...",
                sub:
                    "Your imaginary bank has approved the imaginary charge."
            },

            {
                progress: 72,
                text: "Activating membership...",
                sub:
                    "Installing premium privileges."
            },

            {
                progress: 94,
                text: "Finalizing...",
                sub:
                    "Polishing your imaginary golden badge."
            },

            {
                progress: 100,
                text: "Complete.",
                sub:
                    "Everything is ready."
            }

        ];

        for (
            const stage of stages
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        700
                    )
            );

            paymentProgressFill.style.width =
                stage.progress + "%";

            paymentStatus.textContent =
                stage.text;

            paymentSubtext.textContent =
                stage.sub;

        }

        /* =============================================
           ACTIVATE PLUS+
        ============================================= */

        let name =
            window.CodeOSPlus.getDisplayName();

        if (!name) {

            name =
                prompt(
                    "Choose your CodeOS Plus+ display name:"
                ) ||
                "CodeOS Creator";

        }

        window.CodeOSPlus.subscribe({
            displayName: name,
            plan: selectedPlan
        });

        createDevToolsAccess();

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    450
                )
        );

        payStep.classList.remove(
            "active"
        );

        successStep.classList.add(
            "active"
        );

        refreshAccountUI();

    }


    /* =====================================================
       DEVTOOLS CODE
    ===================================================== */

    function showDevToolsCode() {

        const account =
            window.CodeOSPlus.getStatus();

        if (!account.isPlus) {

            openPayment();

            return;

        }

        const access =
            createDevToolsAccess();

        secretCode.textContent =
            access.code;

        codeOverlay.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       COPY
    ===================================================== */

    document
        .getElementById("copyCode")
        .addEventListener(
            "click",
            async () => {

                const code =
                    secretCode.textContent;

                try {

                    await navigator.clipboard.writeText(
                        code
                    );

                } catch {

                    const textarea =
                        document.createElement(
                            "textarea"
                        );

                    textarea.value =
                        code;

                    document.body.appendChild(
                        textarea
                    );

                    textarea.select();

                    document.execCommand(
                        "copy"
                    );

                    textarea.remove();

                }

                const button =
                    document.getElementById(
                        "copyCode"
                    );

                button.textContent =
                    "✓ Copied!";

                setTimeout(
                    () => {
                        button.textContent =
                            "Copy Code";
                    },
                    1800
                );

            }
        );


    /* =====================================================
       UNSUBSCRIBE
    ===================================================== */

    document
        .getElementById(
            "unsubscribeButton"
        )
        .addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Unsubscribe from CDX Plus+?\n\n" +
                        "Your Plus+ features and DevTools access " +
                        "will be disabled."
                    );

                if (!confirmed) return;

                window.CodeOSPlus
                    .cancelSubscription();

                invalidateDevToolsAccess();

                refreshAccountUI();

                alert(
                    "CDX Plus+ has been cancelled."
                );

            }
        );


    /* =====================================================
       BUTTONS
    ===================================================== */

    document
        .getElementById("heroSubscribe")
        .onclick = openPayment;

    document
        .getElementById("subscribeMonthly")
        .onclick = () => {

            openPayment();

            document
                .querySelector(
                    '[data-plan="monthly"]'
                )
                .click();

        };

    document
        .getElementById("subscribeLifetime")
        .onclick = () => {

            openPayment();

            document
                .querySelector(
                    '[data-plan="lifetime"]'
                )
                .click();

        };


    document
        .getElementById("heroDevTools")
        .onclick = () => {
            location.href =
                "devtools.html";
        };


    document
        .getElementById("openDevTools")
        .onclick = () => {
            location.href =
                "devtools.html";
        };


    document
        .getElementById(
            "devToolsCodeButton"
        )
        .onclick =
            showDevToolsCode;


    document
        .getElementById("closePayment")
        .onclick =
            closePayment;


    document
        .getElementById("closeCode")
        .onclick =
            () => {
                codeOverlay.classList.add(
                    "hidden"
                );
            };


    document
        .getElementById("continuePayment")
        .onclick =
            processPayment;


    document
        .getElementById("finishPayment")
        .onclick =
            () => {

                closePayment();

                document
                    .getElementById(
                        "devtools"
                    )
                    .scrollIntoView({
                        behavior:
                            "smooth"
                    });

            };


    /* =====================================================
       CLICK OUTSIDE MODALS
    ===================================================== */

    paymentOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                paymentOverlay
            ) {
                closePayment();
            }

        }
    );

    codeOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                codeOverlay
            ) {
                codeOverlay.classList.add(
                    "hidden"
                );
            }

        }
    );


    /* =====================================================
       ACCOUNT BUTTON
    ===================================================== */

    document
        .getElementById("accountButton")
        .onclick = () => {

            const status =
                window.CodeOSPlus.getStatus();

            alert(
                status.isPlus
                    ? `👑 CDX Plus+\n\n` +
                      `Member: ${status.displayName}\n` +
                      `Badge: ${status.badge}\n` +
                      `DevTools: ${status.devTools ? "Unlocked" : "Locked"}`
                    : "You're using the CodeOS Free tier."
            );

        };


    /* =====================================================
       INIT
    ===================================================== */

    createParticles();
    refreshAccountUI();

})();