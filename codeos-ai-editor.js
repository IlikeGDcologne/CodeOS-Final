/* =========================================================
   🤖 CODEOS AI EDITOR
   AI → Real Workspace File Editing
========================================================= */

(function () {

    "use strict";

    console.log("🤖 CodeOS AI Editor loading...");

    /* =====================================================
       FIND JSON IN AI RESPONSE
    ===================================================== */

    function extractJSON(text) {

        if (!text) return null;

        const candidates = [];

        // <CODEOS_EDIT>...</CODEOS_EDIT>
        const markerMatch = text.match(
            /<CODEOS_EDIT>\s*([\s\S]*?)\s*<\/CODEOS_EDIT>/i
        );

        if (markerMatch) {
            candidates.push(markerMatch[1]);
        }

        // ```json ... ```
        const jsonFence = text.match(
            /```json\s*([\s\S]*?)\s*```/i
        );

        if (jsonFence) {
            candidates.push(jsonFence[1]);
        }

        // ``` ... ```
        const genericFence = text.match(
            /```\s*([\s\S]*?)\s*```/i
        );

        if (genericFence) {
            candidates.push(genericFence[1]);
        }

        for (const candidate of candidates) {

            try {

                return JSON.parse(
                    candidate.trim()
                );

            } catch (error) {

                console.warn(
                    "⚠️ Failed to parse candidate edit JSON:",
                    error
                );

            }

        }

        return null;

    }


    /* =====================================================
       APPLY SINGLE OPERATION
    ===================================================== */

    function applyOperation(operation) {

        if (!operation || !operation.type) {

            return {
                success: false,
                message: "Invalid edit operation."
            };

        }

        /* ================================================
           UPDATE EXISTING FILE
        ================================================ */

        if (operation.type === "update_file") {

            const fileName =
                String(
                    operation.file || ""
                ).trim();

            if (!fileName) {

                return {
                    success: false,
                    message:
                        "No file name supplied."
                };

            }

            if (
                typeof operation.content !==
                "string"
            ) {

                return {
                    success: false,
                    message:
                        `No content supplied for "${fileName}".`
                };

            }

            if (
                !window.CodeOS ||
                !window.CodeOS.files ||
                typeof window.CodeOS.files.update !==
                    "function"
            ) {

                return {
                    success: false,
                    message:
                        "CodeOS file API is not ready."
                };

            }

            const success =
                window.CodeOS.files.update(
                    fileName,
                    operation.content
                );

            if (!success) {

                return {
                    success: false,
                    message:
                        `File "${fileName}" was not found.`
                };

            }

            return {
                success: true,
                message:
                    `Updated "${fileName}".`
            };

        }


        /* ================================================
           CREATE FILE
        ================================================ */

        if (operation.type === "create_file") {

            const fileName =
                String(
                    operation.file || ""
                ).trim();

            if (!fileName) {

                return {
                    success: false,
                    message:
                        "No file name supplied."
                };

            }

            if (
                window.CodeOS?.files?.read?.(
                    fileName
                )
            ) {

                return {
                    success: false,
                    message:
                        `File "${fileName}" already exists.`
                };

            }

            const created =
                window.CodeOS.files.create(
                    fileName,
                    String(
                        operation.content || ""
                    ),
                    {
                        icon:
                            operation.icon ||
                            "📄",
                        folder:
                            operation.folder ??
                            null
                    }
                );

            if (!created) {

                return {
                    success: false,
                    message:
                        `Could not create "${fileName}".`
                };

            }

            return {
                success: true,
                message:
                    `Created "${fileName}".`
            };

        }


        return {
            success: false,
            message:
                `Unsupported AI edit operation: ${operation.type}`
        };

    }


    /* =====================================================
       APPLY ALL EDITS
    ===================================================== */

    function applyEdits(payload) {

        if (!payload) {

            return {
                changed: false,
                results: []
            };

        }

        let operations = [];

        if (
            Array.isArray(payload.operations)
        ) {

            operations =
                payload.operations;

        }
        else if (
            payload.type
        ) {

            operations = [
                payload
            ];

        }

        if (!operations.length) {

            return {
                changed: false,
                results: []
            };

        }

        const results = [];

        for (
            const operation of operations
        ) {

            try {

                const result =
                    applyOperation(
                        operation
                    );

                results.push(result);

            } catch (error) {

                results.push({
                    success: false,
                    message:
                        error.message
                });

            }

        }

        const changed =
            results.some(
                result =>
                    result.success
            );

        if (changed) {

            // Force UI refresh
            if (
                typeof window.renderFiles ===
                "function"
            ) {
                window.renderFiles();
            }

            if (
                typeof window.renderTabs ===
                "function"
            ) {
                window.renderTabs();
            }

            if (
                window.CodeOS?.workspace?.save
            ) {
                window.CodeOS.workspace.save();
            }

        }

        return {
            changed,
            results
        };

    }


    /* =====================================================
       REMOVE MACHINE PAYLOAD
    ===================================================== */

    function removeEditPayload(text) {

        if (!text) return "";

        return text

            .replace(
                /<CODEOS_EDIT>[\s\S]*?<\/CODEOS_EDIT>/gi,
                ""
            )

            .replace(
                /```json\s*[\s\S]*?```/gi,
                ""
            )

            .trim();

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.CodeOSAIEditor = {

        version: "2.0",

        extractJSON,

        applyEdits,

        removeEditPayload

    };

    console.log(
        "🤖 CodeOS AI Editor ready."
    );

})();