console.log("WebForge Loaded!");

const runBtn = document.getElementById("run");
const clearBtn = document.getElementById("clear");
const openBtn = document.getElementById("open");
const uploadBtn = document.getElementById("upload");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const assets = {};

runBtn.onclick = () => {

    files[current] = editor.value;

    let html = files.html;
let css = files.css;

for(const name in assets){

    html = html.replaceAll(name, assets[name]);
    css = css.replaceAll(name, assets[name]);

}

    const code = `
<!doctype html>
<html>
<head>

<style>

${css}

</style>

</head>

<body>

${html}

<script>

${files.js}

<\/script>

</body>
</html>
`;

    preview.srcdoc = code;

    status.innerText = "Running ✓";

};

clearBtn.onclick = () => {

    files[current] = "";

    editor.value = "";

    status.innerText = "Editor Cleared";

};

openBtn.onclick = () => {

    files[current] = editor.value;

    let html = files.html;
let css = files.css;

for(const name in assets){

    html = html.replaceAll(name, assets[name]);
    css = css.replaceAll(name, assets[name]);

}

    const code = `
<!doctype html>
<html>

<head>

<title>WebForge Preview</title>

<style>

${css}

#webforgeBadge{

    position:fixed;

    right:20px;
    bottom:20px;

    padding:10px 16px;

    background:linear-gradient(
        135deg,
        #5B8CFF,
        #8B5CF6
    );

    color:white;

    border-radius:999px;

    font-family:Arial,sans-serif;

    font-size:14px;

    font-weight:bold;

    box-shadow:
        0 10px 25px rgba(91,140,255,.35);

    opacity:0;

    animation:badgeFade .8s forwards;

}

@keyframes badgeFade{

    from{

        opacity:0;

        transform:
            translateY(15px);

    }

    to{

        opacity:1;

        transform:
            translateY(0);

    }

}

</style>

</head>

<body>

${html}

<div id="webforgeBadge">

⚡ Made with WebForge

</div>

<script>

${files.js}

<\/script>

</body>

</html>
`;

    const newTab = window.open();

    newTab.document.open();
    newTab.document.write(code);
    newTab.document.close();

};

uploadBtn.onclick = () => {

    fileInput.click();

};

const assetList = document.getElementById("assetList");

fileInput.onchange = ()=>{

    [...fileInput.files].forEach(file=>{

        const url = URL.createObjectURL(file);

        assets[file.name] = url;

        const item = document.createElement("div");

        item.className = "asset";

        item.innerText = "🖼 " + file.name;

        item.onclick = ()=>{

            navigator.clipboard.writeText(file.name);

            status.innerText =
                file.name + " copied!";

        };

        assetList.appendChild(item);

        document
            .getElementById("assetsBtn")
            .classList.remove("hidden");

    });

};