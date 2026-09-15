const lessons = [

{
id:0,
title:"👋 Hello World",
description:"Print your first message.",
syntax:'say "Hello World"',
example:'say "Hello World"',
challenge:'Print "Hello World".',
answer:'say "Hello World"'
},

{
id:1,
title:"📦 Variables",
description:"Variables store information.",
syntax:'coins is 10',
example:`coins is 10

say coins`,
challenge:"Create a variable called coins with the value 10.",
answer:`coins is 10`
},

{
id:2,
title:"🗣 Saying Variables",
description:"Use variables inside messages.",
syntax:'say "Coins:" coins',
example:`coins is 50

say "Coins:" coins`,
challenge:"Create a variable called player with the value Rivaan and print it.",
answer:`player is Rivaan

say player`
},

{
id:3,
title:"➕ Addition",
description:"Add numbers together.",
syntax:'total is a plus b',
example:`a is 5

b is 6

total is a plus b

say total`,
challenge:"Add 5 and 6 into a variable called total.",
answer:`a is 5

b is 6

total is a plus b`
},

{
id:4,
title:"➖ Subtraction",
description:"Subtract numbers.",
syntax:'lives is lives minus 1',
example:`lives is 5

lives is lives minus 1

say lives`,
challenge:"Create score = 20 and subtract 5.",
answer:`score is 20

score is score minus 5`
},

{
id:5,
title:"🎨 Colours",
description:"Change text colour.",
syntax:'colour is lime',
example:`colour is cyan

say "Hello!"`,
challenge:"Change the colour to red.",
answer:`colour is red`
},

{
id:6,
title:"⏳ Waiting",
description:"Pause your program.",
syntax:'wait for 2 seconds',
example:`say "Ready?"

wait for 2 seconds

say "Go!"`,
challenge:"Wait for 3 seconds.",
answer:`wait for 3 seconds`
},

{
id:7,
title:"🧠 If Statements",
description:"Programs can make decisions.",
syntax:'if score is 10',
example:`score is 10

if score is 10

say "Correct!"

end`,
challenge:"If coins is 5, say 'Nice!'.",
answer:`coins is 5

if coins is 5

say "Nice!"

end`
},

{
id:8,
title:"🔀 Else",
description:"Run code when an if is false.",
syntax:"else",
example:`coins is 1

if coins is 5

say "Rich"

else

say "Poor"

end`,
challenge:"Create an if with an else. (coins is 2, if its 5 rich, no poor)",
answer:`coins is 2

if coins is 5

say "Rich"

else

say "Poor"

end`
},

{
id:9,
title:"🧩 Else If",
description:"Check multiple possibilities.",
syntax:"else if",
example:`coins is 20

if coins is 100

say "Rich"

else if coins is 20

say "Good"

else

say "Poor"

end`,
challenge:"Use else if. (coin 5, else if coin 10)",
answer:`coins is 10

if coins is 5

say "Five"

else if coins is 10

say "Ten"

end`
},

{
id:10,
title:"🔁 Repeat Loops",
description:"Repeat code many times.",
syntax:"repeat 5",
example:`repeat 5

say "Hi"

end`,
challenge:"Repeat 'Hello' three times.",
answer:`repeat 3

say "Hello"

end`
},

{
id:11,
title:"♾ Forever Loops",
description:"Repeat forever.",
syntax:"forever",
example:`forever

say "Running"

end`,
challenge:"Create a forever loop. (Loop)",
answer:`forever

say "Loop"

end`
},

{
id:12,
title:"🌀 While Loops",
description:"Loop while a condition is true.",
syntax:"while lives is 5",
example:`lives is 3

while lives is not 0

say lives

lives is lives minus 1

end`,
challenge:"Create a while loop. (num is 3, while its not zero, its itself minus one)",
answer:`number is 3

while number is not 0

number is number minus 1

end`
},

{
id:13,
title:"🎲 Random Numbers",
description:"Generate random numbers.",
syntax:"dice is random 1 to 6",
example:`dice is random 1 to 6

say dice`,
challenge:"Create a random number from 1 to 10.",
answer:`number is random 1 to 10`
},

{
id:14,
title:"⚙ Functions",
description:"Reuse code.",
syntax:"function Hello",
example:`function Hello

say "Hello!"

end

do Hello`,
challenge:"Create a function called Hi.",
answer:`function Hi

say "Hi!"

end

do Hi`
},

{
id:15,
title:"🖼 Images",
description:"Display an image.",
syntax:'image is "cat.png"',
example:`image is "cat.png"

show image`,
challenge:"Load an image called image.png.",
answer:`image is "image.png"

show image`
},

{
id:16,
title:"👾 Sprites",
description:"Create your first sprite.",
syntax:"create sprite player",
example:`create sprite player`,
challenge:"Create a sprite called hero.",
answer:`create sprite hero`
},

{
id:17,
title:"🖼 Sprite Images",
description:"Give sprites textures.",
syntax:'player image is "hero.png"',
example:`create sprite player

player image is "hero.png"`,
challenge:"Give hero an image.",
answer:`create sprite hero

hero image is "hero.png"`
},

{
id:18,
title:"📍 Moving Sprites",
description:"Change a sprite's position.",
syntax:"player x is 100",
example:`create sprite player

player x is 150

player y is 80`,
challenge:"Move hero to x=200 y=100.",
answer:`create sprite hero

hero x is 200

hero y is 100`
},

{
id:19,
title:"🏁 Final Challenge",
description:"Use everything you've learned!",
syntax:"Anything!",
example:`player is Rivaan

coins is 10

repeat 5

say player

end`,
challenge:"Build a tiny program using variables, loops and say.",
answer:`player is Rivaan

repeat 3

say player

end`
},
{
    title:"❓ User Input",
    description:"Learn how to ask the player for information.",
    syntax:`ask "Question" type variable`,
    example:`ask "What is your name?" text name
say name`,
    challenge:"Ask the user for their name and then say their name.",
    answer:`ask "What is your name?" text name
say name`
},

{
    title:"🔢 Number Input",
    description:"Ask the player for a number and store it.",
    syntax:`ask "Question" number variable`,
    example:`ask "How old are you?" number age
say age`,
    challenge:"Ask the player for a number and say it.",
    answer:`ask "Enter a number" number number
say number`
},

{
    title:"✖️ Multiplication",
    description:"Multiply two numbers using the multiply operator.",
    syntax:`result is a multiply b`,
    example:`a is 5
b is 4
result is a multiply b
say result`,
    challenge:"Create two numbers, multiply them, and say the result.",
    answer:`a is 5
b is 4
result is a multiply b
say result`
},

{
    title:"➗ Division",
    description:"Divide one number by another.",
    syntax:`result is a divide b`,
    example:`a is 20
b is 5
result is a divide b
say result`,
    challenge:"Divide 20 by 5 and say the answer.",
    answer:`a is 20
b is 5
result is a divide b
say result`
},

{
    title:"🎲 Random Numbers",
    description:"Generate random numbers.",
    syntax:`number is random 1 to 10`,
    example:`dice is random 1 to 6
say dice`,
    challenge:"Generate a random number between 1 and 10 and say it.",
    answer:`number is random 1 to 10
say number`
},

{
    title:"🔁 Repeat Until",
    description:"Repeat code until a condition becomes true.",
    syntax:`repeat until condition
...
end`,
    example:`number is 0
repeat until number is 5
number is number plus 1
end
say number`,
    challenge:"Start a number at 0 and repeat until it reaches 5.",
    answer:`number is 0
repeat until number is 5
number is number plus 1
end`
},

{
    title:"⏳ Wait Until",
    description:"Pause the program until something happens.",
    syntax:`wait until condition`,
    example:`wait until score is 10`,
    challenge:"Create a score variable and use wait until with it.",
    answer:`score is 10
wait until score is 10`
},

{
    title:"⌨️ Keyboard Controls",
    description:"Detect keyboard keys using pressed.",
    syntax:`if key pressed
...
end`,
    example:`if space pressed
say "Jump!"
end`,
    challenge:"Create an IF statement that checks whether the space key is pressed.",
    answer:`if space pressed
say "Jump!"
end`
},

{
    title:"🧠 Boolean Logic",
    description:"Combine conditions using and, or, and not.",
    syntax:`condition and condition
condition or condition
not condition`,
    example:`score is 100
lives is 3

if score is 100 and lives is 3
say "Perfect!"
end`,
    challenge:"Use AND to check that score is 100 and lives is 3.",
    answer:`score is 100
lives is 3
if score is 100 and lives is 3
say "Perfect!"
end`
},

{
    title:"🔎 Contains",
    description:"Check whether text contains another piece of text.",
    syntax:`text contains value`,
    example:`name is "Rivaan"

if name contains "R"
say "Found!"
end`,
    challenge:"Check whether the word 'CodeOS' contains 'OS'.",
    answer:`name is "CodeOS"
if name contains "OS"
say "Found!"
end`
},

{
    title:"↩️ Return Values",
    description:"Functions can return values that can be stored in variables.",
    syntax:`function Name
return value
end`,
    example:`function GetNumber
return 42
end

number is do GetNumber
say number`,
    challenge:"Create a function that returns 100, store its result, and say it.",
    answer:`function GetNumber
return 100
end
number is do GetNumber
say number`
},

{
    title:"🎮 Mini Game",
    description:"Combine variables, loops, math, and output.",
    syntax:`Variables + loops + math`,
    example:`score is 0

repeat 5
score is score plus 10
end

say score`,
    challenge:"Create a score, increase it five times, and display it.",
    answer:`score is 0
repeat 5
score is score plus 10
end
say score`
}

];