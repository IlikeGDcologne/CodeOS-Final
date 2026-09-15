console.log("💻 Workspace Loaded!");

const renameModal=document.getElementById("renameModal");
const renameInput=document.getElementById("renameInput");

const overlay = document.getElementById("paletteOverlay");
const input = document.getElementById("commandInput");
const commandList = document.getElementById("commandList");

const workspaceOverlay =
document.getElementById("workspaceOverlay");

const workspaceList =
document.getElementById("workspaceList");

const workspaceSearch =
document.getElementById("workspaceSearch");

const newWorkspaceCard =
document.getElementById("newWorkspaceCard");

const newWorkspaceOverlay =
document.getElementById("newWorkspaceOverlay");

const workspaceNameInput =
document.getElementById("workspaceNameInput");

const cancelWorkspace =
document.getElementById("cancelWorkspace");

const createWorkspaceBtn =
document.getElementById("createWorkspaceBtn");

let renameIndex=-1;

let files = [];
let folders = [];
let openTabs = [0];
let selectedFile = 0;

let selectedIndex = 0;

const savedWorkspace =
JSON.parse(localStorage.getItem("codeosWorkspace"));

if(savedWorkspace){

    files = savedWorkspace.files || [];

    folders = savedWorkspace.folders || [];

    openTabs = savedWorkspace.openTabs || [0];

    selectedFile = savedWorkspace.selectedFile || 0;

}
else{

    files = [

    {
        name:"main.cdx",
        icon:"📄",
        content:'say("Hello World")',
        folder:null
    }

    ];

}

const commands = [

{
    icon:"🚀",
    name:"Launch Workspace",
    action:()=>{}
},

{
    icon:"📂",
    name:"Open Workspace",
    action:()=>showWorkspaceManager()
},

{
    icon:"✨",
    name:"New Workspace",
    action:()=>newWorkspace()
},

{
    icon:"⚙",
    name:"Settings",
    action:()=>alert("Settings Coming Soon!")
},

{
    icon:"🤖",
    name:"Ask AI",
    action:()=>window.openCodeOSAI?.()
},

{
    icon:"📖",
    name:"Documentation",
    action:()=>window.location.href="documentation.html"
},

{
    icon:"🕒",
    name:"Timeline",
    action:()=>alert("Timeline Coming Soon!")
},

{
    icon:"🧩",
    name:"Insert Code Snippet",
    action:()=>{

        const type=prompt(
            "Snippet:\n\n" +
            "if\n" +
            "repeat\n" +
            "while\n" +
            "function\n" +
            "sprite\n" +
            "game"
        );

        if(window.codeosInsertSnippet){

            window.codeosInsertSnippet(
                type?.toLowerCase()
            );

        }

    }
},

{
    icon:"↗️",
    name:"Open Project in New Tab",
    action:()=>openCodeOSProjectInNewTab()
},

];

function getWorkspaces(){

    return JSON.parse(
        localStorage.getItem("codeosWorkspaces")
        || "[]"
    );

}

async function saveWorkspace(name) {

    let list = getWorkspaces();

    let existingIndex = list.findIndex(
        w => w.name === name
    );

    let project = {
        id: existingIndex >= 0
            ? list[existingIndex].id
            : "codeos-" + Date.now(),

        name: name,

        type: "codeos",

        files: structuredClone(files),

        folders: structuredClone(folders),

        openTabs: structuredClone(openTabs),

        selectedFile: selectedFile,

        date: Date.now()
    };

    if (existingIndex >= 0) {
        list[existingIndex] = project;
    } else {
        list.push(project);
    }

    // Save locally
    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    // Save to Firebase if Firebase is available
    if (
        window.codeosFirebase &&
        window.codeosFirebase.db
    ) {

        try {

            await window.codeosFirebase.set(
                window.codeosFirebase.ref(
                    window.codeosFirebase.db,
                    "codeosWorkspaces/" + project.id
                ),
                project
            );

            console.log(
                "☁️ Workspace saved to Firebase:",
                project.id
            );

        } catch (error) {

            console.error(
                "❌ Failed to save workspace to Firebase:",
                error
            );

        }
    }

    return project;
}

const fileList=document.getElementById("fileList");

let hoveringFolder = false;

const editor = document.querySelector("textarea");

const imagePreview=document.getElementById("imagePreview");

editor.addEventListener("input",()=>{

    files[selectedFile].content = editor.value;

    saveWorkspaceState();

});

const tab = document.querySelector(".tab");

const tabs=document.getElementById("tabs");

const saveProjectBtn=document.getElementById("saveProjectBtn");
const loadProjectBtn=document.getElementById("loadProjectBtn");
const projectPicker=document.getElementById("projectPicker");

function renderFiles(){

    fileList.innerHTML="";

    folders.forEach(folder=>{

    const div=document.createElement("div");

    div.className="file";

    div.innerHTML=`${folder.open ? "📂" : "📁"} ${folder.name}`;

    div.onclick=()=>{

        folder.open=!folder.open;

        renderFiles();

        saveWorkspaceState();

    };

    div.addEventListener("dragover",(e)=>{

    e.preventDefault();

    hoveringFolder = true;

});

div.addEventListener("dragleave",()=>{

    hoveringFolder = false;

});

div.addEventListener("drop",(e)=>{

    e.preventDefault();

    if(window.draggedFile===undefined) return;

    files[window.draggedFile].folder=folder.name;

    renderFiles();

    saveWorkspaceState();

});

    fileList.appendChild(div);

    if(folder.open){

        const rootDrop=document.createElement("div");

rootDrop.style.height="8px";

rootDrop.style.marginBottom="6px";

rootDrop.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

rootDrop.addEventListener("drop",()=>{

    if(window.draggedFile===undefined) return;

    files[window.draggedFile].folder=null;

    hoveringFolder = false;

    window.draggedFile=undefined;

    renderFiles();

    saveWorkspaceState();

});

fileList.appendChild(rootDrop);

    files.forEach((file,index)=>{

        if(file.folder!==folder.name) return;

        const child=document.createElement("div");

child.className="file";

child.draggable=true;

child.dataset.index=index;

child.addEventListener("dragstart",()=>{

    window.draggedFile=index;

});

        child.style.paddingLeft="28px";

        if(index===selectedFile){

            child.classList.add("active");

        }

        child.innerHTML=`${file.icon} ${file.name}`;

        child.onclick=()=>{

            selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

            if(file.icon==="🖼"){

    editor.style.display="none";

    showImage(file.content);

}else{

    imagePreview.style.display="none";
    editor.style.display="block";

    editor.value=file.content;

}

            renderFiles();

            saveWorkspaceState();

        };

        child.ondblclick=()=>{

            renameIndex=index;

            const dot=file.name.lastIndexOf(".");

            renameInput.value=file.name.substring(0,dot);

            renameModal.classList.remove("hidden");

            renameInput.focus();

            renameInput.select();

        };

        fileList.appendChild(child);

    });

}

});

    files.forEach((file,index)=>{

        if(file.folder!==null){

    return;

}

        const div=document.createElement("div");

div.className="file";

div.draggable=true;

div.dataset.index=index;

div.addEventListener("dragstart",()=>{

    window.draggedFile=index;

});

        if(index===selectedFile){

            div.classList.add("active");

        }

        div.innerHTML=`${file.icon} ${file.name}`;

        div.onclick=()=>{

    selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

    if(files[index].icon==="🖼"){

    editor.style.display="none";

    showImage(files[index].content);

}else{

    imagePreview.style.display="none";

    editor.style.display="block";

    if(files[index].icon === "🖼"){

    editor.style.display = "none";

    showImage(files[index].content);

}
else{

    imagePreview.style.display = "none";

    editor.style.display = "block";

    editor.value = files[index].content;

}

}

    renderFiles();

    saveWorkspaceState();

};

div.ondblclick=()=>{

    renameIndex=index;

    const dot=files[index].name.lastIndexOf(".");

    renameInput.value=files[index].name.substring(0,dot);

    renameModal.classList.remove("hidden");

    renameInput.focus();

    renameInput.select();

};

        fileList.appendChild(div);

    });

}

renderFiles();

saveWorkspaceState();

const modal=document.getElementById("fileModal");
const fileName=document.getElementById("fileName");
const fileType=document.getElementById("fileType");
const imagePicker=document.getElementById("imagePicker");

let uploadedImage=null;

imagePicker.addEventListener("change",()=>{

    const file=imagePicker.files[0];

    if(!file){

        fileType.value="cdx";

        return;

    }

    uploadedImage=file;

    fileName.value=file.name.replace(/\.[^/.]+$/,"");

});

document.getElementById("newFileBtn").onclick=()=>{

    modal.classList.remove("hidden");

    fileName.value="";

    fileName.focus();

};

document.getElementById("cancelFile").onclick=()=>{

    modal.classList.add("hidden");

};

document.getElementById("closeWorkspacePopup").onclick = () => {
    workspaceOverlay.classList.add("hidden");
};


document.getElementById("createFile").onclick=()=>{

    const name=fileName.value.trim();

    if(!name) return;

    const type=fileType.value;

    let icon="📄";
    let content="";

    if(type==="image"){

    if(!uploadedImage){

        alert("Choose an image first.");

        return;

    }

    const reader = new FileReader();

reader.onload = () => {

    files.push({

        name: uploadedImage.name,

        icon: "🖼",

        folder: null,

        content: reader.result

    });

    saveWorkspaceState();

    uploadedImage = null;

    modal.classList.add("hidden");

    renderFiles();

    saveWorkspaceState();

};

reader.readAsDataURL(uploadedImage);

return;

    uploadedImage=null;

    modal.classList.add("hidden");

    renderFiles();

    saveWorkspaceState();

    return;

}

    switch(type){

        case "html":
            content=`<!DOCTYPE html>
<html>
<head>

</head>
<body>

</body>
</html>`;
            break;

        case "css":
            content=`body{

}`;
            break;

        case "js":
            content=`console.log("Hello World");`;
            break;

        case "json":
            content=`{

}`;
            break;

        case "cdx":
            content=`say("Hello World")`;
            break;

    }

    if(type==="html") icon="🌐";
    if(type==="css") icon="🎨";
    if(type==="js") icon="🟨";
    if(type==="json") icon="🟫";

    files.push({

        name:name+"."+type,

        icon,

        content,

        folder:null

    });

    saveWorkspaceState();

    renderFiles();

    saveWorkspaceState();

    modal.classList.add("hidden");

};

// =============================
// RESIZABLE EXPLORER
// =============================

const explorer = document.querySelector(".explorer");
const divider = document.querySelector(".divider");

let resizing = false;

divider.addEventListener("mousedown", () => {

    resizing = true;

    document.body.style.cursor = "ew-resize";

});

document.addEventListener("mousemove", (e) => {

    if(!resizing) return;

    let width = e.clientX;

    width = Math.max(180, width);
    width = Math.min(500, width);

    explorer.style.width = width + "px";

});

document.addEventListener("mouseup", () => {

    resizing = false;

    document.body.style.cursor = "default";

});

// Open the first file on startup

editor.value = files[selectedFile].content;

const lessonCode = localStorage.getItem("lessonWorkspaceCode");

if(lessonCode){

    files.push({

        name: "Lesson.cdx",

        icon: "📄",

        content: lessonCode,

        folder: null

    });

    saveWorkspaceState();

    selectedFile = files.length - 1;

    if(!openTabs.includes(selectedFile)){
        openTabs.push(selectedFile);
    }

    editor.value = lessonCode;

    renderFiles();

    saveWorkspaceState();

    renderTabs();

    localStorage.removeItem("lessonWorkspaceCode");

}

document.getElementById("deleteFileBtn").onclick = () => {

    if (files.length <= 1) {
        alert("You must have at least one file.");
        return;
    }

    if (!confirm(`Delete "${files[selectedFile].name}"?`))
        return;

    files.splice(selectedFile, 1);

    selectedFile = 0;
    openTabs = [0];

    imagePreview.style.display = "none";
    editor.style.display = "block";
    editor.value = files[0].content;

    saveWorkspaceState();
    renderFiles();
    renderTabs();

};

