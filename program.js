function openWorkspace(){

    window.location.href="workspace.html";

}

const snippets=[

"say(\"Hello World\")",

"compile()",

"loop{ }",

"image logo = \"logo.png\"",

"sprite player",

"physics()",

"draw(player)",

"vector velocity",

"function update(){ }",

"if(score > 100){ }",

"while(true){ }",

"debug()",

"run()",

"engine.start()"

];

const background=document.getElementById("backgroundCode");

function createLine(){

    const line=document.createElement("div");

    line.className="codeLine";

    line.innerText=snippets[Math.floor(Math.random()*snippets.length)];

    line.style.left=Math.random()*100+"vw";

    line.style.animationDuration=15+Math.random()*20+"s";

    line.style.fontSize=(18+Math.random()*14)+"px";

    background.appendChild(line);

    setTimeout(()=>{

        line.remove();

    },35000);

}

setInterval(createLine,400);

for(let i=0;i<20;i++){

    createLine();

}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener("mousemove",(e)=>{

    mouseX=e.clientX;
    mouseY=e.clientY;

});

function animateBackground(){

    document.querySelectorAll(".codeLine").forEach(line=>{

        const rect=line.getBoundingClientRect();

        const dx=(mouseX-(rect.left+rect.width/2))*0.004;
        const dy=(mouseY-(rect.top+rect.height/2))*0.004;

        line.style.transform=
            `translate(${dx}px, ${dy}px)`;

    });

    requestAnimationFrame(animateBackground);

}

animateBackground();

function createParticle(){

    const p=document.createElement("div");

    p.className="particle";

    p.style.left=Math.random()*100+"vw";

    p.style.animationDuration=(20+Math.random()*20)+"s";

    p.style.opacity=.1+Math.random()*.3;

    document.body.appendChild(p);

    setTimeout(()=>{

        p.remove();

    },40000);

}

for(let i=0;i<40;i++) createParticle();

setInterval(createParticle,1000);

const overlay=document.getElementById("paletteOverlay");
const input=document.getElementById("commandInput");

const commands = [

{
    icon:"🚀",
    name:"Launch Workspace",
    action:()=>openWorkspace()
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
    action:()=>openSettings()
},

{
    icon:"🤖",
    name:"Ask AI",
    action:()=>alert("AI Coming Soon!")
},

{
    
    icon:"📚",
    name:"Documentation",
    action:()=>{
        window.location.href="documentation.html";
    }

},

{
    icon:"🕒",
    name:"Timeline",
    action:()=>alert("Timeline Coming Soon!")
}

];
const commandList = document.getElementById("commandList");

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

let selectedIndex = 0;

renderCommands();

input.addEventListener("input",()=>{

    selectedIndex = 0;
    renderCommands(input.value);

});

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

overlay.addEventListener("click",(e)=>{

    if(e.target===overlay){

        overlay.classList.remove("show");

        input.value="";

    }

});

// ==========================
// BOOT SCREEN
// ==========================

const bootScreen=document.getElementById("bootScreen");
const bootBar=document.getElementById("bootProgress");
const bootStatus=document.getElementById("bootStatus");

const bootSteps=[

"Loading Engine...",

"Initializing Workspace...",

"Starting Assistant...",

"Launching..."

];

let bootIndex=0;

function bootSequence(){

    if(bootIndex>=bootSteps.length){

        setTimeout(()=>{

            bootScreen.classList.add("hide");

        },300);

        return;

    }

    bootStatus.textContent=bootSteps[bootIndex];

    bootBar.style.width=((bootIndex+1)/bootSteps.length*100)+"%";

    bootIndex++;

    setTimeout(bootSequence,350);

}

bootSequence();

// ==========================
// ⚙️ SETTINGS SYSTEM
// ==========================

const settingsOverlay =
    document.getElementById("settingsOverlay");

const closeSettings =
    document.getElementById("closeSettings");

const themeSelect =
    document.getElementById("themeSelect");

const accentColor =
    document.getElementById("accentColor");

const animationsToggle =
    document.getElementById("animationsToggle");

const resetSettings =
    document.getElementById("resetSettings");


// Open settings

function openSettings(){

    settingsOverlay.classList.add("show");

}


// Close settings

function closeSettingsPanel(){

    settingsOverlay.classList.remove("show");

}


closeSettings.addEventListener(
    "click",
    closeSettingsPanel
);


// Click outside panel

settingsOverlay.addEventListener("click", (event)=>{

    if(event.target === settingsOverlay){

        closeSettingsPanel();

    }

});


// ==========================
// 💾 SAVE SETTINGS
// ==========================

function saveSettings(){

    const settings = {

        theme:
            themeSelect.value,

        accent:
            accentColor.value,

        animations:
            animationsToggle.checked

    };


    localStorage.setItem(
        "codeosSettings",
        JSON.stringify(settings)
    );

}


// ==========================
// 📂 LOAD SETTINGS
// ==========================

function loadSettings(){

    const saved =
        JSON.parse(
            localStorage.getItem(
                "codeosSettings"
            ) || "null"
        );


    if(!saved) return;


    themeSelect.value =
        saved.theme || "dark";

    accentColor.value =
        saved.accent || "#3b82f6";

    animationsToggle.checked =
        saved.animations !== false;


    applySettings();

}


// ==========================
// 🎨 APPLY SETTINGS
// ==========================

function applySettings(){

    const theme =
        themeSelect.value;


    if(theme === "light"){

    document.body.classList.add("light-mode");

}
else{

    document.body.classList.remove("light-mode");

}


    document.documentElement.style
        .setProperty(
            "--codeos-accent",
            accentColor.value
        );


    if(!animationsToggle.checked){

        document.body.classList.add(
            "no-animations"
        );

    }
    else{

        document.body.classList.remove(
            "no-animations"
        );

    }

}


// ==========================
// 🎨 SETTINGS CHANGES
// ==========================

themeSelect.addEventListener(
    "change",
    ()=>{
        applySettings();
        saveSettings();
    }
);


accentColor.addEventListener(
    "input",
    ()=>{
        applySettings();
        saveSettings();
    }
);


animationsToggle.addEventListener(
    "change",
    ()=>{
        applySettings();
        saveSettings();
    }
);


// ==========================
// ♻️ RESET
// ==========================

resetSettings.addEventListener(
    "click",
    ()=>{

        localStorage.removeItem(
            "codeosSettings"
        );


        themeSelect.value =
            "dark";

        accentColor.value =
            "#3b82f6";

        animationsToggle.checked =
            true;


        applySettings();

        saveSettings();

    }
);


// Load settings when CodeOS starts

loadSettings();