console.log("👾 CodeOS Compiler Started");

function compile(code){

    let javascript = "";

    let lines = code.split("\n");

    lines.forEach(line=>{

        line=line.trim();

        if(line.startsWith("say(")){

            let text=line.substring(
                5,
                line.length-2
            );

            javascript += `output("${text}");\n`;

        }

    });

    return javascript;

}


function output(text){

    document.getElementById("output").innerHTML += text + "<br>";

}