document.getElementById("cancelRename").onclick=()=>{

    renameModal.classList.add("hidden");

};

document.getElementById("homeButton").onclick = () => {

    window.location.href = "index.html";

};

document.addEventListener("keydown",(e)=>{

    // Open Palette
    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==="k"){

        e.preventDefault();

        overlay.classList.add("show");

        selectedIndex = 0;

        input.value = "";

        renderCommands();

        input.focus();

        return;

    }

    // Ignore everything if palette isn't open
    if(!overlay.classList.contains("show")) return;

    const filtered = commands.filter(c =>
        c.name.toLowerCase().includes(input.value.toLowerCase())
    );

    if(e.key==="Escape"){

        overlay.classList.remove("show");

        input.value="";

        return;

    }

    if(e.key==="ArrowDown"){

        e.preventDefault();

        selectedIndex = (selectedIndex + 1) % filtered.length;

        renderCommands(input.value);

    }

    if(e.key==="ArrowUp"){

        e.preventDefault();

        selectedIndex--;

        if(selectedIndex < 0){

            selectedIndex = filtered.length - 1;

        }

        renderCommands(input.value);

    }

    if(e.key==="Enter"){

        e.preventDefault();

        filtered[selectedIndex].action();

        overlay.classList.remove("show");

        input.value="";

    }

});

document.getElementById("confirmRename").onclick=renameFile;

renameInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        renameFile();

    }

    if(e.key==="Escape"){

        renameModal.classList.add("hidden");

    }

});

function renameFile(){

    if(renameIndex===-1) return;

    const newName=renameInput.value.trim();

    if(!newName) return;

    const dot=files[renameIndex].name.lastIndexOf(".");

    const extension=files[renameIndex].name.substring(dot);

    files[renameIndex].name=newName+extension;

    saveWorkspaceState();

    renameModal.classList.add("hidden");

    renderFiles();

    saveWorkspaceState();

}

document.getElementById("newFolderBtn").onclick=()=>{

    const name=prompt("Folder name");

    if(!name) return;

    folders.push({

    name:name.trim(),

    open:true

});

    renderFiles();

    saveWorkspaceState();

};

document.getElementById("moveFileBtn").onclick=()=>{

    if(folders.length===0){

        alert("Create a folder first.");

        return;

    }

    const names=folders.map(f=>f.name).join("\n");

    const choice=prompt(
`Move "${files[selectedFile].name}" to:

${names}

(Type the folder name exactly)`
    );

    if(!choice) return;

    const folder=folders.find(f=>
        f.name.toLowerCase()===choice.toLowerCase()
    );

    if(!folder){

        alert("Folder not found.");

        return;

    }

    files[selectedFile].folder=folder.name;

    saveWorkspaceState();

    renderFiles();
};

fileList.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

fileList.addEventListener("drop",()=>{

    if(window.draggedFile===undefined) return;

    if(hoveringFolder) return;

    files[window.draggedFile].folder = null;

    window.draggedFile = undefined;

    renderFiles();

    renderTabs();

    saveWorkspaceState();

});

function renderTabs(){

    tabs.innerHTML="";

    openTabs.forEach(index=>{

        const t=document.createElement("div");

        t.draggable=true;

        t.className="tab";

t.addEventListener("dragstart",()=>{

    window.draggedTab=index;

});

t.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

t.addEventListener("drop",()=>{

    if(window.draggedTab===undefined) return;

    const from=openTabs.indexOf(window.draggedTab);
    const to=openTabs.indexOf(index);

    if(from===-1 || to===-1) return;

    const moving=openTabs.splice(from,1)[0];

    openTabs.splice(to,0,moving);

    renderTabs();

});

t.addEventListener("dragend",()=>{

    window.draggedTab=undefined;

});

        if(index===selectedFile){

            t.classList.add("active");

        }

        t.innerHTML=`
            ${files[index].icon}
            ${files[index].name}
            <span class="tabClose">✕</span>
        `;

        t.onclick=()=>{

            selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

            if(files[index].icon === "🖼"){

    editor.style.display = "none";

    showImage(files[index].content);

}
else{

    imagePreview.style.display = "none";

    editor.style.display = "block";

    editor.value = files[index].content;

}

            renderFiles();  

            saveWorkspaceState();

        };

        t.querySelector(".tabClose").onclick=(e)=>{

            e.stopPropagation();

            if(openTabs.length===1) return;

            openTabs=openTabs.filter(i=>i!==index);

            if(selectedFile===index){

                selectedFile=openTabs[0];

                editor.value=files[selectedFile].content;

            }

            renderTabs();

        };

        tabs.appendChild(t);

    });

}

fileType.addEventListener("change",()=>{

    if(fileType.value==="image"){

        imagePicker.click();

    }

});

function showImage(src){

    editor.style.display = "none";

    imagePreview.src = src;

    imagePreview.style.display = "block";

}

saveProjectBtn.onclick=()=>{

    const project={

        files,
        folders,
        openTabs,
        selectedFile

    };

    const json=JSON.stringify(project,null,2);

    const blob=new Blob([json],{

        type:"application/json"

    });

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="MyProject.codeos";

    a.click();

    URL.revokeObjectURL(a.href);

};

loadProjectBtn.onclick=()=>{

    projectPicker.click();

};

projectPicker.addEventListener("change",(e)=>{

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=()=>{

        const project=JSON.parse(reader.result);

        files=project.files||[];

        folders=project.folders||[];

        openTabs=project.openTabs||[0];

        selectedFile=project.selectedFile||0;

        editor.value=files[selectedFile].content;

        renderFiles();

        renderTabs();

        saveWorkspaceState();

    };

    reader.readAsText(file);

});

function compileCode(code){

    let lines = code.split("\n");

    let compiled="";


    lines.forEach(line=>{


        line=line.trim();


        if(line==="") return;


        // comments

        if(line.startsWith("//")){

            return;

        }


        // say()

        if(line.startsWith("say(")){


            compiled += line + ";\n";


        }


    });


    return compiled;

}

document.getElementById("runBtn").onclick = () => {

    saveWorkspaceState();

    createTimelineSnapshot();

    localStorage.setItem(
        "codeosProgram",
        editor.value
    );

    localStorage.setItem(
        "codeosFiles",
        JSON.stringify(files)
    );

    openCodeOSProjectInNewTab();

};

function saveWorkspaceState(){

    localStorage.setItem(
        "codeosWorkspace",
        JSON.stringify({

            files,
            folders,
            openTabs,
            selectedFile

        })
    );

}

// ========================================
// 🌐 OPEN COMMUNITY PROJECT
// ========================================

const communityProjectId =
    new URLSearchParams(window.location.search)
        .get("communityProject");

async function loadCommunityProject() {

    if (!communityProjectId) return;

    console.log(
        "🌐 Community project requested:",
        communityProjectId
    );

    // Wait for Firebase to become available
    let attempts = 0;

    while (
        !window.codeosFirebase &&
        attempts < 100
    ) {

        await new Promise(resolve =>
            setTimeout(resolve, 100)
        );

        attempts++;
    }

    const firebase = window.codeosFirebase;

    if (!firebase) {

        console.error(
            "❌ Firebase never loaded."
        );

        alert(
            "❌ Could not connect to Firebase."
        );

        return;
    }

    console.log(
        "🔥 Firebase ready. Loading project..."
    );

    try {

        const snapshot =
    await firebase.get(
        firebase.ref(
            firebase.db,
            "codeosWorkspaces/" +
            communityProjectId
        )
    );

let project = null;

/* =========================================
   ☁️ FIREBASE VERSION
========================================= */

if (snapshot.exists()) {

    project =
        snapshot.val();

}

/* =========================================
   💾 LOCAL FALLBACK
========================================= */

if (!project) {

    try {

        const localProjects =
            JSON.parse(
                localStorage.getItem(
                    "codeosWorkspaces"
                ) || "[]"
            );

        const localProject =
            localProjects.find(
                workspace =>
                    workspace.id ===
                    communityProjectId
            );

        if (localProject) {

            project =
                structuredClone(
                    localProject
                );

            console.log(
                "💾 Loaded Community project from local workspace storage."
            );

            /* Try syncing it for future use */

            try {

                await firebase.set(
                    firebase.ref(
                        firebase.db,
                        "codeosWorkspaces/" +
                        communityProjectId
                    ),
                    project
                );

                console.log(
                    "☁️ Local workspace synced to Firebase."
                );

            } catch (syncError) {

                console.warn(
                    "⚠️ Could not sync local fallback:",
                    syncError
                );

            }

        }

    } catch (localError) {

        console.error(
            "❌ Local workspace lookup failed:",
            localError
        );

    }

}

/* =========================================
   ❌ NOTHING FOUND
========================================= */

if (!project) {

    console.error(
        "❌ Community project not found:",
        communityProjectId
    );

    alert(
        "❌ This CodeOS project could not be found."
    );

    return;

}

        console.log(
            "✅ EXACT COMMUNITY PROJECT DATA:",
            project
        );

        // ========================================
        // LOAD THE ACTUAL PROJECT
        // ========================================

        files = structuredClone(
            project.files || []
        );

        folders = structuredClone(
            project.folders || []
        );

        openTabs = structuredClone(
            project.openTabs ||
            (files.length ? [0] : [])
        );

        selectedFile =
            project.selectedFile ?? 0;

        // Safety check
        if (
            files.length === 0 ||
            selectedFile < 0 ||
            selectedFile >= files.length
        ) {

            selectedFile = 0;
        }

        // ========================================
        // SHOW THE ACTUAL FILE
        // ========================================

        if (files.length > 0) {

            const currentFile =
                files[selectedFile];

            if (currentFile.icon === "🖼") {

                editor.style.display = "none";

                showImage(
                    currentFile.content
                );

            } else {

                imagePreview.style.display =
                    "none";

                editor.style.display =
                    "block";

                editor.value =
                    currentFile.content;
            }
        }

        // ========================================
        // REFRESH CODEOS UI
        // ========================================

        renderFiles();

        renderTabs();

        saveWorkspaceState();

        console.log(
            "🚀 EXACT COMMUNITY PROJECT LOADED!"
        );

        console.log(
            "📁 Files:",
            files
        );

        console.log(
            "📄 Selected file:",
            files[selectedFile]
        );

        // Remove ?communityProject=... from URL
        window.history.replaceState(
            {},
            document.title,
            "workspace.html"
        );

    } catch (error) {

        console.error(
            "❌ Failed to load community project:",
            error
        );

        alert(
            "❌ Failed to load the community project."
        );
    }
}

loadCommunityProject();

function renderCommands(search=""){

    commandList.innerHTML="";

    const filtered = commands.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    if(filtered.length===0){

        commandList.innerHTML="<div class='command'>😔 No commands found.</div>";

        return;

    }

    filtered.forEach((command,index)=>{

        const div=document.createElement("div");

        div.className="command";

        if(index===selectedIndex){

            div.classList.add("selected");

        }

        div.innerHTML=`${command.icon} ${command.name}`;

        div.onclick=()=>command.action();

        div.onmouseenter=()=>{

            selectedIndex=index;

            renderCommands(input.value);

        };

        commandList.appendChild(div);

    });

}

renderCommands();

function showWorkspaceManager() {
    console.log("Open Workspace clicked!");

    renderWorkspaceList();

    workspaceOverlay.classList.remove("hidden");
}

function newWorkspace(){

    workspaceNameInput.value = "";

    newWorkspaceOverlay.classList.remove("hidden");

    workspaceNameInput.focus();

}

input.addEventListener("input",()=>{

    selectedIndex = 0;

    renderCommands(input.value);

});

overlay.addEventListener("click",(e)=>{

    if(e.target===overlay){

        overlay.classList.remove("show");

        input.value="";

    }

});

