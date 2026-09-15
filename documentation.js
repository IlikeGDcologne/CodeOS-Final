const list=document.getElementById("commandList");

const viewer=document.getElementById("viewer");

const search=document.getElementById("search");

const docs = [

    {
        title:"say",
        icon:"💬",
        description:"Prints text or variable values to the screen.",
        syntax:`say "Hello"
say player`,
        example:`player is "Rivaan"
say "Hello" player`
    },

    {
        title:"variables",
        icon:"📦",
        description:"Stores information inside a variable.",
        syntax:`score is 10
name is "Rivaan"`,
        example:`coins is 10
coins is coins plus 5
say coins`
    },

    {
        title:"ask",
        icon:"❓",
        description:"Asks the user for input.",
        syntax:`ask "Question" type variable`,
        example:`ask "What is your name?" text name
say name`
    },

    {
        title:"plus",
        icon:"➕",
        description:"Adds two values.",
        syntax:`result is a plus b`,
        example:`a is 5
b is 10
result is a plus b
say result`
    },

    {
        title:"minus",
        icon:"➖",
        description:"Subtracts two values.",
        syntax:`result is a minus b`,
        example:`score is 20
score is score minus 5
say score`
    },

    {
        title:"multiply",
        icon:"✖️",
        description:"Multiplies two values.",
        syntax:`result is a multiply b`,
        example:`a is 5
b is 4
result is a multiply b
say result`
    },

    {
        title:"divide",
        icon:"➗",
        description:"Divides one value by another.",
        syntax:`result is a divide b`,
        example:`a is 20
b is 4
result is a divide b
say result`
    },

    {
        title:"random",
        icon:"🎲",
        description:"Generates a random whole number.",
        syntax:`number is random 1 to 10`,
        example:`dice is random 1 to 6
say dice`
    },

    {
        title:"square",
        icon:"²",
        description:"Squares a number.",
        syntax:`result is square number`,
        example:`number is 5
answer is square number
say answer`
    },

    {
        title:"sqrt",
        icon:"√",
        description:"Finds the square root.",
        syntax:`result is sqrt number`,
        example:`number is 25
answer is sqrt number
say answer`
    },

    {
        title:"floor",
        icon:"⬇️",
        description:"Rounds a number down.",
        syntax:`result is floor number`,
        example:`number is 5.9
answer is floor number
say answer`
    },

    {
        title:"ceiling",
        icon:"⬆️",
        description:"Rounds a number up.",
        syntax:`result is ceiling number`,
        example:`number is 5.1
answer is ceiling number
say answer`
    },

    {
        title:"if",
        icon:"🧠",
        description:"Runs code when a condition is true.",
        syntax:`if condition
...
end`,
        example:`coins is 100
if coins is 100
say "Rich!"
end`
    },

    {
        title:"else",
        icon:"😎",
        description:"Runs when the IF condition is false.",
        syntax:`if condition
...
else
...
end`,
        example:`coins is 0
if coins is 100
say "Rich"
else
say "Poor"
end`
    },

    {
        title:"else if",
        icon:"🤔",
        description:"Checks another condition when earlier conditions failed.",
        syntax:`if condition
...
else if another condition
...
else
...
end`,
        example:`health is 50
if health is 100
say "Full"
else if health is 50
say "Half"
else
say "Low"
end`
    },

    {
        title:"and",
        icon:"🔗",
        description:"Requires both conditions to be true.",
        syntax:`condition1 and condition2`,
        example:`score is 100
lives is 3
if score is 100 and lives is 3
say "Perfect!"
end`
    },

    {
        title:"or",
        icon:"🔀",
        description:"Returns true when either condition is true.",
        syntax:`condition1 or condition2`,
        example:`score is 100
if score is 100 or score is 50
say "Good!"
end`
    },

    {
        title:"not",
        icon:"🚫",
        description:"Reverses a condition.",
        syntax:`not condition`,
        example:`gameOver is false
if not gameOver
say "Keep playing!"
end`
    },

    {
        title:"contains",
        icon:"🔎",
        description:"Checks whether text contains another value.",
        syntax:`text contains value`,
        example:`name is "Rivaan"
if name contains "R"
say "Found it!"
end`
    },

    {
        title:"repeat",
        icon:"🔁",
        description:"Repeats a block a specific number of times.",
        syntax:`repeat 5
...
end`,
        example:`repeat 5
say "Hello"
end`
    },

    {
        title:"repeat until",
        icon:"🔁",
        description:"Repeats code until a condition becomes true.",
        syntax:`repeat until condition
...
end`,
        example:`score is 0
repeat until score is 10
score is score plus 1
end
say score`
    },

    {
        title:"forever",
        icon:"♾️",
        description:"Runs a block continuously.",
        syntax:`forever
...
end`,
        example:`forever
say "Running"
wait for 1 seconds
end`
    },

    {
        title:"while",
        icon:"🌀",
        description:"Repeats while a condition remains true.",
        syntax:`while condition
...
end`,
        example:`lives is 3
while lives is not 0
say lives
lives is lives minus 1
end`
    },

    {
        title:"wait",
        icon:"⏳",
        description:"Pauses execution for a period of time.",
        syntax:`wait for 2 seconds`,
        example:`say "Ready"
wait for 2 seconds
say "Go!"`
    },

    {
        title:"wait until",
        icon:"⏳",
        description:"Pauses until a condition becomes true.",
        syntax:`wait until condition`,
        example:`score is 0
wait until score is 10
say "Done!"`
    },

    {
        title:"function",
        icon:"⚙️",
        description:"Creates reusable code.",
        syntax:`function Name
...
end`,
        example:`function Hello
say "Hello!"
end

do Hello`
    },

    {
        title:"do",
        icon:"🚀",
        description:"Runs a function.",
        syntax:`do FunctionName`,
        example:`function Jump
say "Jump!"
end

do Jump`
    },

    {
        title:"return",
        icon:"↩️",
        description:"Returns a value from a function.",
        syntax:`return value`,
        example:`function GetScore
return 100
end

score is do GetScore
say score`
    },

    {
        title:"colour",
        icon:"🎨",
        description:"Changes the colour of CodeOS output.",
        syntax:`colour is cyan`,
        example:`colour is lime
say "Hello!"`
    },

    {
        title:"image",
        icon:"🖼️",
        description:"Selects an image from the project files.",
        syntax:`image is "image.png"`,
        example:`image is "image.png"
show image`
    },

    {
        title:"show image",
        icon:"🖼️",
        description:"Displays the selected image.",
        syntax:`show image`,
        example:`image is "image.png"
show image`
    },

    {
        title:"create sprite",
        icon:"👾",
        description:"Creates a sprite on the screen.",
        syntax:`create sprite name`,
        example:`create sprite hero`
    },

    {
        title:"sprite image",
        icon:"🎭",
        description:"Assigns an image from the project to a sprite.",
        syntax:`sprite image is "file.png"`,
        example:`create sprite hero
hero image is "hero.png"`
    },

    {
        title:"sprite x",
        icon:"↔️",
        description:"Moves a sprite horizontally.",
        syntax:`sprite x is 200`,
        example:`create sprite hero
hero x is 200`
    },

    {
        title:"sprite y",
        icon:"↕️",
        description:"Moves a sprite vertically.",
        syntax:`sprite y is 100`,
        example:`create sprite hero
hero y is 100`
    },

    {
        title:"sprite size",
        icon:"📏",
        description:"Changes a sprite's size.",
        syntax:`sprite size is 100`,
        example:`create sprite hero
hero size is 100`
    },

    {
        title:"clicked",
        icon:"🖱️",
        description:"Checks whether a sprite was clicked.",
        syntax:`if sprite clicked`,
        example:`create sprite hero

if hero clicked
say "You clicked me!"
end`
    },

    {
        title:"pressed",
        icon:"⌨️",
        description:"Checks whether a keyboard key is pressed.",
        syntax:`if key pressed`,
        example:`if space pressed
say "Jump!"
end`
    }

];

function render(filter=""){

    list.innerHTML="";

    docs

    .filter(doc=>

        doc.title

        .toLowerCase()

        .includes(

            filter.toLowerCase()

        )

    )

    .forEach(doc=>{

        const div=document.createElement("div");

        div.className="command";

        div.innerHTML=

        `${doc.icon} ${doc.title}`;

        div.onclick=()=>{

            viewer.innerHTML=

            `
            <h1>${doc.icon} ${doc.title}</h1>

            <p>${doc.description}</p>

            <h2>Syntax</h2>

            <code>${doc.syntax}</code>

            <h2>Example</h2>

            <code>${doc.example}</code>
            `;

        };

        list.appendChild(div);

    });

}

render();

search.oninput=()=>{

    render(search.value);

};