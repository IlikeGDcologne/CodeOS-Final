/* =========================================================
   👑 CODEOS PLUS+
   Fake Subscription / Entitlement System
========================================================= */

(function () {

    "use strict";

    console.log("👑 CodeOS Plus+ loading...");

    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEY = "codeosPlusAccount";

    const DEFAULT_ACCOUNT = {
        subscribed: false,
        plan: "free",

        // Free AI usage
        aiMessagesUsed: 0,
        aiFreeMessageLimit: 2,

        // Plus+ identity
        displayName: "",
        badge: "FREE",

        // Feature access
        devTools: false,
        aiEditing: false,

        // Fake purchase information
        purchaseDate: null,
        transactionId: null
    };

    /* =====================================================
       LOAD ACCOUNT
    ===================================================== */

    function getAccount() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    ) || "null"
                );

            if (!saved) {
                return structuredClone(
                    DEFAULT_ACCOUNT
                );
            }

            return {
                ...DEFAULT_ACCOUNT,
                ...saved
            };

        } catch (error) {

            console.error(
                "❌ Failed to load CodeOS Plus+ account:",
                error
            );

            return structuredClone(
                DEFAULT_ACCOUNT
            );

        }

    }

    /* =====================================================
       SAVE ACCOUNT
    ===================================================== */

    function saveAccount(account) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(account)
        );

        window.dispatchEvent(
            new CustomEvent(
                "codeospluschange",
                {
                    detail: structuredClone(account)
                }
            )
        );

        return account;

    }

    /* =====================================================
       PLUS CHECK
    ===================================================== */

    function isPlus() {

        const account = getAccount();

        return (
            account.subscribed === true &&
            account.plan === "plus"
        );

    }

    /* =====================================================
       FREE AI LIMIT
    ===================================================== */

    function getAIUsage() {

        const account = getAccount();

        return {
            used: account.aiMessagesUsed,
            limit: account.aiFreeMessageLimit,
            remaining:
                isPlus()
                    ? Infinity
                    : Math.max(
                        0,
                        account.aiFreeMessageLimit -
                        account.aiMessagesUsed
                    ),
            unlimited: isPlus()
        };

    }

    /* =====================================================
       CAN SEND AI MESSAGE?
    ===================================================== */

    function canUseAI() {

        const account = getAccount();

        if (isPlus()) {
            return true;
        }

        return (
            account.aiMessagesUsed <
            account.aiFreeMessageLimit
        );

    }

    /* =====================================================
       RECORD AI MESSAGE
    ===================================================== */

    function recordAIMessage() {

        const account = getAccount();

        if (isPlus()) {
            return true;
        }

        if (
            account.aiMessagesUsed >=
            account.aiFreeMessageLimit
        ) {
            return false;
        }

        account.aiMessagesUsed++;

        saveAccount(account);

        return true;

    }

    /* =====================================================
       AI REMAINING
    ===================================================== */

    function getRemainingAIMessages() {

        const account = getAccount();

        if (isPlus()) {
            return Infinity;
        }

        return Math.max(
            0,
            account.aiFreeMessageLimit -
            account.aiMessagesUsed
        );

    }

    /* =====================================================
       RESET FREE AI USAGE
       Useful while testing.
    ===================================================== */

    function resetAIUsage() {

        const account = getAccount();

        account.aiMessagesUsed = 0;

        saveAccount(account);

        return account;

    }

    /* =====================================================
       FAKE TRANSACTION ID
    ===================================================== */

    function createTransactionID() {

        return (
            "CDX-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()
        );

    }

    /* =====================================================
       PURCHASE PLUS+
    ===================================================== */

    function subscribe(options = {}) {

        const account = getAccount();

        const displayName =
            String(
                options.displayName ||
                account.displayName ||
                "CodeOS Creator"
            ).trim();

        const transactionId =
            createTransactionID();

        account.subscribed = true;
        account.plan = "plus";
account.billing =
    options.plan || "monthly";

        account.displayName =
            displayName;

        account.badge = "CDX PLUS+";

        account.devTools = true;
        account.aiEditing = true;

        account.purchaseDate =
            Date.now();

        account.transactionId =
            transactionId;

        saveAccount(account);

        console.log(
            "👑 CodeOS Plus+ activated!",
            account
        );

        return structuredClone(account);

    }

    /* =====================================================
       CANCEL / REMOVE SUBSCRIPTION
       Fake system only.
    ===================================================== */

    function cancelSubscription() {

        const account = getAccount();

        account.subscribed = false;
        account.plan = "free";

        account.badge = "FREE";

        account.devTools = false;
        account.aiEditing = false;

        saveAccount(account);

        return structuredClone(account);

    }

    /* =====================================================
       DISPLAY NAME
    ===================================================== */

    function setDisplayName(name) {

        const account = getAccount();

        account.displayName =
            String(name || "").trim();

        saveAccount(account);

        return account.displayName;

    }

    function getDisplayName() {

        return getAccount()
            .displayName || "";

    }

    /* =====================================================
       FEATURE CHECKS
    ===================================================== */

    function canUseDevTools() {

        return (
            isPlus() &&
            getAccount().devTools === true
        );

    }

    function canUseAIEditing() {

        return (
            isPlus() &&
            getAccount().aiEditing === true
        );

    }

    /* =====================================================
       BADGE
    ===================================================== */

    function getBadge() {

        return getAccount().badge;

    }

    /* =====================================================
       TRANSACTION INFO
    ===================================================== */

    function getTransaction() {

        const account = getAccount();

        return {
            transactionId:
                account.transactionId,

            purchaseDate:
                account.purchaseDate,

            plan:
                account.plan
        };

    }

    /* =====================================================
       ACCOUNT INFO
    ===================================================== */

    function getStatus() {

        const account = getAccount();

        return {

            subscribed:
                account.subscribed,

            plan:
                account.plan,

            isPlus:
                isPlus(),

            displayName:
                account.displayName,

            badge:
                account.badge,

            aiMessagesUsed:
                account.aiMessagesUsed,

            aiFreeMessageLimit:
                account.aiFreeMessageLimit,

            aiRemaining:
                getRemainingAIMessages(),

            aiUnlimited:
                isPlus(),

            devTools:
                canUseDevTools(),

            aiEditing:
                canUseAIEditing(),

            purchaseDate:
                account.purchaseDate,

            transactionId:
                account.transactionId

        };

    }

    /* =====================================================
       OPEN PLUS+ PAGE
    ===================================================== */

    function openPlusPage() {

        if (
            typeof window.openCodeOSPlusPage ===
            "function"
        ) {

            window.openCodeOSPlusPage();

            return;

        }

        if (
            typeof window.location !==
            "undefined"
        ) {

            window.location.href =
                "plus.html";

        }

    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    const CodeOSPlus = {

        version: "1.0",

        getAccount,

        getStatus,

        saveAccount,

        isPlus,

        subscribe,

        cancelSubscription,

        setDisplayName,

        getDisplayName,

        getBadge,

        getTransaction,

        canUseAI,

        recordAIMessage,

        getAIUsage,

        getRemainingAIMessages,

        resetAIUsage,

        canUseDevTools,

        canUseAIEditing,

        openPlusPage

    };

    window.CodeOSPlus =
        CodeOSPlus;

    console.log(
        "👑 CodeOS Plus+ ready!",
        CodeOSPlus.getStatus()
    );

})();