function renderWorkspaceList(){

    workspaceList.innerHTML = "";

    const workspaces = getWorkspaces();

    if(workspaces.length === 0){

        workspaceList.innerHTML = `
            <div class="workspaceEmpty">
                No workspaces yet.
            </div>
        `;

        return;
    }

    workspaces.forEach(workspace=>{

        const card=document.createElement("div");

        card.className="workspaceCard";

        card.innerHTML=`
            <div class="workspaceName">
                🚀 ${workspace.name}
            </div>

            <div class="workspaceInfo">
                📅 ${new Date(workspace.date).toLocaleString()}<br>
                📄 ${workspace.files.length} files
            </div>

            <div class="workspaceButtons">

    <button class="openBtn">
        Open
    </button>

    <button class="webforgeBtn" style="display:none;">
        ⚡ Open in WebForge
    </button>

    <button class="renameBtn">
        Rename
    </button>

    <button class="duplicateBtn">
        Duplicate
    </button>

    <button class="deleteBtn">
        Delete
    </button>

</div>
        `;

        const openBtn = card.querySelector(".openBtn");

        const webforgeBtn = card.querySelector(".webforgeBtn");

const hasHTML = workspace.files.some(file =>
    file.name.toLowerCase().endsWith(".html")
);

const hasCSS = workspace.files.some(file =>
    file.name.toLowerCase().endsWith(".css")
);

const hasJS = workspace.files.some(file =>
    file.name.toLowerCase().endsWith(".js")
);

const canOpenInWebForge =
    hasHTML && hasCSS && hasJS;

if (canOpenInWebForge) {

    webforgeBtn.style.display = "block";

}

webforgeBtn.onclick = (e) => {

    e.stopPropagation();

    if (!canOpenInWebForge) return;

    const htmlFile = workspace.files.find(file =>
        file.name.toLowerCase().endsWith(".html")
    );

    const cssFile = workspace.files.find(file =>
        file.name.toLowerCase().endsWith(".css")
    );

    const jsFile = workspace.files.find(file =>
        file.name.toLowerCase().endsWith(".js")
    );

    const webforgeProject = {

        workspaceName: workspace.name,

        html: htmlFile.content,

        css: cssFile.content,

        js: jsFile.content

    };

    localStorage.setItem(
        "webforgeProject",
        JSON.stringify(webforgeProject)
    );

    window.location.href = "webforge.html";

};

openBtn.onclick = (e) => {

    e.stopPropagation();

    files = workspace.files;
    folders = workspace.folders;
    openTabs = workspace.openTabs;
    selectedFile = workspace.selectedFile;

    editor.value = files[selectedFile].content;

    renderFiles();
    renderTabs();

    saveWorkspaceState();

    workspaceOverlay.classList.add("hidden");

};

const renameBtn = card.querySelector(".renameBtn");

renameBtn.onclick = (e) => {

    e.stopPropagation();

    const newName = prompt(
        "Rename workspace:",
        workspace.name
    );

    if(!newName) return;

    const list = getWorkspaces();

    const item = list.find(w => w.name === workspace.name);

    if(item){

        item.name = newName.trim();

    }

    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    renderWorkspaceList();

};

const duplicateBtn = card.querySelector(".duplicateBtn");

duplicateBtn.onclick = (e) => {

    e.stopPropagation();

    const list = getWorkspaces();

    const copy = structuredClone(workspace);

    copy.name += " Copy";

    copy.date = Date.now();

    list.push(copy);

    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    renderWorkspaceList();

};

const deleteBtn = card.querySelector(".deleteBtn");

deleteBtn.onclick = (e) => {

    e.stopPropagation();

    if(!confirm(`Delete "${workspace.name}"?`))
        return;

    let list = getWorkspaces();

    list = list.filter(
        w => w.name !== workspace.name
    );

    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    renderWorkspaceList();

};

        workspaceList.appendChild(card);

    });

}

newWorkspaceCard.onclick = () => {

    newWorkspace();

};

cancelWorkspace.onclick = () => {

    newWorkspaceOverlay.classList.add("hidden");

};

createWorkspaceBtn.onclick = () => {

    const name = workspaceNameInput.value.trim();

    if(!name){

        alert("Enter a workspace name.");

        return;

    }

    saveWorkspace(name);

    newWorkspaceOverlay.classList.add("hidden");

    renderWorkspaceList();

};

/* =========================================
   🕒 CODEOS TIMELINE
========================================= */

const timelineBtn = document.getElementById("timelineBtn");
const timelineOverlay = document.getElementById("timelineOverlay");
const timelineList = document.getElementById("timelineList");
const closeTimeline = document.getElementById("closeTimeline");


/*
    Get timeline snapshots
*/

function getTimeline() {

    return JSON.parse(
        localStorage.getItem("codeosTimeline") || "[]"
    );

}


/*
    Save timeline
*/

function saveTimeline(timeline) {

    localStorage.setItem(
        "codeosTimeline",
        JSON.stringify(timeline)
    );

}


/*
    Create a snapshot
*/

function createTimelineSnapshot() {

    if (!files || files.length === 0) {
        return;
    }

    const timeline = getTimeline();

    const snapshot = {

        id: Date.now(),

        date: Date.now(),

        files: structuredClone(files),

        folders: structuredClone(folders),

        openTabs: structuredClone(openTabs),

        selectedFile: selectedFile

    };

    // NEWEST VERSION GOES FIRST
    timeline.unshift(snapshot);

    // Keep only the newest 50
    if (timeline.length > 50) {
        timeline.splice(50);
    }

    saveTimeline(timeline);
}


/*
    Open Timeline
*/

function openTimeline() {

    renderTimeline();

    timelineOverlay.classList.remove("hidden");

}


/*
    Close Timeline
*/

function closeTimelineWindow() {

    timelineOverlay.classList.add("hidden");

}


/*
    Timeline button
*/

if (timelineBtn) {

    timelineBtn.onclick = () => {

        openTimeline();

    };

}


/*
    Close button
*/

if (closeTimeline) {

    closeTimeline.onclick = () => {

        closeTimelineWindow();

    };

}


/*
    Click outside popup
*/

if (timelineOverlay) {

    timelineOverlay.addEventListener("click", (e) => {

        if (e.target === timelineOverlay) {

            closeTimelineWindow();

        }

    });

}


/*
    ESC closes Timeline
*/

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        if (
            timelineOverlay &&
            !timelineOverlay.classList.contains("hidden")
        ) {

            closeTimelineWindow();

        }

    }

});


/*
    Render Timeline
*/

function renderTimeline() {

    timelineList.innerHTML = "";

    const timeline = getTimeline();


    /*
        No snapshots
    */

    if (timeline.length === 0) {

        timelineList.innerHTML = `

            <div class="timelineEmpty">

                <div class="timelineEmptyIcon">
                    🕒
                </div>

                <h3>No versions yet</h3>

                <p>
                    Start editing your project and
                    CodeOS will create timeline versions.
                </p>

            </div>

        `;

        return;

    }


    timeline.forEach((snapshot, index) => {

        const item = document.createElement("div");

        item.className = "timelineItem";


        /*
            The newest snapshot is the
            current version.
        */

        if (index === 0) {

            item.classList.add("current");

        }


        const date = new Date(snapshot.date);


        const formattedDate =
            date.toLocaleDateString([], {

                day: "numeric",

                month: "short",

                year: "numeric"

            });


        const formattedTime =
            date.toLocaleTimeString([], {

                hour: "2-digit",

                minute: "2-digit"

            });


        const totalFiles =
            snapshot.files?.length || 0;


        const totalFolders =
            snapshot.folders?.length || 0;


        item.innerHTML = `

            <div class="timelineItemHeader">

                <div>

                    <div class="timelineVersionName">

                        ${
                            index === 0
                                ? "🟢 Current Version"
                                : "🕒 Version " +
                                  (timeline.length - index)
                        }

                    </div>

                    <div class="timelineDate">

                        ${formattedDate}
                        at
                        ${formattedTime}

                    </div>

                </div>

                ${
                    index === 0
                        ? `
                            <div class="timelineCurrentBadge">
                                CURRENT
                            </div>
                          `
                        : ""
                }

            </div>


            <div class="timelineInfo">

                <span>
                    📄 ${totalFiles} files
                </span>

                <span>
                    📁 ${totalFolders} folders
                </span>

            </div>


            <div class="timelineActions">

                ${
                    index !== 0
                        ? `
                            <button
                                class="timelineRestore"
                                data-id="${snapshot.id}"
                            >
                                ↩ Restore
                            </button>
                          `
                        : ""
                }

                ${
                    index !== 0
                        ? `
                            <button
                                class="timelineDelete"
                                data-delete="${snapshot.id}"
                            >
                                🗑 Delete
                            </button>
                          `
                        : ""
                }

            </div>

        `;


        /*
            Restore button
        */

        const restoreBtn =
            item.querySelector(".timelineRestore");


        if (restoreBtn) {

            restoreBtn.onclick = () => {

                restoreTimelineSnapshot(
                    snapshot.id
                );

            };

        }


        /*
            Delete button
        */

        const deleteBtn =
            item.querySelector(".timelineDelete");


        if (deleteBtn) {

            deleteBtn.onclick = () => {

                deleteTimelineSnapshot(
                    snapshot.id
                );

            };

        }


        timelineList.appendChild(item);

    });

}


/*
    Restore version
*/

function restoreTimelineSnapshot(id) {

    const timeline = getTimeline();

    const snapshot = timeline.find(
        version => version.id === id
    );

    if (!snapshot) {
        alert("Timeline version not found.");
        return;
    }

    const confirmed = confirm(
        "Restore this version?\n\n" +
        "Your current workspace will be backed up first."
    );

    if (!confirmed) {
        return;
    }

    // --------------------------------
    // BACK UP CURRENT VERSION
    // --------------------------------

    createTimelineSnapshot();

    // --------------------------------
    // RESTORE SNAPSHOT
    // --------------------------------

    files = structuredClone(snapshot.files || []);

    folders = structuredClone(snapshot.folders || []);

    openTabs = structuredClone(snapshot.openTabs || []);

    selectedFile = snapshot.selectedFile ?? 0;

    // Safety
    if (
        files.length === 0 ||
        selectedFile < 0 ||
        selectedFile >= files.length
    ) {
        selectedFile = 0;
    }

    // --------------------------------
    // UPDATE EDITOR
    // --------------------------------

    if (files.length > 0) {

        const currentFile = files[selectedFile];

        if (currentFile.icon === "🖼") {

            editor.style.display = "none";

            showImage(currentFile.content);

        } else {

            imagePreview.style.display = "none";

            editor.style.display = "block";

            editor.value = currentFile.content;

        }

    }

    // --------------------------------
    // UPDATE UI
    // --------------------------------

    renderFiles();

    renderTabs();

    saveWorkspaceState();

    // --------------------------------
    // UPDATE TIMELINE
    // --------------------------------

    renderTimeline();

    alert("↩️ Timeline version restored!");
}


/*
    Delete version
*/

function deleteTimelineSnapshot(id) {

    const confirmed = confirm(
        "Delete this timeline version?"
    );


    if (!confirmed) {

        return;

    }


    let timeline = getTimeline();


    timeline = timeline.filter(
        snapshot => snapshot.id !== id
    );


    saveTimeline(timeline);


    renderTimeline();

}

/* =========================================================
   💡 CODEOS SMART CODE SUGGESTIONS
   ========================================================= */

