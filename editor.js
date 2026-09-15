const editor=document.getElementById("editor");

const tabs=document.querySelectorAll(".tab");

let files = {

    html: `<h1>Hello WebForge!</h1>

<p>Start building amazing websites.</p>`,

    css: `body{

font-family:Arial;

text-align:center;

padding:40px;

}

h1{

color:#5B8CFF;

}`,

    js: `console.log("Hello WebForge!");`

};

const webforgeProject =
    JSON.parse(
        localStorage.getItem("webforgeProject") || "null"
    );

if (webforgeProject) {

    console.log(
        "⚡ Loading CodeOS workspace:",
        webforgeProject.workspaceName
    );

    files.html = webforgeProject.html || "";

    files.css = webforgeProject.css || "";

    files.js = webforgeProject.js || "";

    localStorage.removeItem("webforgeProject");

}

let current="html";

editor.value=files.html;

tabs.forEach(tab=>{

tab.onclick=()=>{

files[current]=editor.value;

tabs.forEach(t=>t.classList.remove("active"));

tab.classList.add("active");

current=tab.dataset.tab;

editor.value=files[current];

};

});

const search = document.getElementById("search");

const nextMatch = document.getElementById("nextMatch");
const prevMatch = document.getElementById("prevMatch");

let matches = [];
let currentMatch = -1;

function updateMatches(){

    matches = [];

    currentMatch = -1;

    const query = search.value.toLowerCase();

    if(query === ""){

        status.innerText = "Ready ✓";

        return;

    }

    const text = editor.value.toLowerCase();

    let index = text.indexOf(query);

    while(index !== -1){

        matches.push(index);

        index = text.indexOf(query,index+1);

    }

    status.innerText =
        matches.length +
        " match" +
        (matches.length===1?"":"es");

}

function jumpToMatch(direction){

    if(matches.length===0) return;

    currentMatch += direction;

    if(currentMatch>=matches.length)
        currentMatch=0;

    if(currentMatch<0)
        currentMatch=matches.length-1;

    const start = matches[currentMatch];

const query = search.value;

editor.focus();

requestAnimationFrame(() => {

    editor.setSelectionRange(
        start,
        start + query.length
    );

});

    status.innerText =
        (currentMatch+1) +
        "/" +
        matches.length +
        " matches";

}

search.addEventListener("input",updateMatches);

search.addEventListener("keydown",e=>{

    if(e.key==="Enter"){

        e.preventDefault();

        jumpToMatch(1);

    }

});

nextMatch.onclick=()=>jumpToMatch(1);

prevMatch.onclick=()=>jumpToMatch(-1);

const assetsBtn = document.getElementById("assetsBtn");

const assetsWindow = document.getElementById("assetsWindow");

const closeAssets = document.getElementById("closeAssets");

assetsBtn.onclick = ()=>{

    assetsWindow.classList.add("show");

};

closeAssets.onclick = ()=>{

    assetsWindow.classList.remove("show");

};

assetsWindow.onclick = e=>{

    if(e.target===assetsWindow){

        assetsWindow.classList.remove("show");

    }

};

const webforgeTitle =
    document.getElementById("webforgeTitle");

if (
    webforgeProject &&
    webforgeProject.workspaceName
) {

    webforgeTitle.innerText =
        "🌐 WebForge — " +
        webforgeProject.workspaceName;

}