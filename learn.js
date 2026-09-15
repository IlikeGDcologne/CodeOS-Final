const list=document.getElementById("lessonList");

const content=document.getElementById("lessonContent");

let progress =
Number(
localStorage.getItem("lessonProgress")
)||0;

if(progress >= lessons.length){

    progress = 0;

    localStorage.setItem("lessonProgress",0);

}

lessons.forEach((lesson,index)=>{

const div=document.createElement("div");

div.className="lesson";

if(index>progress){

div.innerHTML="🔒 "+lesson.title;

div.style.opacity=".4";

}

else{

div.innerHTML=
(index<progress?"✅ ":"🟢 ")+
lesson.title;

div.onclick=()=>showLesson(index);

}

list.appendChild(div);

});

showLesson(progress);

function showLesson(index){

const lesson = lessons[index];

content.innerHTML = `
<h1>${lesson.title}</h1>

<p>${lesson.description}</p>

<h2>Syntax</h2>

<code>${lesson.syntax}</code>

<h2>Example</h2>

<code>${lesson.example}</code>

<h2>🎯 Mission</h2>

<p>${lesson.challenge}</p>

<textarea
id="studentCode"
placeholder="Write your CodeOS code here..."
></textarea>

<br><br>

<button id="runMission">
▶ Run Code
</button>

<button id="openWorkspace">
💻 Open in Workspace
</button>

<div id="missionResult"></div>
`;

document.getElementById("runMission").onclick = () => {

    const code =
        document
        .getElementById("studentCode")
        .value
        .trim();

    const result =
        document.getElementById("missionResult");

    const normalizeLessonCode = value =>
    value
        .trim()
        .replace(/\r/g,"")
        .split("\n")
        .map(line=>line.trim())
        .filter(Boolean)
        .join("\n");

if(
    normalizeLessonCode(code) ===
    normalizeLessonCode(lesson.answer)
){

        result.innerHTML =
        "🎉 Correct! +20 XP";

        if(progress === index){

            progress++;

            localStorage.setItem(
                "lessonProgress",
                progress
            );

            setTimeout(()=>{
                location.reload();
            },1200);

        }

    }
    else{

        result.innerHTML =
        "❌ Not quite. Try again!";

    }

};

document.getElementById("openWorkspace").onclick = () => {

    const code = document.getElementById("studentCode").value;

    console.log(code);

    localStorage.setItem("lessonWorkspaceCode", code);

    console.log(localStorage.getItem("lessonWorkspaceCode"));

    window.location.href = "workspace.html";

};

}

const clearButton = document.getElementById("clearProgress");

if(clearButton){

    clearButton.onclick = () => {

        if(confirm("⚠ Clear all lesson progress?")){

            progress = 0;

            localStorage.setItem(
                "lessonProgress",
                "0"
            );

            location.reload();

        }

    };

}