(function(){

    // Don't initialize twice
    if(window.__codeosAutocompleteLoaded) return;
    window.__codeosAutocompleteLoaded = true;

    const codeosEditor = document.querySelector("textarea");

    if(!codeosEditor) return;

    /* -----------------------------------------------------
       📚 CODEOS LANGUAGE DEFINITION
       ----------------------------------------------------- */

    const codeosLanguage = [

        {
            word:"say",
            icon:"💬",
            description:"Print text to the output.",
            insert:'say "Hello"',
            category:"Output"
        },

        {
            word:"ask",
            icon:"💬",
            description:"Ask the user for input.",
            insert:'ask "What is your name?" text name',
            category:"Input"
        },

        {
            word:"is",
            icon:"📦",
            description:"Create or change a variable.",
            insert:"name is value",
            category:"Variables"
        },

        {
            word:"plus",
            icon:"➕",
            description:"Add two values.",
            insert:"a is b plus c",
            category:"Math"
        },

        {
            word:"minus",
            icon:"➖",
            description:"Subtract two values.",
            insert:"a is b minus c",
            category:"Math"
        },

        {
            word:"multiply",
            icon:"✖️",
            description:"Multiply two values.",
            insert:"a is b multiply c",
            category:"Math"
        },

        {
            word:"divide",
            icon:"➗",
            description:"Divide two values.",
            insert:"a is b divide c",
            category:"Math"
        },

        {
            word:"square",
            icon:"²",
            description:"Square a number.",
            insert:"result is square number",
            category:"Math"
        },

        {
            word:"sqrt",
            icon:"√",
            description:"Find the square root.",
            insert:"result is sqrt number",
            category:"Math"
        },

        {
            word:"floor",
            icon:"⬇️",
            description:"Round a number down.",
            insert:"result is floor number",
            category:"Math"
        },

        {
            word:"ceiling",
            icon:"⬆️",
            description:"Round a number up.",
            insert:"result is ceiling number",
            category:"Math"
        },

        {
            word:"random",
            icon:"🎲",
            description:"Generate a random number.",
            insert:"number is random 1 to 10",
            category:"Math"
        },

        {
            word:"if",
            icon:"🧠",
            description:"Run code when a condition is true.",
            insert:'if score is 10\nsay "Winner!"\nend',
            category:"Logic"
        },

        {
            word:"else",
            icon:"😎",
            description:"Run code when an IF condition is false.",
            insert:"else",
            category:"Logic"
        },

        {
            word:"else if",
            icon:"🤔",
            description:"Check another condition.",
            insert:"else if score is 5",
            category:"Logic"
        },

        {
            word:"and",
            icon:"🔗",
            description:"Require multiple conditions.",
            insert:"if score is 10 and lives is 3",
            category:"Logic"
        },

        {
            word:"or",
            icon:"🔀",
            description:"Allow either condition to be true.",
            insert:"if score is 10 or lives is 3",
            category:"Logic"
        },

        {
            word:"not",
            icon:"🚫",
            description:"Reverse a condition.",
            insert:"if not gameOver",
            category:"Logic"
        },

        {
            word:"contains",
            icon:"🔎",
            description:"Check whether text contains something.",
            insert:"if name contains \"a\"",
            category:"Logic"
        },

        {
            word:"repeat",
            icon:"🔁",
            description:"Repeat code a specific number of times.",
            insert:"repeat 5\nsay \"Hello\"\nend",
            category:"Loops"
        },

        {
            word:"repeat until",
            icon:"🔁",
            description:"Repeat code until a condition becomes true.",
            insert:"repeat until score is 10\nscore is score plus 1\nend",
            category:"Loops"
        },

        {
            word:"forever",
            icon:"♾️",
            description:"Run a block forever.",
            insert:'forever\nsay "Running"\nend',
            category:"Loops"
        },

        {
            word:"while",
            icon:"🌀",
            description:"Repeat while a condition is true.",
            insert:"while lives is not 0\nsay lives\nend",
            category:"Loops"
        },

        {
            word:"wait",
            icon:"⏳",
            description:"Pause the program.",
            insert:"wait for 1 seconds",
            category:"Timing"
        },

        {
            word:"wait until",
            icon:"⏳",
            description:"Wait until a condition becomes true.",
            insert:"wait until score is 10",
            category:"Timing"
        },

        {
            word:"function",
            icon:"⚙️",
            description:"Create a reusable function.",
            insert:'function Hello\nsay "Hello"\nend',
            category:"Functions"
        },

        {
            word:"do",
            icon:"🚀",
            description:"Run a function.",
            insert:"do Hello",
            category:"Functions"
        },

        {
            word:"return",
            icon:"↩️",
            description:"Return a value from a function.",
            insert:"return score",
            category:"Functions"
        },

        {
            word:"colour",
            icon:"🎨",
            description:"Change output text colour.",
            insert:"colour is cyan",
            category:"Appearance"
        },

        {
            word:"image",
            icon:"🖼️",
            description:"Set an image.",
            insert:'image is "image.png"',
            category:"Images"
        },

        {
            word:"show image",
            icon:"🖼️",
            description:"Display the selected image.",
            insert:"show image",
            category:"Images"
        },

        {
            word:"create sprite",
            icon:"👾",
            description:"Create a sprite.",
            insert:"create sprite hero",
            category:"Sprites"
        },

        {
            word:"pressed",
            icon:"⌨️",
            description:"Check whether a keyboard key is pressed.",
            insert:"if space pressed",
            category:"Input"
        },

        {
            word:"clicked",
            icon:"🖱️",
            description:"Check whether a sprite was clicked.",
            insert:"if hero clicked",
            category:"Input"
        }

    ];

    window.CodeOSLanguage = codeosLanguage;


    /* -----------------------------------------------------
       🎨 AUTOCOMPLETE UI
       ----------------------------------------------------- */

    const codeosAutocompleteStyle = document.createElement("style");

    codeosAutocompleteStyle.textContent = `
        #codeosAutocompleteBox{
            position:absolute;
            z-index:99999;
            width:360px;
            max-height:300px;
            overflow-y:auto;
            background:#111827;
            border:1px solid rgba(255,255,255,.12);
            border-radius:12px;
            box-shadow:0 15px 45px rgba(0,0,0,.45);
            padding:6px;
            display:none;
            color:white;
            font-family:Arial,sans-serif;
        }

        .codeosSuggestion{
            padding:10px 12px;
            border-radius:9px;
            cursor:pointer;
            display:flex;
            align-items:center;
            gap:10px;
        }

        .codeosSuggestion:hover,
        .codeosSuggestion.active{
            background:rgba(255,255,255,.1);
        }

        .codeosSuggestionIcon{
            width:28px;
            text-align:center;
            font-size:18px;
        }

        .codeosSuggestionMain{
            flex:1;
            min-width:0;
        }

        .codeosSuggestionName{
            font-weight:700;
            font-size:14px;
        }

        .codeosSuggestionDescription{
            opacity:.6;
            font-size:11px;
            margin-top:2px;
        }

        .codeosSuggestionCategory{
            opacity:.45;
            font-size:10px;
        }

        .codeosHint{
            color:#8ab4ff;
        }
    `;

    document.head.appendChild(codeosAutocompleteStyle);


    const codeosAutocompleteBox = document.createElement("div");

    codeosAutocompleteBox.id = "codeosAutocompleteBox";

    document.body.appendChild(codeosAutocompleteBox);


    let codeosAutocompleteIndex = 0;
    let codeosSuggestions = [];


    /* -----------------------------------------------------
       📍 POSITION POPUP
       ----------------------------------------------------- */

    function codeosPositionAutocomplete(){

        const rect = codeosEditor.getBoundingClientRect();

        codeosAutocompleteBox.style.left =
            (window.scrollX + rect.left + 10) + "px";

        codeosAutocompleteBox.style.top =
            (window.scrollY + rect.top + 45) + "px";

    }


    /* -----------------------------------------------------
       📦 GET VARIABLES
       ----------------------------------------------------- */

    function codeosGetVariables(){

        const variables = [];

        const lines = codeosEditor.value.split("\n");

        lines.forEach(line=>{

            const match = line.match(
                /^\s*([A-Za-z_][A-Za-z0-9_]*)\s+is\s+/
            );

            if(match){

                const name = match[1];

                if(!variables.includes(name)){
                    variables.push(name);
                }

            }

        });

        return variables;

    }


    /* -----------------------------------------------------
       ⚙️ GET FUNCTIONS
       ----------------------------------------------------- */

    function codeosGetFunctions(){

        const functions = [];

        codeosEditor.value
            .split("\n")
            .forEach(line=>{

                const match =
                    line.match(/^\s*function\s+(.+)/);

                if(match){

                    const name = match[1].trim();

                    if(!functions.includes(name)){
                        functions.push(name);
                    }

                }

            });

        return functions;

    }


    /* -----------------------------------------------------
       🧠 CONTEXT DETECTION
       ----------------------------------------------------- */

    function codeosGetContext(){

        const lines =
            codeosEditor.value.split("\n");

        const currentLine =
            lines[codeosEditor.value
                .substring(
                    0,
                    codeosEditor.selectionStart
                )
                .split("\n").length - 1] || "";

        const trimmed = currentLine.trim();

        return {
            line:trimmed,
            variables:codeosGetVariables(),
            functions:codeosGetFunctions()
        };

    }


    /* -----------------------------------------------------
       💡 GENERATE SUGGESTIONS
       ----------------------------------------------------- */

    function codeosGenerateSuggestions(){

        const context = codeosGetContext();

        const line = context.line;

        const words = line.split(/\s+/);

        const currentWord =
            words[words.length - 1]
                .toLowerCase();

        let suggestions = [];


        /* Empty line */

        if(!currentWord){

    return [];

}

        else{

            suggestions =
                codeosLanguage.filter(item=>

                    item.word
                        .toLowerCase()
                        .startsWith(currentWord)

                );

        }


        /* -------------------------------------------------
           🧠 CONTEXT-AWARE PRIORITY
           ------------------------------------------------- */

        if(line.startsWith("if ")){

            const priority = [
                "and",
                "or",
                "not",
                "contains",
                "else",
                "end"
            ];

            suggestions.sort((a,b)=>{

                return (
                    priority.indexOf(a.word) -
                    priority.indexOf(b.word)
                );

            });

        }


        if(line.startsWith("repeat ")){

            suggestions =
                suggestions.concat(
                    codeosLanguage.filter(x=>
                        ["say","wait","if","end"]
                            .includes(x.word)
                    )
                );

        }


        if(line.startsWith("function ")){

            suggestions =
                suggestions.filter(x=>
                    x.word === "end"
                );

        }


        /* -------------------------------------------------
           📦 VARIABLE SUGGESTIONS
           ------------------------------------------------- */

        context.variables.forEach(variable=>{

            if(
                variable
                    .toLowerCase()
                    .startsWith(currentWord)
            ){

                suggestions.push({

                    word:variable,
                    icon:"📦",
                    description:"Your variable",
                    insert:variable,
                    category:"Variable"

                });

            }

        });


        /* -------------------------------------------------
           ⚙️ FUNCTION SUGGESTIONS
           ------------------------------------------------- */

        context.functions.forEach(func=>{

            if(
                func
                    .toLowerCase()
                    .startsWith(currentWord)
            ){

                suggestions.push({

                    word:func,
                    icon:"⚙️",
                    description:"Your function",
                    insert:func,
                    category:"Function"

                });

            }

        });


        /* Remove duplicates */

        const seen = new Set();

        suggestions =
            suggestions.filter(item=>{

                if(seen.has(item.word)) return false;

                seen.add(item.word);

                return true;

            });


        return suggestions.slice(0,8);

    }


    /* -----------------------------------------------------
       🖥️ RENDER
       ----------------------------------------------------- */

    function codeosRenderSuggestions(){

        codeosSuggestions =
            codeosGenerateSuggestions();

        codeosAutocompleteBox.innerHTML = "";

        if(!codeosSuggestions.length){

            codeosAutocompleteBox.style.display="none";

            return;

        }

        codeosSuggestions.forEach((item,index)=>{

            const div =
                document.createElement("div");

            div.className =
                "codeosSuggestion" +
                (index===0 ? " active":"");

            div.innerHTML = `
                <div class="codeosSuggestionIcon">
                    ${item.icon}
                </div>

                <div class="codeosSuggestionMain">

                    <div class="codeosSuggestionName">
                        ${item.word}
                    </div>

                    <div class="codeosSuggestionDescription">
                        ${item.description}
                    </div>

                </div>

                <div class="codeosSuggestionCategory">
                    ${item.category}
                </div>
            `;

            div.onclick = ()=>{

                codeosAcceptSuggestion(index);

            };

            codeosAutocompleteBox.appendChild(div);

        });

        codeosAutocompleteIndex=0;

        codeosPositionAutocomplete();

        codeosAutocompleteBox.style.display="block";

    }


    /* -----------------------------------------------------
       ✍️ ACCEPT
       ----------------------------------------------------- */

    function codeosAcceptSuggestion(index){

        const suggestion =
            codeosSuggestions[index];

        if(!suggestion) return;

        const start =
            codeosEditor.selectionStart;

        const before =
            codeosEditor.value.substring(0,start);

        const match =
            before.match(/[A-Za-z_][A-Za-z0-9 ]*$/);

        let replaceStart = start;

        if(match){

            replaceStart =
                start - match[0].length;

        }

        const insert =
            suggestion.insert;

        codeosEditor.value =
            codeosEditor.value.substring(
                0,
                replaceStart
            ) +
            insert +
            codeosEditor.value.substring(
                start
            );

        const cursor =
            replaceStart + insert.length;

        codeosEditor.selectionStart = cursor;
        codeosEditor.selectionEnd = cursor;

        codeosEditor.dispatchEvent(
            new Event("input",{bubbles:true})
        );

        codeosAutocompleteBox.style.display="none";

        codeosEditor.focus();

    }


    /* -----------------------------------------------------
       ⌨️ KEYBOARD
       ----------------------------------------------------- */

    codeosEditor.addEventListener(
        "input",
        ()=>{

            codeosRenderSuggestions();

        }
    );


    codeosEditor.addEventListener(
        "keydown",
        event=>{

            if(
                codeosAutocompleteBox.style.display !==
                "block"
            ) return;


            if(event.key==="ArrowDown"){

                event.preventDefault();

                codeosAutocompleteIndex =
                    Math.min(
                        codeosAutocompleteIndex + 1,
                        codeosSuggestions.length - 1
                    );

                codeosUpdateActive();

            }


            else if(event.key==="ArrowUp"){

                event.preventDefault();

                codeosAutocompleteIndex =
                    Math.max(
                        codeosAutocompleteIndex - 1,
                        0
                    );

                codeosUpdateActive();

            }


            else if(event.key==="Tab"){

    event.preventDefault();

    codeosAcceptSuggestion(
        codeosAutocompleteIndex
    );

}

else if(event.key==="Enter"){

    // Only accept autocomplete if the user is
    // actually typing a word that matches a suggestion.
    const before =
        codeosEditor.value.substring(
            0,
            codeosEditor.selectionStart
        );

    const match =
        before.match(/[A-Za-z_][A-Za-z0-9_]*$/);

    if(match && codeosSuggestions.length > 0){

        event.preventDefault();

        codeosAcceptSuggestion(
            codeosAutocompleteIndex
        );

    }
    else{

        // Normal Enter
        codeosAutocompleteBox.style.display="none";

    }

}


            else if(event.key==="Escape"){

                codeosAutocompleteBox.style.display=
                    "none";

            }

        }
    );


    function codeosUpdateActive(){

        [...codeosAutocompleteBox.children]
            .forEach((child,index)=>{

                child.classList.toggle(
                    "active",
                    index===codeosAutocompleteIndex
                );

            });

    }


    /* -----------------------------------------------------
       🧩 SNIPPET MENU
       ----------------------------------------------------- */

    window.codeosInsertSnippet =
        function(type){

            const snippets = {

                if:
`if score is 10
say "Winner!"
end`,

                repeat:
`repeat 5
say "Hello"
end`,

                while:
`while lives is not 0
say lives
lives is lives minus 1
end`,

                function:
`function Hello
say "Hello"
end
do Hello`,

                sprite:
`create sprite hero
hero image is "hero.png"
hero x is 200
hero y is 100`,

                game:
`score is 0
repeat 10
score is score plus 1
end
say score`

            };

            const snippet =
                snippets[type];

            if(!snippet) return;

            const start =
                codeosEditor.selectionStart;

            const end =
                codeosEditor.selectionEnd;

            codeosEditor.value =
                codeosEditor.value.substring(0,start) +
                snippet +
                codeosEditor.value.substring(end);

            codeosEditor.selectionStart =
                start + snippet.length;

            codeosEditor.selectionEnd =
                start + snippet.length;

            codeosEditor.dispatchEvent(
                new Event("input",{bubbles:true})
            );

            codeosEditor.focus();

        };


    /* -----------------------------------------------------
       🐛 SMART EDITOR CHECK
       ----------------------------------------------------- */

    window.codeosCheckCode =
        function(){

            const lines =
                codeosEditor.value.split("\n");

            const errors=[];

            const blocks=[];

            lines.forEach((raw,index)=>{

                const line=raw.trim();

                if(!line) return;


                /* Block starters */

                if(
                    line.startsWith("if ") ||
                    line.startsWith("repeat ") ||
                    line.startsWith("while ") ||
                    line==="forever" ||
                    line.startsWith("function ") ||
                    line.startsWith("repeat until ")
                ){

                    blocks.push({
                        line:index + 1,
                        type:line.split(" ")[0]
                    });

                }


                if(line==="end"){

                    if(!blocks.length){

                        errors.push(
                            `Line ${index+1}: unexpected "end".`
                        );

                    }
                    else{

                        blocks.pop();

                    }

                }


                /* Common typos */

                const typoMap={

                    "repat":"repeat",
                    "repeet":"repeat",
                    "forevr":"forever",
                    "funtion":"function",
                    "whlie":"while",
                    "retrun":"return",
                    "sya":"say",
                    "waut":"wait"

                };


                const firstWord =
                    line.split(/\s+/)[0];

                if(typoMap[firstWord]){

                    errors.push(
                        `Line ${index+1}: did you mean "${typoMap[firstWord]}"?`
                    );

                }

            });


            blocks.forEach(block=>{

                errors.push(
                    `Line ${block.line}: "${block.type}" is missing "end".`
                );

            });


            return errors;

        };


    /* -----------------------------------------------------
       🚨 CHECK BEFORE RUNNING
       ----------------------------------------------------- */

    const originalRunButton =
        document.getElementById("runBtn");

    if(originalRunButton){

        originalRunButton.addEventListener(
            "click",
            event=>{

                const errors =
                    window.codeosCheckCode();

                if(errors.length){

                    const proceed =
                        confirm(
                            "⚠️ CodeOS found possible problems:\n\n" +
                            errors.join("\n") +
                            "\n\nRun anyway?"
                        );

                    if(!proceed){

                        event.stopImmediatePropagation();

                    }

                }

            },
            true
        );

    }


    console.log(
        "💡 CodeOS Smart Suggestions loaded"
    );

})();

