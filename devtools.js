/* =========================================================
   🛠️ CODEOS DEVTOOLS
   Chrome DevTools integration
========================================================= */

"use strict";

console.log("👾 CodeOS DevTools booting...");

chrome.devtools.panels.create(
    "CodeOS",
    "🚀",
    "panel.html",
    function (panel) {

        console.log(
            "🛠️ CodeOS DevTools panel created."
        );

        panel.onShown.addListener(
            function () {

                console.log(
                    "👀 CodeOS DevTools panel opened."
                );

            }
        );

    }
);