/* =========================================================
   🤖 CODEOS AI
   ========================================================= */

(function () {

    const aiOverlay = document.getElementById("aiOverlay");
    const aiBtn = document.getElementById("aiBtn");
    const closeAiBtn = document.getElementById("closeAiBtn");
    const aiInput = document.getElementById("aiInput");
    const aiSendBtn = document.getElementById("aiSendBtn");
    const aiMessages = document.getElementById("aiMessages");

    if (!aiOverlay || !aiInput || !aiSendBtn || !aiMessages) {
        console.error("CodeOS AI: AI elements not found.");
        return;
    }

    /* ---------------------------------------------------------
       OPEN / CLOSE
       --------------------------------------------------------- */

    function openAI() {
        aiOverlay.classList.remove("hidden");
        aiInput.focus();
    }

    function closeAI() {
        aiOverlay.classList.add("hidden");
    }

    if (aiBtn) {
        aiBtn.addEventListener("click", openAI);
    }

    if (closeAiBtn) {
        closeAiBtn.addEventListener("click", closeAI);
    }

    aiOverlay.addEventListener("click", event => {
        if (event.target === aiOverlay) {
            closeAI();
        }
    });


    /* ---------------------------------------------------------
       ADD MESSAGE
       --------------------------------------------------------- */

    function addAIMessage(text, type) {

        const message = document.createElement("div");

        message.className =
            type === "user"
                ? "aiMessage user"
                : "aiMessage ai";

        if (type === "user") {

            message.innerHTML = `
                <div class="aiBubble">
                    ${escapeAIHTML(text)}
                </div>
            `;

        } else {

            message.innerHTML = `
                <div class="aiAvatar">🤖</div>
                <div class="aiBubble">
                    ${escapeAIHTML(text)}
                </div>
            `;

        }

        aiMessages.appendChild(message);

        aiMessages.scrollTop = aiMessages.scrollHeight;

        return message;
    }


    /* ---------------------------------------------------------
       SAFE TEXT
       --------------------------------------------------------- */

    function escapeAIHTML(text) {

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, "<br>");

    }


    /* ---------------------------------------------------------
       GET CURRENT CODE
       --------------------------------------------------------- */

    function getCurrentCode() {

        const editor = document.querySelector("textarea");

        if (!editor) {
            return "";
        }

        return editor.value;

    }


    /* ---------------------------------------------------------
       SEND MESSAGE
       --------------------------------------------------------- */

    async function sendAIMessage() {

         /* =====================================================
       👑 CODEOS PLUS+ AI LIMIT
    ===================================================== */

    if (
        window.CodeOSPlus &&
        !window.CodeOSPlus.canUseAI()
    ) {

        addAIMessage(
            "🔒 You've used your 2 free AI messages.\n\n" +
            "👑 Upgrade to CDX Plus+ for unlimited AI, " +
            "AI code editing, DevTools access, and your Plus+ badge.",
            "ai"
        );

        if (
            window.CodeOSPlus.openPlusPage
        ) {
            setTimeout(() => {
                window.CodeOSPlus.openPlusPage();
            }, 500);
        }

        return;

    }

    const prompt = aiInput.value.trim();

    if (!prompt) return;

        /* =====================================================
       👑 RECORD FREE AI MESSAGE
    ===================================================== */

    if (
        window.CodeOSPlus
    ) {

        const allowed =
            window.CodeOSPlus.recordAIMessage();

        if (!allowed) {

            addAIMessage(
                "🔒 You've reached the free AI limit.\n\n" +
                "Upgrade to CDX Plus+ to continue.",
                "ai"
            );

            return;

        }

    }

    const projectContext = getCodeOSProjectContext();

    function getCodeOSProjectContext() {

    const currentEditor = document.querySelector("textarea");

    const currentCode =
        currentEditor ? currentEditor.value : "";

    const currentFile =
        files[selectedFile] || null;

    const projectFiles = files.map((file, index) => {

        return {
            index,
            name: file.name,
            type: file.name.split(".").pop(),
            folder: file.folder ?? null,
            content: file.content || "",
            isCurrentFile: index === selectedFile
        };

    });

    return {
        workspace: localStorage.getItem("codeosWorkspace") || "CodeOS Workspace",

        currentFile: currentFile
            ? currentFile.name
            : "Unknown",

        currentCode,

        folders: folders.map(folder => ({
            name: folder.name,
            parent: folder.parent ?? null
        })),

        files: projectFiles
    };
}

    addAIMessage(prompt, "user");
    aiInput.value = "";

    const thinkingMessage = addAIMessage(
        "Thinking... 🤔",
        "ai"
    );

    try {

        // ============================================
        // OPENROUTER
        // ============================================

        console.log("🤖 CodeOS AI: sending request...");

        const response = await fetch(
            "http://localhost:3000/api/ai",
            {
                method: "POST",

                headers: {
    "Content-Type": "application/json"
},

                body: JSON.stringify({

                    model:
    "openrouter/free",

                    messages: [

                        {
                            role: "system",

                            content: `
You are CodeOS AI, the built-in AI assistant for the CodeOS programming environment.

==================================================
🚨 MOST IMPORTANT RULE
==================================================

CodeOS uses a custom language called CDX.

CDX is NOT JavaScript.
CDX is NOT Python.
CDX is NOT Scratch.
CDX is NOT pseudocode.

When generating, explaining, debugging, or modifying CodeOS programs,
use ONLY syntax that the actual CodeOS runner supports.

Never replace CDX with JavaScript.

Never invent syntax.

The actual CodeOS runner is the source of truth.

==================================================
1. OUTPUT
==================================================

Syntax:

say "Hello"

Variables can be displayed:

say score

Multiple values:

say "Score:" score

Do NOT write:

say("Hello")

for CodeOS code.

==================================================
2. VARIABLES
==================================================

Create a variable:

name is "Rivaan"
score is 10
lives is 3

Copy another variable:

other is score

The normal assignment pattern is:

variable is value

==================================================
3. ADDITION
==================================================

Syntax:

result is a plus b

Example:

score is score plus 1

==================================================
4. SUBTRACTION
==================================================

Syntax:

result is a minus b

Example:

lives is lives minus 1

==================================================
5. MULTIPLICATION
==================================================

Syntax:

result is a multiply b

Example:

total is price multiply quantity

==================================================
6. DIVISION
==================================================

Syntax:

result is a divide b

Division by zero is invalid.

==================================================
7. ADVANCED MATH
==================================================

Square:

result is square number

Square root:

result is sqrt number

Floor:

result is floor number

Ceiling:

result is ceiling number

==================================================
8. RANDOM
==================================================

Syntax:

number is random 1 to 10

This creates an integer between the two limits.

==================================================
9. IF
==================================================

Syntax:

if condition
    code
end

Example:

if score is 10
    say "Winner!"
end

==================================================
10. ELSE
==================================================

if score is 10
    say "Winner!"
else
    say "Try again"
end

==================================================
11. ELSE IF
==================================================

if score is 10
    say "Perfect"
else if score is 5
    say "Halfway"
else
    say "Other"
end

==================================================
12. CONDITIONS
==================================================

Equality:

score is 10

Inequality:

score is not 10

Greater than:

score is greater than 10

Less than:

score is less than 10

Greater than or equal:

score is greater than or equal to 10

Less than or equal:

score is less than or equal to 10

==================================================
13. LOGICAL OPERATORS
==================================================

AND:

if score is 10 and lives is 3
    say "Both"
end

OR:

if score is 10 or lives is 3
    say "One is correct"
end

NOT:

if not gameOver
    say "Running"
end

==================================================
14. CONTAINS
==================================================

Syntax:

if name contains "a"
    say "Found"
end

==================================================
15. REPEAT
==================================================

Syntax:

repeat 5
    say "Hello"
end

==================================================
16. REPEAT UNTIL
==================================================

Syntax:

repeat until score is 10
    score is score plus 1
end

==================================================
17. FOREVER
==================================================

Syntax:

forever
    say "Running"
end

==================================================
18. WHILE
==================================================

Syntax:

while lives is not 0
    say lives
    lives is lives minus 1
end

==================================================
19. WAIT
==================================================

Syntax:

wait for 1 seconds

==================================================
20. WAIT UNTIL
==================================================

Syntax:

wait until score is 10

==================================================
21. FUNCTIONS
==================================================

Create:

function hello
    say "Hello"
end

Run:

do hello

==================================================
22. RETURN
==================================================

Example:

function getScore
    return score
end

A function result can be stored:

result is do getScore

==================================================
23. ASK
==================================================

Syntax:

ask "What is your name?" text name

Supported types:

number
text
boolean

Examples:

ask "Age?" number age

ask "Name?" text name

ask "Ready?" boolean ready

==================================================
24. IMAGES
==================================================

Set an image:

image is "image.png"

Show it:

show image

The image should exist in the CodeOS project files.

==================================================
25. SPRITES
==================================================

Create:

create sprite hero

Set image:

hero image is "player.png"

Set X:

hero x is 100

Set Y:

hero y is 200

Set size:

hero size is 64

==================================================
26. SPRITE CLICKED
==================================================

if hero clicked
    say "Hero clicked!"
end

The runner consumes a successful click event.

==================================================
27. KEYBOARD INPUT
==================================================

Example:

if space pressed
    say "Space pressed"
end

Supported normalized keys include:

space
up
down
left
right
enter
escape
shift
ctrl
alt
backspace
tab

==================================================
28. COLOUR
==================================================

Syntax:

colour is cyan

This changes the CodeOS output text colour.

==================================================
29. BLOCK STRUCTURE
==================================================

CDX blocks use:

if
...
end

repeat
...
end

repeat until
...
end

while
...
end

forever
...
end

function
...
end

CDX does NOT use braces.

Do NOT generate:

{
}

Do NOT generate JavaScript control structures.

==================================================
30. CDX EXAMPLES
==================================================

Correct:

score is 0

repeat 10
    score is score plus 1
end

say score

Correct:

create sprite hero
hero x is 100
hero y is 200

Correct:

if left pressed
    hero x is 50
end

Incorrect:

score = score + 1

Incorrect:

if (score > 10) {
}

Incorrect:

console.log(score)

==================================================
31. EXTENSIONS
==================================================

CodeOS supports installed extensions.

Extensions may register additional commands through the CodeOS extension API.

Extension commands can therefore exist in a project even though they are not built into the base CDX runner.

If a command is supplied by an installed extension, treat it as an extension command rather than pretending it is a built-in CDX command.

Never invent an extension command without evidence from the project.

==================================================
32. PROJECT CONTEXT
==================================================

The user may provide complete CodeOS project data.

When answering a project question:

1. Read the actual project files supplied in context.
2. Identify the relevant file.
3. Use the actual contents.
4. Explain the code according to CDX.
5. Never invent file contents.
6. Never assume CDX behaves like JavaScript.
7. If a file does not exist, say so.

==================================================
33. DEBUGGING
==================================================

When debugging:

- Compare the user's code with the actual CDX syntax.
- Check block endings.
- Check variable names.
- Check supported commands.
- Check conditions.
- Check whether referenced files exist.
- Do not "fix" CDX by converting it into another language.

==================================================
34. CODE GENERATION
==================================================

When the user asks for CodeOS code:

- Output real CDX.
- Keep syntax compatible with the runner.
- Do not wrap normal CDX commands in JavaScript.
- Do not use semicolons.
- Do not use braces.
- Do not invent unsupported commands.

==================================================
35. AI EDITING MODE
==================================================

The CodeOS AI may eventually be given permission to modify files.

When that capability is available, edits must be based on the actual project context.

Never claim a file was changed unless the application actually performed the edit.

==================================================
36. HONESTY
==================================================

If the runner does not currently support something:

Say that it is not currently supported.

Do not invent syntax just to satisfy the user.

==================================================
37. FINAL RULE
==================================================

When in doubt, trust the actual CodeOS runner behavior over assumptions.

CDX is a real custom language with its own syntax.

Write CDX as CDX.

==================================================
38. REAL FILE EDITING
==================================================

You have access to a real CodeOS workspace.

The user may ask you to modify their files.

When the user asks you to change, fix, rewrite, improve,
add to, or create CodeOS project code, you MUST return
a machine-readable edit payload.

DO NOT merely describe the changes.

DO NOT say that you changed a file unless you provide
the edit payload.

==================================================
39. REQUIRED EDIT FORMAT
==================================================

For one file:

<CODEOS_EDIT>
{
    "type": "update_file",
    "file": "main.cdx",
    "content": "COMPLETE NEW FILE CONTENT"
}
</CODEOS_EDIT>

For several files:

<CODEOS_EDIT>
{
    "operations": [
        {
            "type": "update_file",
            "file": "main.cdx",
            "content": "COMPLETE NEW FILE CONTENT"
        },
        {
            "type": "create_file",
            "file": "Player.cdx",
            "content": "COMPLETE FILE CONTENT"
        }
    ]
}
</CODEOS_EDIT>

==================================================
40. CRITICAL EDIT RULE
==================================================

When updating a file, ALWAYS provide the COMPLETE
new content of the file.

Never provide only the changed lines.

Never provide a patch.

Never provide a diff.

The CodeOS application replaces the file content
with the content in the payload.

==================================================
41. WHEN TO EDIT
==================================================

If the user says:

"fix my code"

"change this"

"add a feature"

"make the player move"

"rewrite this"

"improve this"

"remove this"

"make it work"

"create a file"

"change main.cdx"

or anything with a clear request to modify the project,

you MUST produce a CODEOS_EDIT payload.

==================================================
42. WHEN NOT TO EDIT
==================================================

If the user asks only:

"what does this do?"

"explain this"

"why is this broken?"

"what is CDX?"

"how do I do this?"

then DO NOT produce an edit payload unless they
specifically ask you to make the change.

==================================================
43. CDX EDITING
==================================================

All generated CodeOS code MUST follow the actual CDX
runner syntax defined in this system prompt.

Never replace CDX with JavaScript.

Never use:

=

{}

;

console.log()

JavaScript if/for/while syntax.

Use actual CDX syntax such as:

score is score plus 1

if score is greater than 10
    say "High"
end

==================================================
44. REAL PROJECT CONTEXT
==================================================

Before editing:

- inspect the actual project context
- identify the correct file
- preserve unrelated code
- use the actual file contents
- never invent existing code

==================================================
45. IMPORTANT
==================================================

The CODEOS_EDIT payload is an instruction to the CodeOS
application.

The application, not the AI, performs the actual change.

Therefore:

DO NOT claim "I changed it" until the payload is supplied.

After the payload, give a short explanation.

Example:

<CODEOS_EDIT>
{
    "type": "update_file",
    "file": "main.cdx",
    "content": "score is 0\n..."
}
</CODEOS_EDIT>

Updated main.cdx so the score increases correctly.
`
                        },

                        {
    role: "user",

    content: `
USER REQUEST:

${prompt}


CODEOS PROJECT CONTEXT:

${JSON.stringify(projectContext, null, 2)}
`
}

                    ],

                    stream: false

                })

            }
        );


        console.log(
            "🤖 CodeOS AI: HTTP status:",
            response.status
        );


        // ============================================
        // GET RESPONSE BODY
        // ============================================

        const data = await response.json();

        console.log(
            "🤖 CodeOS AI response:",
            data
        );


        // ============================================
        // API ERROR
        // ============================================

        if (!response.ok) {

            throw new Error(
                data?.error?.message ||
                `OpenRouter returned HTTP ${response.status}`
            );

        }


        // ============================================
        // EXTRACT AI MESSAGE
        // ============================================

        if (!response.ok || !data.ok) {
    throw new Error(
        data?.error || "CodeOS backend request failed."
    );
}

const answer = data.answer;

if (!answer) {

    throw new Error(
        "The AI returned no message."
    );

}

/* =====================================================
   🤖 AI → REAL CODEOS EDIT
===================================================== */

let displayAnswer = answer;

const editPayload =
    window.CodeOSAIEditor
        ?.extractJSON(
            answer
        );

if (editPayload) {

    console.log(
        "🤖 AI requested workspace edit:",
        editPayload
    );

    /* ===============================================
       👑 PLUS+ REQUIRED
    =============================================== */

    if (
        !window.CodeOSPlus ||
        !window.CodeOSPlus.canUseAIEditing()
    ) {

        displayAnswer =
            "🔒 **AI code editing requires CDX Plus+.**\n\n" +
            "I understood the change, but your current account " +
            "doesn't have permission to modify workspace files.";

    }

    else {

        const result =
            window.CodeOSAIEditor
                .applyEdits(
                    editPayload
                );

        console.log(
            "🤖 AI edit result:",
            result
        );

        if (result.changed) {

            const successful =
                result.results
                    .filter(
                        item =>
                            item.success
                    );

            const failed =
                result.results
                    .filter(
                        item =>
                            !item.success
                    );

            displayAnswer =
                "✅ **CodeOS edited your project!**\n\n" +
                successful
                    .map(
                        item =>
                            "✓ " +
                            item.message
                    )
                    .join("\n");

            if (failed.length) {

                displayAnswer +=
                    "\n\n" +
                    failed
                        .map(
                            item =>
                                "❌ " +
                                item.message
                        )
                        .join("\n");

            }

            const explanation =
                window.CodeOSAIEditor
                    .removeEditPayload(
                        answer
                    );

            if (explanation) {

                displayAnswer +=
                    "\n\n" +
                    explanation;

            }

        }
        else {

            displayAnswer =
                "⚠️ The AI generated an edit, but CodeOS " +
                "could not apply it.\n\n" +
                answer;

        }

    }

}

/* =====================================================
   SHOW RESULT
===================================================== */

thinkingMessage.remove();

addAIMessage(
    displayAnswer,
    "ai"
);


        if (!answer) {

            throw new Error(
                "The AI returned no message."
            );

        }


        // ============================================
        // SHOW ANSWER
        // ============================================

        thinkingMessage.remove();

        addAIMessage(
            answer,
            "ai"
        );


    } catch (error) {

        console.error(
            "❌ CodeOS AI error:",
            error
        );

        thinkingMessage.remove();

        addAIMessage(
            `❌ **AI Error**

${error.message}

Open the browser console for the full response.`,
            "ai"
        );

    }

}


    /* ---------------------------------------------------------
       SEND BUTTON
       --------------------------------------------------------- */

    aiSendBtn.addEventListener("click", () => {
        sendAIMessage();
    });


    /* ---------------------------------------------------------
       ENTER TO SEND
       --------------------------------------------------------- */

    aiInput.addEventListener("keydown", event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendAIMessage();

        }

    });


    /* ---------------------------------------------------------
       QUICK ACTIONS
       --------------------------------------------------------- */

    document
        .querySelectorAll("[data-ai-action]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const action = button.dataset.aiAction;

                const prompts = {

                    explain:
                        "Explain my current code",

                    fix:
                        "Find and fix any errors in my current code",

                    improve:
                        "Improve my current code",

                    build:
                        "Help me build this project"

                };

                aiInput.value =
                    prompts[action] || "";

                sendAIMessage();

            });

        });


    /* ---------------------------------------------------------
       GLOBAL FUNCTIONS
       --------------------------------------------------------- */

    window.sendAIMessage = sendAIMessage;
    window.openCodeOSAI = openAI;
    window.closeCodeOSAI = closeAI;

    console.log("🤖 CodeOS AI loaded!");

})();

/* =========================================================
   🧩 CODEOS EXTENSION ENGINE
========================================================= */

(function () {

    if (window.__CodeOSExtensionEngineLoaded) {
        return;
    }

    window.__CodeOSExtensionEngineLoaded = true;


    const EXTENSION_STORAGE =
        "codeosInstalledExtensions";


    const extensionCommands =
        new Map();


    const extensionButtons =
        new Map();


    const extensionPanels =
        new Map();


    const extensionListeners =
        {};


    let currentExtension =
        null;


    /* =====================================================
       📦 STORAGE
    ===================================================== */

    function getInstalledExtensions() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    EXTENSION_STORAGE
                ) || "{}"
            );

        } catch {

            return {};

        }

    }


    function saveInstalledExtensions(
        extensions
    ) {

        localStorage.setItem(
            EXTENSION_STORAGE,
            JSON.stringify(
                extensions
            )
        );

    }


    /* =====================================================
       🔔 EVENTS
    ===================================================== */

    function emit(
        event,
        data
    ) {

        (
            extensionListeners[event] ||
            []
        ).forEach(
            callback => {

                try {

                    callback(data);

                } catch (error) {

                    console.error(
                        `Extension event "${event}" error:`,
                        error
                    );

                }

            }
        );

    }


    function on(
        event,
        callback
    ) {

        if (
            !extensionListeners[event]
        ) {

            extensionListeners[event] =
                [];

        }

        extensionListeners[event]
            .push(callback);

        return () => {

            extensionListeners[event] =
                extensionListeners[event]
                    .filter(
                        fn =>
                            fn !==
                            callback
                    );

        };

    }


    /* =====================================================
       🍞 TOAST
    ===================================================== */

    function toast(
        message
    ) {

        let container =
            document.getElementById(
                "codeosExtensionToastContainer"
            );


        if (!container) {

            container =
                document.createElement(
                    "div"
                );

            container.id =
                "codeosExtensionToastContainer";


            container.style.cssText = `

                position:fixed;

                right:22px;
                bottom:22px;

                z-index:999999;

                display:grid;

                gap:10px;

            `;


            document.body.appendChild(
                container
            );

        }


        const item =
            document.createElement(
                "div"
            );


        item.textContent =
            message;


        item.style.cssText = `

            padding:
                13px 16px;

            border-radius:
                14px;

            background:
                #171925;

            color:white;

            border:
                1px solid
                rgba(124,92,255,.4);

            box-shadow:
                0 15px 45px
                rgba(0,0,0,.4);

            font-family:
                Arial,sans-serif;

            animation:
                codeosExtensionToastIn
                .25s ease;

        `;


        container.appendChild(
            item
        );


        setTimeout(
            () => {

                item.remove();

            },
            4000
        );

    }


    const animationStyle =
        document.createElement(
            "style"
        );


    animationStyle.textContent = `

        @keyframes codeosExtensionToastIn {

            from {
                opacity:0;
                transform:
                    translateY(10px);
            }

            to {
                opacity:1;
                transform:
                    translateY(0);
            }

        }

    `;


    document.head.appendChild(
        animationStyle
    );


    /* =====================================================
       📋 COMMANDS
    ===================================================== */

    function registerCommand(
        name,
        action,
        options = {}
    ) {

        if (!name) {
            return;
        }


        const key =
            currentExtension
                ? `${currentExtension.id}:${name}`
                : name;


        if (
            extensionCommands.has(
                key
            )
        ) {

            return;

        }


        const command = {

            icon:
                options.icon ||
                currentExtension?.icon ||
                "🧩",

            name,

            action

        };


        extensionCommands.set(
            key,
            command
        );


        commands.push(
            command
        );


        renderCommands(
            input?.value || ""
        );

    }


    function unregisterCommand(
        name
    ) {

        const key =
            currentExtension
                ? `${currentExtension.id}:${name}`
                : name;


        const command =
            extensionCommands.get(
                key
            );


        if (!command) {
            return;
        }


        const index =
            commands.indexOf(
                command
            );


        if (index !== -1) {

            commands.splice(
                index,
                1
            );

        }


        extensionCommands.delete(
            key
        );


        renderCommands(
            input?.value || ""
        );

    }


    /* =====================================================
       🎨 CSS
    ===================================================== */

    function addCSS(
        css
    ) {

        if (!css) {
            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.dataset.codeosExtension =
            currentExtension?.id ||
            "unknown";


        style.textContent =
            css;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       🎨 THEME VARIABLES
    ===================================================== */

    function setThemeVariable(
        name,
        value
    ) {

        if (!name) return;

        document.documentElement.style
            .setProperty(
                name,
                value
            );

    }


    /* =====================================================
       🔘 TOOLBAR BUTTON
    ===================================================== */

    function addButton(
        label,
        action,
        options = {}
    ) {

        const toolbar =
            document.querySelector(
                ".toolbar"
            );


        if (!toolbar) {
            return null;
        }


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            `${
                options.icon ||
                currentExtension?.icon ||
                "🧩"
            } ${label}`;


        button.className =
            "codeosExtensionToolbarButton";


        button.onclick =
            action;


        button.dataset
            .codeosExtension =
            currentExtension?.id ||
            "";


        toolbar.appendChild(
            button
        );


        const id =
            `${currentExtension?.id || "unknown"}:${label}`;


        extensionButtons.set(
            id,
            button
        );


        return button;

    }


    /* =====================================================
       🧱 PANEL
    ===================================================== */

    function addPanel(
        title,
        content,
        options = {}
    ) {

        let overlay =
            document.getElementById(
                "codeosExtensionPanelOverlay"
            );


        if (!overlay) {

            overlay =
                document.createElement(
                    "div"
                );

            overlay.id =
                "codeosExtensionPanelOverlay";


            overlay.style.cssText = `

                position:fixed;

                inset:0;

                z-index:999998;

                background:
                    rgba(0,0,0,.55);

                display:none;

                align-items:
                    center;

                justify-content:
                    center;

            `;


            document.body.appendChild(
                overlay
            );

        }


        const panel =
            document.createElement(
                "div"
            );


        panel.style.cssText = `

            width:min(
                800px,
                calc(100vw - 40px)
            );

            max-height:
                calc(100vh - 40px);

            overflow:auto;

            border-radius:
                20px;

            padding:
                22px;

            background:
                #151723;

            color:white;

            border:
                1px solid
                rgba(255,255,255,.1);

            box-shadow:
                0 30px 100px
                rgba(0,0,0,.5);

        `;


        panel.innerHTML = `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    align-items:center;
                "
            >

                <h2>
                    ${escapeExtensionText(title)}
                </h2>

                <button
                    type="button"
                    id="extensionPanelClose"
                    style="
                        border:0;
                        background:transparent;
                        color:white;
                        font-size:20px;
                        cursor:pointer;
                    "
                >
                    ✕
                </button>

            </div>

            <div
                style="
                    margin-top:15px;
                "
            >
                ${content}
            </div>

        `;


        overlay.innerHTML =
            "";


        overlay.appendChild(
            panel
        );


        overlay.style.display =
            "flex";


        panel
            .querySelector(
                "#extensionPanelClose"
            )
            .onclick =
                () => {

                    overlay.style.display =
                        "none";

                };


        return panel;

    }


    /* =====================================================
       ✍️ EDITOR
    ===================================================== */

    const editorAPI = {

        getValue() {

            return editor?.value ||
                "";

        },

        setValue(
            value
        ) {

            if (!editor) return;

            editor.value =
                String(value);

            editor.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles:true
                    }
                )
            );

        },

        insert(
            text
        ) {

            if (!editor) return;

            const start =
                editor.selectionStart;

            const end =
                editor.selectionEnd;


            editor.value =

                editor.value.substring(
                    0,
                    start
                ) +

                text +

                editor.value.substring(
                    end
                );


            const cursor =
                start +
                text.length;


            editor.selectionStart =
                cursor;

            editor.selectionEnd =
                cursor;


            editor.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles:true
                    }
                )
            );


            editor.focus();

        },

        replaceSelection(
            text
        ) {

            if (!editor) return;

            editorAPI.insert(
                text
            );

        }

    };


    /* =====================================================
       📁 FILE API
    ===================================================== */

    const filesAPI = {

        getFiles() {

            return structuredClone(
                files
            );

        },

        getCurrentFile() {

            return (
                files[
                    selectedFile
                ] || null
            );

        },

        create(
            name,
            content = "",
            options = {}
        ) {

            if (!name) {
                throw new Error(
                    "File name required."
                );
            }


            const file = {

                name,

                icon:
                    options.icon ||
                    "📄",

                folder:
                    options.folder ??
                    null,

                content

            };


            files.push(
                file
            );


            selectedFile =
                files.length - 1;


            if (
                !openTabs.includes(
                    selectedFile
                )
            ) {

                openTabs.push(
                    selectedFile
                );

            }


            renderFiles();
            renderTabs();

            editorAPI.setValue(
                content
            );


            saveWorkspaceState();


            emit(
                "fileCreated",
                file
            );


            return file;

        },

        read(
            name
        ) {

            return (
                files.find(
                    file =>
                        file.name ===
                        name
                ) || null
            );

        },

        update(
    name,
    content
) {

    const file =
        files.find(
            item =>
                item.name === name
        );

    if (!file) {

        console.error(
            "❌ AI tried to update missing file:",
            name
        );

        return false;

    }

    file.content =
        String(content);

    const fileIndex =
        files.indexOf(file);

    /* ============================================
       UPDATE CURRENT EDITOR
    ============================================ */

    if (
        fileIndex === selectedFile
    ) {

        editorAPI.setValue(
            file.content
        );

        editor.value =
            file.content;

    }

    /* ============================================
       SAVE
    ============================================ */

    saveWorkspaceState();

    /* ============================================
       REFRESH FILE TREE
    ============================================ */

    renderFiles();

    renderTabs();

    emit(
        "fileUpdated",
        file
    );

    console.log(
        "🤖 AI updated CodeOS file:",
        name
    );

    return true;
}

    };


    /* =====================================================
       🧠 WORKSPACE API
    ===================================================== */

    const workspaceAPI = {

        getFiles() {

            return filesAPI.getFiles();

        },

        getFolders() {

            return structuredClone(
                folders
            );

        },

        getCurrentFile() {

            return filesAPI.getCurrentFile();

        },

        getSelectedIndex() {

            return selectedFile;

        },

        getWorkspaceState() {

            return {

                files:
                    structuredClone(
                        files
                    ),

                folders:
                    structuredClone(
                        folders
                    ),

                openTabs:
                    structuredClone(
                        openTabs
                    ),

                selectedFile

            };

        },

        save() {

            saveWorkspaceState();

            emit(
                "workspaceSaved"
            );

        }

    };


    /* =====================================================
       🧩 EXTENSION API
    ===================================================== */

    const CodeOS = {

        version:
            "1.0",

        extension:
            currentExtension,

        commands: {

            register:
                registerCommand,

            unregister:
                unregisterCommand

        },

        ui: {

            toast,

            addButton,

            addPanel,

            addCSS,

            setThemeVariable

        },

        editor:
            editorAPI,

        files:
            filesAPI,

        workspace:
            workspaceAPI,

        snippets: {

            add(
                name,
                code,
                options = {}
            ) {

                window.codeosExtensionSnippets ||= {};

                window.codeosExtensionSnippets[
                    name
                ] = {

                    code,

                    icon:
                        options.icon ||
                        "🧩"

                };

            },

            insert(
                name
            ) {

                const snippet =
                    window
                        .codeosExtensionSnippets
                        ?.[
                            name
                        ];


                if (!snippet) {
                    return;
                }


                editorAPI.insert(
                    snippet.code
                );

            }

        },

        events: {

            on

        }

    };


    window.CodeOS =
        CodeOS;


    /* =====================================================
       🔒 TEXT ESCAPE
    ===================================================== */

    function escapeExtensionText(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    }


    /* =====================================================
       ▶ RUN EXTENSION
    ===================================================== */

    function runJavaScriptExtension(
        extension
    ) {

        if (
            extension.enabled ===
            false
        ) {

            return;

        }


        if (!extension.code) {
            return;
        }


        currentExtension =
            extension;


        CodeOS.extension =
            extension;


        try {

            const runner =
                new Function(
                    "CodeOS",
                    "extension",
                    `
                        "use strict";

                        ${extension.code}
                    `
                );


            runner(
                CodeOS,
                extension
            );


            console.log(
                "🧩 Extension loaded:",
                extension.name
            );


            emit(
                "extensionLoaded",
                extension
            );

        } catch (error) {

            console.error(
                `❌ Extension "${extension.name}" failed:`,
                error
            );


            toast(
                `❌ ${extension.name} failed to load.`
            );

        } finally {

            currentExtension =
                null;

        }

    }


    /* =====================================================
       🎨 RUN THEME
    ===================================================== */

    function runThemeExtension(
        extension
    ) {

        if (
            extension.enabled ===
            false
        ) {

            return;

        }


        if (!extension.code) {
            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.dataset
            .codeosThemeExtension =
            extension.id;


        style.textContent =
            extension.code;


        document.head.appendChild(
            style
        );


        console.log(
            "🎨 Theme extension loaded:",
            extension.name
        );

    }


    /* =====================================================
       🚀 LOAD ALL
    ===================================================== */

    function loadInstalledExtensions() {

        const installed =
            getInstalledExtensions();


        Object.values(
            installed
        ).forEach(
            extension => {

                if (
                    !extension ||
                    extension.enabled === false
                ) {
                    return;
                }


                if (
                    extension.kind ===
                    "theme"
                ) {

                    runThemeExtension(
                        extension
                    );

                } else {

                    runJavaScriptExtension(
                        extension
                    );

                }

            }
        );


        renderCommands(
            input?.value || ""
        );

    }


    /* =====================================================
       🧩 EXTENSION MANAGER
    ===================================================== */

    function openExtensionManager() {

        const installed =
            getInstalledExtensions();


        const overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "codeosExtensionManager";


        overlay.style.cssText = `

            position:fixed;

            inset:0;

            z-index:999997;

            background:
                rgba(0,0,0,.6);

            display:flex;

            justify-content:center;

            align-items:center;

        `;


        const box =
            document.createElement(
                "div"
            );


        box.style.cssText = `

            width:min(
                760px,
                calc(100vw - 40px)
            );

            max-height:
                calc(100vh - 40px);

            overflow:auto;

            padding:22px;

            border-radius:22px;

            background:
                #151722;

            color:white;

            border:
                1px solid
                rgba(255,255,255,.1);

        `;


        const list =
            Object.values(
                installed
            );


        box.innerHTML = `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <div>

                    <h2>
                        🧩 CodeOS Extensions
                    </h2>

                    <p
                        style="
                            color:#969bb1;
                        "
                    >
                        Extensions currently installed in this workspace.
                    </p>

                </div>

                <button
                    id="closeExtensionManager"
                    style="
                        border:0;
                        background:transparent;
                        color:white;
                        font-size:20px;
                        cursor:pointer;
                    "
                >
                    ✕
                </button>

            </div>

            <div
                id="workspaceExtensionList"
                style="
                    display:grid;
                    gap:10px;
                    margin-top:18px;
                "
            ></div>

        `;


        overlay.appendChild(
            box
        );


        document.body.appendChild(
            overlay
        );


        const extensionList =
            box.querySelector(
                "#workspaceExtensionList"
            );


        if (!list.length) {

            extensionList.innerHTML = `

                <div
                    style="
                        padding:35px;
                        text-align:center;
                        color:#9398ae;
                    "
                >

                    <div
                        style="
                            font-size:45px;
                        "
                    >
                        🧩
                    </div>

                    <h3>
                        No extensions installed
                    </h3>

                    <p>
                        Install one from CodeOS Community.
                    </p>

                </div>

            `;

        } else {

            list.forEach(
                extension => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.style.cssText = `

                        padding:14px;

                        border-radius:15px;

                        border:
                            1px solid
                            rgba(255,255,255,.08);

                        background:
                            rgba(255,255,255,.03);

                        display:flex;

                        align-items:center;

                        gap:12px;

                    `;


                    card.innerHTML = `

                        <div
                            style="
                                font-size:27px;
                            "
                        >
                            ${extension.icon || "⚡"}
                        </div>

                        <div
                            style="
                                flex:1;
                            "
                        >

                            <strong>
                                ${escapeExtensionText(
                                    extension.name
                                )}
                            </strong>

                            <div
                                style="
                                    font-size:12px;
                                    color:#9398ae;
                                "
                            >
                                v${escapeExtensionText(
                                    extension.version ||
                                    "1.0.0"
                                )}
                                ·
                                ${
                                    extension.kind ||
                                    "javascript"
                                }
                            </div>

                        </div>

                        <label
                            style="
                                display:flex;
                                gap:7px;
                                align-items:center;
                                font-size:12px;
                            "
                        >

                            <input
                                type="checkbox"
                                class="extensionEnabledToggle"
                                ${
                                    extension.enabled !== false
                                        ? "checked"
                                        : ""
                                }
                            >

                            Enabled

                        </label>

                    `;


                    card
                        .querySelector(
                            ".extensionEnabledToggle"
                        )
                        .onchange =
                            event => {

                                const all =
                                    getInstalledExtensions();


                                if (
                                    all[
                                        extension.id
                                    ]
                                ) {

                                    all[
                                        extension.id
                                    ].enabled =
                                        event.target.checked;


                                    saveInstalledExtensions(
                                        all
                                    );

                                }


                                toast(
                                    event.target.checked
                                        ? `⚡ ${extension.name} enabled for next workspace load.`
                                        : `⏸️ ${extension.name} disabled.`
                                );

                            };


                    extensionList.appendChild(
                        card
                    );

                }
            );

        }


        box
            .querySelector(
                "#closeExtensionManager"
            )
            .onclick =
                () => overlay.remove();


        overlay.onclick =
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    overlay.remove();

                }

            };

    }


    document
        .getElementById(
            "extensionsBtn"
        )
        ?.addEventListener(
            "click",
            openExtensionManager
        );


    /* =====================================================
       🚀 LOAD
    ===================================================== */

    loadInstalledExtensions();


    console.log(
        "🧩 CodeOS Extension Engine loaded."
    );

})();

/* =========================================================
   🚀 OPEN CODEOS PROJECT IN A NEW TAB
========================================================= */

function openCodeOSProjectInNewTab(
    project = null
) {

    const runProject =
        project || {

            name:
                localStorage.getItem(
                    "codeosCurrentWorkspaceName"
                ) ||
                "CodeOS Project",

            files:
                structuredClone(
                    files
                ),

            folders:
                structuredClone(
                    folders
                ),

            openTabs:
                structuredClone(
                    openTabs
                ),

            selectedFile:
                selectedFile

        };

    const runId =
        "run-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8);

    localStorage.setItem(
        "codeosRunProject:" + runId,
        JSON.stringify(
            runProject
        )
    );

    const url =
        "run.html?project=" +
        encodeURIComponent(
            runId
        );

    window.open(
        url,
        "_blank"
    );

    return runId;

}

window.openCodeOSProjectInNewTab =
    openCodeOSProjectInNewTab;

    /* =========================================================
   💻 OPEN NATIVE CDX FILE FROM .CDX TERMINAL
========================================================= */

(async function loadNativeCDXIntoWorkspace() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const nativePath =
        params.get(
            "nativeFile"
        );

    if (
        !nativePath ||
        !window.CodeOSDesktop?.isDesktopApp
    ) {

        return;

    }


    try {

        const nativeFile =
            await window.CodeOSDesktop
                .readAbsoluteCDX(
                    nativePath
                );


        if (
            !nativeFile.success
        ) {

            console.error(
                "❌ Native CDX import failed:",
                nativeFile.message
            );

            return;

        }


        const fileName =
            nativePath
                .split(/[\\/]/)
                .pop();


        /* ==============================================
           CREATE / UPDATE WORKSPACE FILE
        ============================================== */

        const existing =
            files.find(
                file =>
                    file.name === fileName
            );


        if (existing) {

            existing.content =
                nativeFile.content;

        } else {

            files.push({

                name:
                    fileName,

                content:
                    nativeFile.content,

                icon:
                    "👾",

                type:
                    "cdx",

                folder:
                    null

            });

        }


        selectedFile =
            Math.max(
                0,
                files.findIndex(
                    file =>
                        file.name ===
                        fileName
                )
            );


        openTabs =
            [
                ...new Set(
                    [
                        ...openTabs,
                        fileName
                    ]
                )
            ];


        /*
            Save using the existing CodeOS workspace
            persistence.
        */

        localStorage.setItem(
            "codeosWorkspace",
            JSON.stringify({

                files,
                folders,
                openTabs,
                selectedFile

            })
        );


        /*
            Refresh the existing workspace UI.
        */

        if (
            typeof renderFiles ===
            "function"
        ) {

            renderFiles();

        }


        if (
            typeof renderTabs ===
            "function"
        ) {

            renderTabs();

        }


        if (
            typeof openFile ===
            "function"
        ) {

            openFile(
                fileName
            );

        }


        console.log(
            "💻 Native CDX opened:",
            fileName
        );


    } catch (error) {

        console.error(
            "❌ Could not open native CDX:",
            error
        );

    }

})();