

/* =========================================================
   MAC TERMINAL PRO
   Browser-native virtual terminal
========================================================= */


/* =========================================================
   STATE
========================================================= */

const DEFAULT_HOME = "/Users/user";

const state = {

    cwd: DEFAULT_HOME,

    env: {

        HOME: DEFAULT_HOME,

        USER: "user",

        SHELL: "/bin/zsh",

        TERM: "xterm-256color",

        PATH:
            "/usr/local/bin:/usr/bin:/bin"
    },

    vars: {},

    aliases: {

        ll: "ls -la",

        la: "ls -la",

        "..": "cd ..",

        gs: "git status"
    },

    history: [],

    packages: {},

    plugins: {},

    theme: "mac",

    fontSize: 14,

    fs: {}
};


let windows = [];

let activeWindow = null;

let nextPID = 1000;

let jobs = [];


/* =========================================================
   STORAGE
========================================================= */

function saveState() {

    localStorage.setItem(
        "macTerminalPro",
        JSON.stringify(state)
    );
}


function loadState() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "macTerminalPro"
                )
            );

        if (saved) {

            Object.assign(
                state,
                saved
            );
        }

    } catch {

        console.warn(
            "Could not load saved state"
        );
    }


    if (
        !state.fs ||
        !Object.keys(state.fs).length
    ) {

        seedFilesystem();

        saveState();
    }

    applyTheme();
}


function seedFilesystem() {

    const dir = (
        children = []
    ) => ({

        type: "dir",

        children,

        mode: "drwxr-xr-x",

        owner: "user",

        group: "staff"
    });


    const file = (
        content = "",
        mode = "-rw-r--r--"
    ) => ({

        type: "file",

        content,

        mode,

        owner: "user",

        group: "staff"
    });


    state.fs = {

        "/":
            dir([
                "Users",
                "Applications",
                "System",
                "tmp",
                "usr"
            ]),

        "/Users":
            dir(["user"]),

        [DEFAULT_HOME]:
            dir([
                "Desktop",
                "Documents",
                "Downloads",
                "Projects",
                "hello.txt",
                ".zshrc"
            ]),

        [DEFAULT_HOME + "/Desktop"]:
            dir([]),

        [DEFAULT_HOME + "/Documents"]:
            dir([]),

        [DEFAULT_HOME + "/Downloads"]:
            dir([]),

        [DEFAULT_HOME + "/Projects"]:
            dir([
                "CodeOS",
                "NovaHub"
            ]),

        [DEFAULT_HOME + "/Projects/CodeOS"]:
            dir([
                "index.html",
                "workspace.js"
            ]),

        [DEFAULT_HOME + "/Projects/CodeOS/index.html"]:
            file(
                `<h1>CodeOS</h1>
<p>Browser operating system project.</p>`
            ),

        [DEFAULT_HOME + "/Projects/CodeOS/workspace.js"]:
            file(
                `console.log("CodeOS workspace loaded");`
            ),

        [DEFAULT_HOME + "/Projects/NovaHub"]:
            dir(["index.html"]),

        [DEFAULT_HOME + "/Projects/NovaHub/index.html"]:
            file(
                `<h1>NovaHub</h1>`
            ),

        [DEFAULT_HOME + "/hello.txt"]:
            file(
                "Hello from .cdx — CodeOS Terminal!\n" +
                "This is a virtual file.\n" +
                "Try: cat hello.txt | wc -l\n"
            ),

        [DEFAULT_HOME + "/.zshrc"]:
            file(
                "alias ll='ls -la'\n"
            ),

        "/Applications":
            dir([
                "Safari.app",
                "Terminal.app",
                "Finder.app"
            ]),

        "/System":
            dir(["Library"]),

        "/System/Library":
            dir([]),

        "/tmp":
            dir([]),

        "/usr":
            dir(["local"]),

        "/usr/local":
            dir(["bin"]),

        "/usr/local/bin":
            dir([])
    };
}


/* =========================================================
   FILESYSTEM
========================================================= */

function normalizePath(p) {

    const parts = [];

    for (
        const part of
        p.split("/")
    ) {

        if (
            !part ||
            part === "."
        )
            continue;


        if (
            part === ".."
        ) {

            parts.pop();

        } else {

            parts.push(part);
        }
    }


    return "/" + parts.join("/");
}


function resolvePath(p) {

    if (!p)
        return state.cwd;


    p = expandVariables(p);


    if (
        p === "~"
    )
        return state.env.HOME;


    if (
        p.startsWith("~/")
    )
        return normalizePath(
            state.env.HOME +
            p.slice(1)
        );


    if (
        p.startsWith("/")
    )
        return normalizePath(p);


    return normalizePath(
        state.cwd + "/" + p
    );
}


function parentPath(p) {

    if (p === "/")
        return "/";


    const i =
        p.lastIndexOf("/");


    return (
        i <= 0
            ? "/"
            : p.slice(0, i)
    );
}


function basename(p) {

    if (p === "/")
        return "/";


    return p
        .split("/")
        .filter(Boolean)
        .pop();
}


function getNode(p) {

    return state.fs[
        resolvePath(p)
    ];
}


function createDirectory(p) {

    p = resolvePath(p);

    if (state.fs[p])
        throw Error(
            "mkdir: File exists"
        );


    const parent =
        parentPath(p);


    const parentNode =
        state.fs[parent];


    if (
        !parentNode ||
        parentNode.type !== "dir"
    )
        throw Error(
            "mkdir: No such file or directory"
        );


    state.fs[p] = {

        type: "dir",

        children: [],

        mode: "drwxr-xr-x",

        owner: "user",

        group: "staff"
    };


    parentNode.children.push(
        basename(p)
    );


    saveState();
}


function writeVirtualFile(
    p,
    content,
    append = false
) {

    p = resolvePath(p);

    let n =
        state.fs[p];


    if (!n) {

        const parent =
            parentPath(p);


        if (
            !state.fs[parent] ||
            state.fs[parent].type !== "dir"
        )
            throw Error(
                "No such directory"
            );


        n = state.fs[p] = {

            type: "file",

            content: "",

            mode: "-rw-r--r--",

            owner: "user",

            group: "staff"
        };


        state.fs[parent]
            .children
            .push(
                basename(p)
            );
    }


    if (
        n.type !== "file"
    )
        throw Error(
            "Is a directory"
        );


    n.content =
        append
            ? n.content + content
            : content;


    saveState();
}


function removeVirtualFile(
    p
) {

    p = resolvePath(p);

    const n =
        state.fs[p];


    if (!n)
        throw Error(
            "No such file or directory"
        );


    if (
        n.type === "dir" &&
        n.children.length
    )
        throw Error(
            "Directory not empty"
        );


    const parent =
        parentPath(p);


    if (state.fs[parent])
        state.fs[parent].children =
            state.fs[parent].children
                .filter(
                    x =>
                        x !== basename(p)
                );


    delete state.fs[p];

    saveState();
}


/* =========================================================
   VARIABLES
========================================================= */

function expandVariables(text) {

    return String(text)

        .replace(
            /\$(\w+)|\$\{([^}]+)\}/g,

            (_, a, b) => {

                const key =
                    a || b;

                return (
                    state.vars[key] ??
                    state.env[key] ??
                    ""
                );
            }
        )

        .replace(
            /^~(?=\/|$)/,
            state.env.HOME
        );
}


/* =========================================================
   TOKENIZER
========================================================= */

function tokenize(input) {

    const tokens = [];

    let current = "";

    let quote = null;

    let escaped = false;


    for (
        let i = 0;
        i < input.length;
        i++
    ) {

        const c = input[i];


        if (escaped) {

            current += c;

            escaped = false;

            continue;
        }


        if (c === "\\") {

            escaped = true;

            continue;
        }


        if (quote) {

            if (c === quote) {

                quote = null;

            } else {

                current += c;
            }

            continue;
        }


        if (
            c === "'" ||
            c === '"'
        ) {

            quote = c;

            continue;
        }


        if (
            /\s/.test(c)
        ) {

            if (current) {

                tokens.push(current);

                current = "";
            }

        } else {

            current += c;
        }
    }


    if (current)
        tokens.push(current);


    return tokens;
}


/* =========================================================
   SHELL PARSER
========================================================= */

function splitOperator(
    input,
    operator
) {

    let quote = null;


    for (
        let i = 0;
        i < input.length;
        i++
    ) {

        const c = input[i];


        if (
            c === "'" ||
            c === '"'
        ) {

            if (quote === c)
                quote = null;

            else if (!quote)
                quote = c;

            continue;
        }


        if (
            !quote &&
            input.slice(
                i,
                i + operator.length
            ) === operator
        ) {

            return {

                left:
                    input.slice(
                        0,
                        i
                    ),

                right:
                    input.slice(
                        i +
                        operator.length
                    )
            };
        }
    }


    return null;
}


function splitPipes(input) {

    const result = [];

    let start = 0;

    let quote = null;


    for (
        let i = 0;
        i < input.length;
        i++
    ) {

        const c = input[i];


        if (
            c === "'" ||
            c === '"'
        ) {

            if (quote === c)
                quote = null;

            else if (!quote)
                quote = c;

            continue;
        }


        if (
            c === "|" &&
            !quote
        ) {

            result.push(
                input.slice(
                    start,
                    i
                )
            );

            start = i + 1;
        }
    }


    result.push(
        input.slice(start)
    );


    return result;
}


/* =========================================================
   COMMAND REGISTRY
========================================================= */

const commands = {};

const customCommands = {};


function registerCommand(
    name,
    description,
    handler
) {

    customCommands[name] = {

        description,

        handler
    };
}


/* =========================================================
   HELPERS
========================================================= */

function output(
    ctx,
    text,
    type = ""
) {

    const lines =
        String(text ?? "")
            .split("\n");


    for (
        const line of lines
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "output " +
            type;


        div.textContent =
            line;


        ctx.terminal.appendChild(
            div
        );
    }


    ctx.terminal.scrollTop =
        ctx.terminal.scrollHeight;
}


function result(
    stdout = "",
    stderr = "",
    code = 0
) {

    return {

        stdout,
        stderr,
        code
    };
}


/* =========================================================
   BUILTINS
========================================================= */

commands.help = {

    description:
        "Show available commands",

    handler: async () => {

        return result(`
.cdx — CodeOS Terminal 🚀

FILES
  ls cd pwd cat touch mkdir rm rmdir cp mv tree
  stat chmod

TEXT
  grep find head tail sort uniq wc cut tr tee

SHELL
  echo printf env export unset set
  alias unalias which type history

EDITORS
  nano vim

PROCESSES
  ps jobs kill sleep

PACKAGES
  brew npm pip

WEB
  curl fetch open web

SYSTEM
  clear whoami hostname date neofetch

APP
  theme font tabs split newwindow
  plugin plugins

AI
  ai

OPERATORS

  command1 | command2
  command1 > file
  command1 >> file
  command1 && command2
  command1 || command2
  command1 ; command2

VARIABLES

  NAME=value
  export NAME=value
  echo $NAME
  echo $HOME
  echo $(pwd)

TRY

  ls | grep txt
  cat hello.txt | wc -l
  echo hello > test.txt
  echo world >> test.txt
  mkdir test && cd test
`);
    }
};


commands.clear = {

    description: "Clear terminal",

    handler: async (
        args,
        ctx
    ) => {

        ctx.terminal.innerHTML =
            "";

        return result();
    }
};


commands.pwd = {

    description: "Print working directory",

    handler: async () =>
        result(state.cwd)
};


commands.whoami = {

    description: "Current user",

    handler: async () =>
        result(state.env.USER)
};


commands.hostname = {

    description: "Show hostname",

    handler: async () =>
        result("browser-mac")
};


commands.date = {

    description: "Show date",

    handler: async () =>
        result(
            new Date().toString()
        )
};


commands.echo = {

    description: "Print text",

    handler: async args =>
        result(
            expandVariables(
                args.join(" ")
            )
        )
};


commands.printf = {

    description: "Formatted output",

    handler: async args =>
        result(
            expandVariables(
                args.join(" ")
            )
        )
};


commands.env = {

    description: "Show environment",

    handler: async () =>
        result(
            Object.entries(
                state.env
            )
            .map(
                ([k,v]) =>
                    `${k}=${v}`
            )
            .join("\n")
        )
};


commands.set = {

    description: "Show variables",

    handler: async () =>
        result(
            Object.entries({
                ...state.env,
                ...state.vars
            })
            .map(
                ([k,v]) =>
                    `${k}=${v}`
            )
            .join("\n")
        )
};


commands.export = {

    description:
        "Set environment variable",

    handler: async args => {

        for (
            const item of args
        ) {

            const i =
                item.indexOf("=");


            if (i === -1)
                continue;


            state.env[
                item.slice(0,i)
            ] =
                item.slice(i+1);
        }


        saveState();

        return result();
    }
};


commands.unset = {

    description:
        "Remove variable",

    handler: async args => {

        for (
            const key of args
        ) {

            delete state.env[key];

            delete state.vars[key];
        }


        saveState();

        return result();
    }
};


/* =========================================================
   LS
========================================================= */

commands.ls = {

    description:
        "List directory contents",

    handler: async (
        args
    ) => {

        const flags =
            args
                .filter(
                    x =>
                        x.startsWith("-")
                )
                .join("");


        const target =
            args.find(
                x =>
                    !x.startsWith("-")
            ) || ".";


        const p =
            resolvePath(target);


        const n =
            state.fs[p];


        if (!n)
            return result(
                "",
                `ls: ${target}: No such file or directory`,
                1
            );


        if (
            n.type === "file"
        )
            return result(
                basename(p)
            );


        let lines = [];


        for (
            const name
            of n.children
        ) {

            const child =
                state.fs[
                    normalizePath(
                        p + "/" + name
                    )
                ];


            if (
                name.startsWith(".") &&
                !flags.includes("a")
            )
                continue;


            if (
                flags.includes("l")
            ) {

                lines.push(
                    `${child.mode}  ${child.owner}  ${child.group}  ${name}`
                );

            } else {

                lines.push(
                    child.type === "dir"
                        ? name + "/"
                        : name
                );
            }
        }


        return result(
            lines.join(
                flags.includes("l")
                    ? "\n"
                    : "    "
            )
        );
    }
};


/* =========================================================
   CD
========================================================= */

commands.cd = {

    description:
        "Change directory",

    handler: async args => {

        const target =
            resolvePath(
                args[0] || "~"
            );


        const n =
            state.fs[target];


        if (!n)
            return result(
                "",
                "cd: no such file or directory",
                1
            );


        if (
            n.type !== "dir"
        )
            return result(
                "",
                "cd: not a directory",
                1
            );


        state.cwd = target;

        saveState();

        return result();
    }
};


/* =========================================================
   CAT
========================================================= */

commands.cat = {

    description:
        "Print file contents",

    handler: async (
        args,
        ctx
    ) => {

        if (!args.length)
            return result(
                ctx.stdin || ""
            );


        const pieces = [];


        for (
            const file
            of args
        ) {

            const n =
                state.fs[
                    resolvePath(file)
                ];


            if (!n)
                return result(
                    "",
                    `cat: ${file}: No such file or directory`,
                    1
                );


            if (
                n.type !== "file"
            )
                return result(
                    "",
                    `cat: ${file}: Is a directory`,
                    1
                );


            pieces.push(
                n.content
            );
        }


        return result(
            pieces.join("\n")
        );
    }
};


/* =========================================================
   TOUCH
========================================================= */

commands.touch = {

    description:
        "Create file",

    handler: async args => {

        for (
            const file
            of args
        ) {

            const p =
                resolvePath(file);


            if (
                state.fs[p]
            )
                continue;


            writeVirtualFile(
                p,
                ""
            );
        }


        return result();
    }
};


/* =========================================================
   MKDIR
========================================================= */

commands.mkdir = {

    description:
        "Create directory",

    handler: async args => {

        for (
            const dir
            of args
        ) {

            createDirectory(dir);
        }


        return result();
    }
};


/* =========================================================
   RM
========================================================= */

commands.rm = {

    description:
        "Remove file",

    handler: async args => {

        for (
            const file
            of args
        ) {

            try {

                removeVirtualFile(
                    file
                );

            } catch (e) {

                return result(
                    "",
                    `rm: ${e.message}`,
                    1
                );
            }
        }


        return result();
    }
};


/* =========================================================
   RMDIR
========================================================= */

commands.rmdir = {

    description:
        "Remove empty directory",

    handler: async args => {

        for (
            const dir
            of args
        ) {

            const p =
                resolvePath(dir);


            const n =
                state.fs[p];


            if (!n)
                return result(
                    "",
                    "No such directory",
                    1
                );


            if (
                n.children.length
            )
                return result(
                    "",
                    "Directory not empty",
                    1
                );


            removeVirtualFile(
                p
            );
        }


        return result();
    }
};


/* =========================================================
   CP
========================================================= */

commands.cp = {

    description:
        "Copy file",

    handler: async args => {

        if (
            args.length < 2
        )
            return result(
                "",
                "cp: missing operand",
                1
            );


        const src =
            resolvePath(args[0]);


        const dst =
            resolvePath(args[1]);


        const n =
            state.fs[src];


        if (!n)
            return result(
                "",
                "cp: source not found",
                1
            );


        if (
            n.type !== "file"
        )
            return result(
                "",
                "cp: directories not supported",
                1
            );


        writeVirtualFile(
            dst,
            n.content
        );


        state.fs[dst].mode =
            n.mode;


        saveState();

        return result();
    }
};


/* =========================================================
   MV
========================================================= */

commands.mv = {

    description:
        "Move file",

    handler: async args => {

        if (
            args.length < 2
        )
            return result(
                "",
                "mv: missing operand",
                1
            );


        const src =
            resolvePath(args[0]);


        const dst =
            resolvePath(args[1]);


        const n =
            state.fs[src];


        if (!n)
            return result(
                "",
                "mv: source not found",
                1
            );


        writeVirtualFile(
            dst,
            n.content || ""
        );


        state.fs[dst].mode =
            n.mode;


        removeVirtualFile(
            src
        );


        return result();
    }
};


/* =========================================================
   TREE
========================================================= */

commands.tree = {

    description:
        "Display filesystem tree",

    handler: async args => {

        const root =
            resolvePath(
                args[0] || "."
            );


        const lines = [];


        function walk(
            p,
            prefix = ""
        ) {

            const n =
                state.fs[p];


            if (!n)
                return;


            lines.push(
                prefix +
                basename(p) +
                (
                    n.type === "dir"
                        ? "/"
                        : ""
                )
            );


            if (
                n.type === "dir"
            ) {

                for (
                    const child
                    of n.children
                ) {

                    walk(
                        normalizePath(
                            p + "/" + child
                        ),
                        prefix + "  "
                    );
                }
            }
        }


        walk(root);


        return result(
            lines.join("\n")
        );
    }
};


/* =========================================================
   GREP
========================================================= */

commands.grep = {

    description:
        "Search text",

    handler: async (
        args,
        ctx
    ) => {

        let ignoreCase =
            args.includes("-i");

        let invert =
            args.includes("-v");

        let number =
            args.includes("-n");


        args =
            args.filter(
                x =>
                    ![
                        "-i",
                        "-v",
                        "-n"
                    ].includes(x)
            );


        const pattern =
            args.shift();


        if (!pattern)
            return result(
                "",
                "grep: missing pattern",
                1
            );


        let text = "";


        if (args.length) {

            for (
                const file
                of args
            ) {

                const n =
                    state.fs[
                        resolvePath(file)
                    ];


                if (
                    !n ||
                    n.type !== "file"
                )
                    continue;


                text +=
                    n.content +
                    "\n";
            }

        } else {

            text =
                ctx.stdin || "";
        }


        const needle =
            ignoreCase
                ? pattern.toLowerCase()
                : pattern;


        const lines =
            text.split("\n");


        const out = [];


        lines.forEach(
            (line,index) => {

                const hay =
                    ignoreCase
                        ? line.toLowerCase()
                        : line;


                const match =
                    hay.includes(
                        needle
                    );


                if (
                    invert
                        ? !match
                        : match
                ) {

                    out.push(
                        number
                            ? `${index+1}:${line}`
                            : line
                    );
                }
            }
        );


        return result(
            out.join("\n")
        );
    }
};


/* =========================================================
   FIND
========================================================= */

commands.find = {

    description:
        "Find files",

    handler: async args => {

        let root = ".";

        let pattern = null;


        const nameIndex =
            args.indexOf("-name");


        if (
            nameIndex !== -1
        ) {

            pattern =
                args[
                    nameIndex + 1
                ];

            if (
                nameIndex > 0
            )
                root =
                    args[0];
        }


        const start =
            resolvePath(root);


        const outputLines = [];


        function matches(
            name
        ) {

            if (!pattern)
                return true;


            const regex =
                new RegExp(
                    "^" +
                    pattern
                        .replace(
                            /\./g,
                            "\\."
                        )
                        .replace(
                            /\*/g,
                            ".*"
                        ) +
                    "$"
                );


            return regex.test(name);
        }


        function walk(p) {

            const n =
                state.fs[p];


            if (!n)
                return;


            if (
                matches(
                    basename(p)
                )
            )
                outputLines.push(p);


            if (
                n.type === "dir"
            ) {

                n.children.forEach(
                    child =>
                        walk(
                            normalizePath(
                                p + "/" + child
                            )
                        )
                );
            }
        }


        walk(start);


        return result(
            outputLines.join("\n")
        );
    }
};


/* =========================================================
   HEAD / TAIL
========================================================= */

function textCommand(
    args,
    ctx,
    fromEnd
) {

    let count = 10;

    let file = null;


    for (
        let i=0;
        i<args.length;
        i++
    ) {

        if (
            args[i] === "-n"
        ) {

            count =
                Number(
                    args[i+1]
                ) || 10;

            i++;

        } else {

            file =
                args[i];
        }
    }


    let text;


    if (file) {

        const n =
            state.fs[
                resolvePath(file)
            ];


        if (!n)
            return result(
                "",
                "file not found",
                1
            );


        text = n.content;

    } else {

        text =
            ctx.stdin || "";
    }


    const lines =
        text.split("\n");


    return result(
        (
            fromEnd
                ? lines.slice(-count)
                : lines.slice(0,count)
        ).join("\n")
    );
}


commands.head = {

    description:
        "Show first lines",

    handler:
        async (
            args,
            ctx
        ) =>
            textCommand(
                args,
                ctx,
                false
            )
};


commands.tail = {

    description:
        "Show last lines",

    handler:
        async (
            args,
            ctx
        ) =>
            textCommand(
                args,
                ctx,
                true
            )
};


/* =========================================================
   SORT
========================================================= */

commands.sort = {

    description:
        "Sort lines",

    handler: async (
        args,
        ctx
    ) => {

        let reverse =
            args.includes("-r");

        let unique =
            args.includes("-u");


        const file =
            args.find(
                x =>
                    !x.startsWith("-")
            );


        let text;


        if (file) {

            const n =
                state.fs[
                    resolvePath(file)
                ];


            text =
                n?.content || "";

        } else {

            text =
                ctx.stdin || "";
        }


        let lines =
            text.split("\n");


        lines.sort();


        if (reverse)
            lines.reverse();


        if (unique)
            lines =
                [...new Set(lines)];


        return result(
            lines.join("\n")
        );
    }
};


/* =========================================================
   UNIQ
========================================================= */

commands.uniq = {

    description:
        "Remove adjacent duplicate lines",

    handler: async (
        args,
        ctx
    ) => {

        const text =
            ctx.stdin ||
            state.fs[
                resolvePath(
                    args[0] || ""
                )
            ]?.content ||
            "";


        const lines =
            text.split("\n");


        return result(
            lines.filter(
                (x,i) =>
                    i === 0 ||
                    x !== lines[i-1]
            ).join("\n")
        );
    }
};


/* =========================================================
   WC
========================================================= */

commands.wc = {

    description:
        "Count lines words bytes",

    handler: async (
        args,
        ctx
    ) => {

        let text = "";


        if (args.length) {

            const n =
                state.fs[
                    resolvePath(
                        args[args.length-1]
                    )
                ];


            text =
                n?.content || "";

        } else {

            text =
                ctx.stdin || "";
        }


        const lines =
            text.split("\n").length -
            (text.endsWith("\n") ? 1 : 0);


        const words =
            text.trim()
                ? text.trim().split(/\s+/).length
                : 0;


        const bytes =
            new TextEncoder()
                .encode(text)
                .length;


        return result(
            `${lines} ${words} ${bytes}`
        );
    }
};


/* =========================================================
   CUT
========================================================= */

commands.cut = {

    description:
        "Cut text fields",

    handler: async (
        args,
        ctx
    ) => {

        const dIndex =
            args.indexOf("-d");


        const fIndex =
            args.indexOf("-f");


        const delimiter =
            dIndex >= 0
                ? args[dIndex+1]
                : "\t";


        const field =
            fIndex >= 0
                ? Number(
                    args[fIndex+1]
                ) - 1
                : 0;


        const text =
            ctx.stdin || "";


        return result(
            text
                .split("\n")
                .map(
                    line =>
                        line.split(
                            delimiter
                        )[field] || ""
                )
                .join("\n")
        );
    }
};


/* =========================================================
   TR
========================================================= */

commands.tr = {

    description:
        "Translate characters",

    handler: async (
        args,
        ctx
    ) => {

        const from =
            args[0] || "";


        const to =
            args[1] || "";


        const text =
            ctx.stdin || "";


        let out = "";


        for (
            const char
            of text
        ) {

            const i =
                from.indexOf(char);


            out +=
                i >= 0
                    ? (
                        to[i] ??
                        ""
                    )
                    : char;
        }


        return result(out);
    }
};


/* =========================================================
   TEE
========================================================= */

commands.tee = {

    description:
        "Write stdin to file and output",

    handler: async (
        args,
        ctx
    ) => {

        const text =
            ctx.stdin || "";


        if (args[0])
            writeVirtualFile(
                args[0],
                text
            );


        return result(text);
    }
};


/* =========================================================
   HISTORY
========================================================= */

commands.history = {

    description:
        "Command history",

    handler: async () =>
        result(
            state.history
                .map(
                    (x,i) =>
                        `${String(i+1).padStart(4)}  ${x}`
                )
                .join("\n")
        )
};


/* =========================================================
   ALIASES
========================================================= */

commands.alias = {

    description:
        "Create/list aliases",

    handler: async args => {

        if (!args.length) {

            return result(
                Object.entries(
                    state.aliases
                )
                .map(
                    ([k,v]) =>
                        `alias ${k}='${v}'`
                )
                .join("\n")
            );
        }


        for (
            const x
            of args
        ) {

            const i =
                x.indexOf("=");


            if (i <= 0)
                continue;


            state.aliases[
                x.slice(0,i)
            ] =
                x.slice(i+1)
                    .replace(
                        /^['"]|['"]$/g,
                        ""
                    );
        }


        saveState();

        return result();
    }
};


commands.unalias = {

    description:
        "Remove alias",

    handler: async args => {

        args.forEach(
            x =>
                delete state.aliases[x]
        );


        saveState();

        return result();
    }
};


/* =========================================================
   WHICH / TYPE
========================================================= */

commands.which = {

    description:
        "Locate command",

    handler: async args => {

        return result(
            args.map(
                name => {

                    if (
                        commands[name]
                    )
                        return (
                            `/usr/local/bin/${name}`
                        );


                    if (
                        customCommands[name]
                    )
                        return (
                            `/usr/local/bin/${name}`
                        );


                    if (
                        state.aliases[name]
                    )
                        return (
                            `alias:${name}`
                        );


                    return (
                        `${name} not found`
                    );
                }
            ).join("\n")
        );
    }
};


commands.type = {

    description:
        "Describe command",

    handler: async args => {

        return result(
            args.map(
                name => {

                    if (
                        state.aliases[name]
                    )
                        return `${name} is an alias for ${state.aliases[name]}`;


                    if (
                        commands[name]
                    )
                        return `${name} is a shell builtin`;


                    if (
                        customCommands[name]
                    )
                        return `${name} is a plugin command`;


                    return `${name}: not found`;
                }
            ).join("\n")
        );
    }
};


/* =========================================================
   MAN
========================================================= */

commands.man = {

    description:
        "Command manual",

    handler: async args => {

        const name =
            args[0];


        const command =
            commands[name] ||
            customCommands[name];


        if (!command)
            return result(
                "",
                `No manual entry for ${name}`,
                1
            );


        return result(`
NAME
    ${name}

DESCRIPTION
    ${command.description}

.cdx — CodeOS Terminal implementation:
    This command runs inside the browser's
    virtual operating environment.
`);
    }
};


/* =========================================================
   CHMOD
========================================================= */

commands.chmod = {

    description:
        "Change file permissions",

    handler: async args => {

        if (
            args.length < 2
        )
            return result(
                "",
                "chmod MODE FILE",
                1
            );


        const mode =
            args[0];


        const file =
            resolvePath(
                args[1]
            );


        const n =
            state.fs[file];


        if (!n)
            return result(
                "",
                "No such file",
                1
            );


        if (
            mode === "+x"
        ) {

            n.mode =
                n.mode
                    .replace(
                        "rw-",
                        "rwx"
                    );

        } else if (
            mode === "-x"
        ) {

            n.mode =
                n.mode
                    .replace(
                        "rwx",
                        "rw-"
                    );

        } else {

            const numeric =
                mode.match(
                    /^[0-7]{3,4}$/
                );


            if (numeric) {

                const digits =
                    numeric[0].slice(-3);


                const bits =
                    digits
                        .split("")
                        .map(
                            Number
                        );


                const perm =
                    n.type === "dir"
                        ? "d"
                        : "-";


                n.mode =
                    perm +
                    bits
                        .map(
                            x =>
                                (
                                    x&4
                                        ? "r"
                                        : "-"
                                ) +
                                (
                                    x&2
                                        ? "w"
                                        : "-"
                                ) +
                                (
                                    x&1
                                        ? "x"
                                        : "-"
                                )
                        )
                        .join("");
            }
        }


        saveState();

        return result();
    }
};


/* =========================================================
   STAT
========================================================= */

commands.stat = {

    description:
        "File information",

    handler: async args => {

        const p =
            resolvePath(
                args[0] || "."
            );


        const n =
            state.fs[p];


        if (!n)
            return result(
                "",
                "No such file",
                1
            );


        return result(
            JSON.stringify(
                {
                    path: p,
                    type: n.type,
                    mode: n.mode,
                    owner: n.owner,
                    group: n.group,
                    size:
                        n.type === "file"
                            ? n.content.length
                            : n.children.length
                },
                null,
                2
            )
        );
    }
};


/* =========================================================
   PROCESSES
========================================================= */

commands.ps = {

    description:
        "List processes",

    handler: async () => {

        const lines = [
            "PID     STAT     COMMAND",
            `${nextPID}     S        zsh`,
            `${nextPID+1}     S        terminal-ui`
        ];


        jobs.forEach(
            job =>
                lines.push(
                    `${job.pid}     ${job.status}        ${job.command}`
                )
        );


        return result(
            lines.join("\n")
        );
    }
};


commands.jobs = {

    description:
        "List background jobs",

    handler: async () => {

        if (!jobs.length)
            return result(
                "No active jobs."
            );


        return result(
            jobs.map(
                (job,i) =>
                    `[${i+1}]  ${job.status}  ${job.command}`
            ).join("\n")
        );
    }
};


commands.kill = {

    description:
        "Terminate virtual process",

    handler: async args => {

        const pid =
            Number(args[0]);


        const job =
            jobs.find(
                x =>
                    x.pid === pid
            );


        if (!job)
            return result(
                "",
                `kill: ${pid}: no such process`,
                1
            );


        job.status =
            "terminated";


        return result(
            `Terminated ${pid}`,
            "",
            0
        );
    }
};


commands.sleep = {

    description:
        "Wait for seconds",

    handler: async args => {

        const seconds =
            Math.min(
                Number(args[0]) || 1,
                30
            );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    seconds * 1000
                )
        );


        return result();
    }
};


/* =========================================================
   PACKAGE MANAGER
========================================================= */

const packageCatalog = {

    python: "Python runtime simulation",

    node: "Node.js runtime simulation",

    git: "Git version control simulation",

    wget: "Network downloader",

    jq: "JSON processor",

    ripgrep: "Fast text search",

    tree: "Directory tree utility",

    htop: "Process viewer",

    figlet: "ASCII text renderer",

    requests: "Python HTTP library",

    numpy: "Numerical Python package",

    pandas: "Python data analysis package"
};


async function packageManager(
    manager,
    args
) {

    const action =
        args[0];


    if (
        action === "install"
    ) {

        const installed = [];


        for (
            const name
            of args.slice(1)
        ) {

            state.packages[name] = {

                manager,

                version: "1.0.0",

                description:
                    packageCatalog[name] ||
                    "User-installed package"
            };


            installed.push(
                `${manager}: installed ${name}`
            );
        }


        saveState();


        return result(
            installed.join("\n")
        );
    }


    if (
        action === "uninstall" ||
        action === "remove"
    ) {

        args
            .slice(1)
            .forEach(
                x =>
                    delete state.packages[x]
            );


        saveState();


        return result(
            "Packages removed."
        );
    }


    if (
        action === "list"
    ) {

        return result(
            Object.entries(
                state.packages
            )
            .map(
                ([name,p]) =>
                    `${name}@${p.version} (${p.manager})`
            )
            .join("\n") ||
            "No packages installed."
        );
    }


    if (
        action === "search"
    ) {

        const query =
            args[1] || "";


        return result(
            Object.keys(
                packageCatalog
            )
            .filter(
                x =>
                    x.includes(query)
            )
            .join("\n")
        );
    }


    return result(`
${manager} install <package>
${manager} uninstall <package>
${manager} list
${manager} search <term>
`);
}


commands.brew = {

    description:
        "Homebrew-style package manager",

    handler:
        async args =>
            packageManager(
                "brew",
                args
            )
};


commands.npm = {

    description:
        "npm-style package manager",

    handler:
        async args =>
            packageManager(
                "npm",
                args
            )
};


commands.pip = {

    description:
        "pip-style package manager",

    handler:
        async args =>
            packageManager(
                "pip",
                args
            )
};


commands.pip3 =
    commands.pip;


/* =========================================================
   WEB COMMANDS
========================================================= */

commands.open = {

    description:
        "Open a website",

    handler: async args => {

        let url =
            args[0] || "";


        if (
            !/^https?:\/\//i.test(
                url
            )
        )
            url =
                "https://" + url;


        window.open(
            url,
            "_blank",
            "noopener"
        );


        return result(
            `Opened ${url}`
        );
    }
};


commands.web = {

    description:
        "Search the web",

    handler: async args => {

        const query =
            encodeURIComponent(
                args.join(" ")
            );


        const url =
            "https://www.google.com/search?q=" +
            query;


        window.open(
            url,
            "_blank",
            "noopener"
        );


        return result(
            `Searching the web for: ${args.join(" ")}`
        );
    }
};


commands.curl = {

    description:
        "Fetch a URL",

    handler: async args => {

        const url =
            args.find(
                x =>
                    /^https?:\/\//i.test(x)
            );


        if (!url)
            return result(
                "",
                "curl: URL required",
                1
            );


        try {

            const response =
                await fetch(url);


            const text =
                await response.text();


            return result(
                text
            );

        } catch {

            return result(
                "",
                "curl: request blocked by browser CORS/network policy",
                1
            );
        }
    }
};


commands.fetch =
    commands.curl;


/* =========================================================
   AI
========================================================= */

commands.ai = {

    description:
        "AI assistant",

    handler: async (
        args
    ) => {

        const prompt =
            args.join(" ");


        if (!prompt)
            return result(`
AI COMMANDS

ai explain <text>
ai ask <question>
ai code <description>

For real model requests, configure
an AI endpoint in Terminal Settings.
`);


        if (
            state.aiEndpoint
        ) {

            try {

                const response =
                    await fetch(
                        state.aiEndpoint,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    prompt
                                })
                        }
                    );


                return result(
                    await response.text()
                );

            } catch {

                return result(
                    "",
                    "AI request failed.",
                    1
                );
            }
        }


        return result(`
AI received:

${prompt}

No AI endpoint is configured.

Open Terminal Settings and add your
own compatible endpoint if you want
live model requests.
`);
    }
};


/* =========================================================
   SYSTEM FUN
========================================================= */

commands.neofetch = {

    description:
        "System information",

    handler: async () =>
        result(`
        .--.
       |o_o |     user@browser-mac
       |:_/ |     ----------------
      //   \\ \\    OS: BrowserOS
     (|     | )   Shell: zsh-like
    /'\\_   _/\\    Terminal: .cdx — CodeOS Terminal
    \\___)=(___/   FS: IndexedDB
                  CPU: Virtual CPU
`)
};


commands.random = {

    description:
        "Generate random number",

    handler: async args => {

        const max =
            Number(args[0]) || 100;


        return result(
            String(
                Math.floor(
                    Math.random() *
                    max
                ) + 1
            )
        );
    }
};


commands.cowsay = {

    description:
        "ASCII cow",

    handler: async args => {

        const text =
            args.join(" ") ||
            "Moooo!";


        return result(`
 ${"-".repeat(text.length+2)}
< ${text} >
 ${"-".repeat(text.length+2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`);
    }
};


commands.matrix = {

    description:
        "Matrix animation",

    handler: async () => {

        const chars =
            "01ABCDEFGHIJKLMNOPQRSTUVWXYZ";


        let out = "";


        for (
            let y=0;
            y<15;
            y++
        ) {

            let line = "";


            for (
                let x=0;
                x<65;
                x++
            ) {

                line +=
                    chars[
                        Math.floor(
                            Math.random() *
                            chars.length
                        )
                    ];
            }


            out +=
                line + "\n";
        }


        return result(out);
    }
};


/* =========================================================
   THEME / FONT
========================================================= */

commands.theme = {

    description:
        "Change theme",

    handler: async args => {

        const name =
            args[0] || "mac";


        state.theme =
            name;


        applyTheme();


        saveState();


        return result(
            `Theme changed to ${name}`
        );
    }
};


commands.font = {

    description:
        "Change terminal font size",

    handler: async args => {

        const size =
            Math.max(
                10,
                Math.min(
                    26,
                    Number(
                        args[0]
                    ) || 14
                )
            );


        state.fontSize =
            size;


        applyTheme();


        saveState();


        return result(
            `Font size: ${size}px`
        );
    }
};


function applyTheme() {

    document.documentElement
        .dataset.theme =
            state.theme;


    document.documentElement
        .style
        .setProperty(
            "--terminal-font",
            state.fontSize + "px"
        );
}


/* =========================================================
   TABS / WINDOWS
========================================================= */

function terminalPrompt() {

    const displayPath =
        state.cwd === state.env.HOME
            ? "~"
            : state.cwd
                .replace(
                    state.env.HOME,
                    "~"
                );


    return `${state.env.USER}@browser-mac ${displayPath} %`;
}


function createTerminalWindow() {

    const win =
        document.createElement(
            "div"
        );


    win.className =
        "terminal-window";


    win.style.left =
        `${70 + windows.length * 30}px`;


    win.style.top =
        `${55 + windows.length * 25}px`;


    win.style.zIndex =
        ++createTerminalWindow.z;


    win.innerHTML = `

        <div class="titlebar">

            <div class="traffic-lights">

                <button
                    class="light close"
                ></button>

                <button
                    class="light minimize"
                ></button>

                <button
                    class="light maximize"
                ></button>

            </div>

            <div class="window-title">
                user — zsh — .cdx — CodeOS Terminal
            </div>

            <div class="window-actions">
                ⌘K
            </div>

        </div>


        <div class="tabs">

            <div class="tab active">
                <span>zsh</span>
            </div>

            <div class="new-tab">
                +
            </div>

        </div>


        <div class="window-body">

            <div class="panes">

                <div class="pane">

                    <div class="terminal"></div>

                </div>

            </div>

        </div>


        <div class="statusbar">

            <span>zsh-like</span>

            <span>UTF-8</span>

            <span>IndexedDB</span>

            <span class="cwd-status">
                ${state.cwd}
            </span>

        </div>
    `;


    document
        .getElementById("windows")
        .appendChild(win);


    const context = {

        window: win,

        terminal:
            win.querySelector(
                ".terminal"
            ),

        pane:
            win.querySelector(
                ".pane"
            ),

        historyIndex:
            state.history.length
    };


    windows.push(context);

    activeWindow =
        context;


    setupWindow(
        context
    );


    printWelcome(
        context
    );


    createPrompt(
        context
    );


    return context;
}


createTerminalWindow.z =
    10;


function newTerminal() {

    createTerminalWindow();
}


function setupWindow(ctx) {

    const win =
        ctx.window;


    win.addEventListener(
        "mousedown",
        () => {

            activeWindow =
                ctx;

            win.style.zIndex =
                ++createTerminalWindow.z;
        }
    );


    const titlebar =
        win.querySelector(
            ".titlebar"
        );


    let dragging = false;

    let offsetX = 0;

    let offsetY = 0;


    titlebar.addEventListener(
        "mousedown",
        e => {

            if (
                e.target.classList
                    .contains("light")
            )
                return;


            if (
                win.classList
                    .contains("maximized")
            )
                return;


            dragging = true;


            offsetX =
                e.clientX -
                win.offsetLeft;


            offsetY =
                e.clientY -
                win.offsetTop;
        }
    );


    document.addEventListener(
        "mousemove",
        e => {

            if (!dragging)
                return;


            win.style.left =
                Math.max(
                    0,
                    e.clientX -
                    offsetX
                ) + "px";


            win.style.top =
                Math.max(
                    30,
                    e.clientY -
                    offsetY
                ) + "px";
        }
    );


    document.addEventListener(
        "mouseup",
        () =>
            dragging = false
    );


    win.querySelector(
        ".close"
    ).onclick = () => {

        win.remove();

        windows =
            windows.filter(
                x =>
                    x !== ctx
            );
    };


    win.querySelector(
        ".minimize"
    ).onclick = () => {

        win.style.display =
            win.style.display === "none"
                ? "flex"
                : "none";
    };


    win.querySelector(
        ".maximize"
    ).onclick = () => {

        win.classList.toggle(
            "maximized"
        );
    };


    win.querySelector(
        ".new-tab"
    ).onclick = () =>
        addTab(ctx);


    ctx.terminal.addEventListener(
        "click",
        () => {

            ctx.terminal
                .querySelector(
                    ".command-input"
                )
                ?.focus();
        }
    );
}


function addTab(ctx) {

    const tabs =
        ctx.window.querySelector(
            ".tabs"
        );


    const tab =
        document.createElement(
            "div"
        );


    tab.className =
        "tab";


    tab.innerHTML =
        `
        <span>zsh</span>
        <span class="tab-close">×</span>
        `;


    tabs.insertBefore(
        tab,
        tabs.querySelector(
            ".new-tab"
        )
    );


    const panes =
        ctx.window.querySelector(
            ".panes"
        );


    panes.innerHTML = `

        <div class="pane">

            <div class="terminal"></div>

        </div>
    `;


    ctx.terminal =
        panes.querySelector(
            ".terminal"
        );


    printWelcome(ctx);

    createPrompt(ctx);
}


/* =========================================================
   SPLIT
========================================================= */

commands.split = {

    description:
        "Split terminal pane",

    handler: async (
        args,
        ctx
    ) => {

        const panes =
            ctx.window.querySelector(
                ".panes"
            );


        const pane =
            document.createElement(
                "div"
            );


        pane.className =
            "pane";


        pane.innerHTML =
            `<div class="terminal"></div>`;


        panes.appendChild(
            pane
        );


        const terminal =
            pane.querySelector(
                ".terminal"
            );


        const newCtx = {

            window:
                ctx.window,

            terminal,

            pane
        };


        output(
            newCtx,
            "Split pane ready.",
            "success"
        );


        createPrompt(
            newCtx
        );


        return result();
    }
};


commands.newwindow = {

    description:
        "Create terminal window",

    handler: async () => {

        newTerminal();

        return result();
    }
};


commands.tabs = {

    description:
        "Create terminal tab",

    handler: async (
        args,
        ctx
    ) => {

        addTab(ctx);

        return result();
    }
};


/* =========================================================
   EDITORS
========================================================= */

async function openEditor(
    ctx,
    filename,
    mode
) {

    if (!filename)
        return result(
            "",
            `${mode}: file required`,
            1
        );


    const p =
        resolvePath(
            filename
        );


    const n =
        state.fs[p];


    if (!n)
        return result(
            "",
            `${filename}: No such file`,
            1
        );


    if (
        n.type !== "file"
    )
        return result(
            "",
            "Is a directory",
            1
        );


    const editor =
        document.createElement(
            "div"
        );


    editor.className =
        "editor";


    editor.innerHTML = `

        <div class="editor-bar">

            ${mode.toUpperCase()}
            •
            ${p}

            • Ctrl+S save
            • Esc close

        </div>

        <textarea></textarea>

    `;


    ctx.pane.appendChild(
        editor
    );


    const textarea =
        editor.querySelector(
            "textarea"
        );


    textarea.value =
        n.content;


    textarea.focus();


    textarea.addEventListener(
        "keydown",
        e => {

            if (
                e.ctrlKey &&
                e.key.toLowerCase()
                    === "s"
            ) {

                e.preventDefault();


                n.content =
                    textarea.value;


                saveState();


                editor.remove();


                output(
                    ctx,
                    `"${p}" saved`,
                    "success"
                );


                createPrompt(ctx);
            }


            if (
                e.key === "Escape"
            ) {

                editor.remove();

                createPrompt(ctx);
            }
        }
    );


    return result();
}


commands.nano = {

    description:
        "Nano-style browser editor",

    handler: (
        args,
        ctx
    ) =>
        openEditor(
            ctx,
            args[0],
            "nano"
        )
};


commands.vim = {

    description:
        "Vim-style browser editor",

    handler: (
        args,
        ctx
    ) =>
        openEditor(
            ctx,
            args[0],
            "vim"
        )
};


/* =========================================================
   PLUGINS
========================================================= */

commands.plugins = {

    description:
        "List installed plugins",

    handler: async () => {

        return result(
            Object.entries(
                state.plugins
            )
            .map(
                ([name,p]) =>
                    `${name} — ${p.description}`
            )
            .join("\n") ||
            "No plugins installed."
        );
    }
};


commands.plugin = {

    description:
        "Plugin manager",

    handler: async (
        args
    ) => {

        const action =
            args[0];


        if (
            action === "list"
        )
            return commands.plugins.handler();


        if (
            action === "remove"
        ) {

            const name =
                args[1];


            delete state.plugins[name];

            delete customCommands[name];


            saveState();


            return result(
                `Removed plugin ${name}`
            );
        }


        if (
            action === "install"
        ) {

            return result(
                "",
                `plugin install requires a trusted plugin source.

For safety, JavaScript plugins should be loaded
from your own local plugin code rather than arbitrary
websites.`
                ,
                1
            );
        }


        return result(`
plugin list
plugin install <source>
plugin remove <name>
`);
    }
};


/* =========================================================
   SHELL SCRIPTS
========================================================= */

async function executeScript(
    filename,
    ctx
) {

    const p =
        resolvePath(
            filename
        );


    const n =
        state.fs[p];


    if (!n)
        return result(
            "",
            "script not found",
            1
        );


    if (
        !n.mode.includes("x")
    )
        return result(
            "",
            "permission denied",
            126
        );


    const lines =
        n.content.split("\n");


    let last =
        result();


    for (
        let line
        of lines
    ) {

        line =
            line.trim();


        if (
            !line ||
            line.startsWith("#!")
        )
            continue;


        last =
            await executeShell(
                line,
                ctx
            );


        if (
            last.code !== 0
        )
            break;
    }


    return last;
}


/* =========================================================
   COMMAND EXECUTION
========================================================= */

async function executeCommand(
    input,
    ctx
) {

    input =
        expandVariables(
            input
        );


    const tokens =
        tokenize(input);


    if (!tokens.length)
        return result();


    let name =
        tokens.shift();


    let args =
        tokens;


    /* aliases */

    if (
        state.aliases[name]
    ) {

        return executeShell(
            state.aliases[name] +
            (
                args.length
                    ? " " +
                      args.join(" ")
                    : ""
            ),
            ctx
        );
    }


    /* executable script */

    if (
        name.startsWith("./") ||
        name.endsWith(".sh")
    ) {

        const script =
            await executeScript(
                name,
                ctx
            );


        return script;
    }


    const command =
        commands[name] ||
        customCommands[name];


    if (!command) {

        return result(
            "",
            `zsh: command not found: ${name}`,
            127
        );
    }


    try {

        return await command.handler(
            args,
            ctx
        );

    } catch (e) {

        return result(
            "",
            e.message,
            1
        );
    }
}


/* =========================================================
   REDIRECTION
========================================================= */

function parseRedirection(
    input
) {

    const patterns = [

        {
            regex: />>(?:\s*)([^\s]+)/,
            op: ">>"
        },

        {
            regex: />(?:\s*)([^\s]+)/,
            op: ">"
        }
    ];


    for (
        const p
        of patterns
    ) {

        const match =
            input.match(
                p.regex
            );


        if (match) {

            return {

                command:
                    input.replace(
                        match[0],
                        ""
                    ).trim(),

                operator:
                    p.op,

                file:
                    match[1]
            };
        }
    }


    return {
        command: input.trim()
    };
}


/* =========================================================
   SHELL
========================================================= */

async function executeShell(
    input,
    ctx
) {

    input =
        input.trim();


    if (!input)
        return result();


    /* command substitution */

    const substitution =
        /\$\(([^()]*)\)/g;


    let match;


    while (
        (match =
            substitution.exec(input))
    ) {

        const subContext = {

            ...ctx,

            terminal:
                document.createElement(
                    "div"
                ),

            stdin: ""
        };


        const sub =
            await executeShell(
                match[1],
                subContext
            );


        input =
            input.replace(
                match[0],
                sub.stdout.trim()
            );
    }


    /* && */

    const and =
        splitOperator(
            input,
            "&&"
        );


    if (and) {

        const first =
            await executeShell(
                and.left,
                ctx
            );


        if (
            first.code === 0
        )
            return executeShell(
                and.right,
                ctx
            );


        return first;
    }


    /* || */

    const or =
        splitOperator(
            input,
            "||"
        );


    if (or) {

        const first =
            await executeShell(
                or.left,
                ctx
            );


        if (
            first.code !== 0
        )
            return executeShell(
                or.right,
                ctx
            );


        return first;
    }


    /* ; */

    const semicolon =
        splitOperator(
            input,
            ";"
        );


    if (semicolon) {

        await executeShell(
            semicolon.left,
            ctx
        );


        return executeShell(
            semicolon.right,
            ctx
        );
    }


    /* pipes */

    const pipeline =
        splitPipes(input);


    if (
        pipeline.length > 1
    ) {

        let stdin = "";

        let final =
            result();


        for (
            const command
            of pipeline
        ) {

            const pipeContext = {

                ...ctx,

                stdin,

                terminal:
                    document.createElement(
                        "div"
                    )
            };


            final =
                await executeShell(
                    command.trim(),
                    pipeContext
                );


            stdin =
                final.stdout;
        }


        if (
            final.code === 0 &&
            stdin
        ) {

            output(
                ctx,
                stdin
            );
        }


        return final;
    }


    /* redirection */

    const redirect =
        parseRedirection(
            input
        );


    const commandResult =
        await executeCommand(
            redirect.command,
            {
                ...ctx,

                stdin:
                    ctx.stdin || ""
            }
        );


    if (
        redirect.operator &&
        redirect.file
    ) {

        writeVirtualFile(
            redirect.file,
            commandResult.stdout,
            redirect.operator === ">>"
        );


        return result(
            "",
            commandResult.stderr,
            commandResult.code
        );
    }


    return commandResult;
}


/* =========================================================
   PROMPT
========================================================= */

function createPrompt(
    ctx
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "prompt-line";


    const prompt =
        document.createElement(
            "span"
        );


    prompt.className =
        "prompt";


    prompt.textContent =
        terminalPrompt();


    const input =
        document.createElement(
            "input"
        );


    input.className =
        "command-input";


    input.autocomplete =
        "off";


    input.spellcheck =
        false;


    row.append(
        prompt,
        input
    );


    ctx.terminal.appendChild(
        row
    );


    input.focus();


    input.addEventListener(
        "keydown",
        async e => {

            if (
                e.key === "Enter"
            ) {

                const command =
                    input.value;


                row.remove();


                if (
                    command.trim()
                ) {

                    state.history.push(
                        command
                    );


                    state.history =
                        state.history.slice(
                            -500
                        );


                    saveState();


                    const result =
                        await executeShell(
                            command,
                            ctx
                        );


                    if (
                        result.stdout
                    )
                        output(
                            ctx,
                            result.stdout
                        );


                    if (
                        result.stderr
                    )
                        output(
                            ctx,
                            result.stderr,
                            "error"
                        );
                }


                updateStatus(ctx);

                createPrompt(ctx);

                return;
            }


            if (
                e.key === "ArrowUp"
            ) {

                e.preventDefault();


                ctx.historyIndex =
                    Math.max(
                        0,
                        (
                            ctx.historyIndex ??
                            state.history.length
                        ) - 1
                    );


                input.value =
                    state.history[
                        ctx.historyIndex
                    ] || "";
            }


            if (
                e.key === "ArrowDown"
            ) {

                e.preventDefault();


                ctx.historyIndex =
                    Math.min(
                        state.history.length,
                        (
                            ctx.historyIndex ??
                            state.history.length
                        ) + 1
                    );


                input.value =
                    state.history[
                        ctx.historyIndex
                    ] || "";
            }


            if (
                e.key === "Tab"
            ) {

                e.preventDefault();


                autocomplete(
                    input
                );
            }


            if (
                e.ctrlKey &&
                e.key.toLowerCase()
                    === "c"
            ) {

                e.preventDefault();


                row.remove();


                output(
                    ctx,
                    "^C",
                    "warning"
                );


                createPrompt(ctx);
            }
        }
    );


    ctx.historyIndex =
        state.history.length;


    ctx.terminal.scrollTop =
        ctx.terminal.scrollHeight;
}


/* =========================================================
   AUTOCOMPLETE
========================================================= */

function autocomplete(
    input
) {

    const words =
        tokenize(
            input.value
        );


    const current =
        words[
            words.length - 1
        ] || "";


    const commandNames =
        [
            ...new Set(
                [
                    ...Object.keys(
                        commands
                    ),

                    ...Object.keys(
                        customCommands
                    ),

                    ...Object.keys(
                        state.aliases
                    )
                ]
            )
        ];


    const matches =
        commandNames.filter(
            x =>
                x.startsWith(
                    current
                )
        );


    if (
        matches.length === 1
    ) {

        input.value =
            input.value.slice(
                0,
                input.value.length -
                current.length
            ) +
            matches[0];
    }
}


/* =========================================================
   WELCOME
========================================================= */

function printWelcome(
    ctx
) {

    output(
        ctx,
        `Last login: ${new Date().toLocaleString()}

╭──────────────────────────────────────────────╮
│                 .CDX 👾                     │
│            CodeOS Terminal                   │
│                                              │
│  Virtual filesystem • CodeOS tools           │
│  CDX utilities • DevTools • Plus+            │
│                                              │
│  Type "cdx" or "help" to get started.       │
╰──────────────────────────────────────────────╯
`,
        "success"
    );
}


function updateStatus(
    ctx
) {

    const el =
        ctx.window.querySelector(
            ".cwd-status"
        );


    if (el)
        el.textContent =
            state.cwd;
}


/* =========================================================
   COMMAND PALETTE
========================================================= */

function openCommandPalette() {

    const overlay =
        document.getElementById(
            "paletteOverlay"
        );


    overlay.classList.remove(
        "hidden"
    );


    const input =
        document.getElementById(
            "paletteInput"
        );


    input.value =
        "";


    renderPalette();


    input.focus();
}


function renderPalette() {

    const input =
        document.getElementById(
            "paletteInput"
        );


    const query =
        input.value
            .toLowerCase();


    const all = [
        ...Object.entries(commands)
            .map(
                ([name,c]) => ({
                    name,
                    description:
                        c.description
                })
            ),

        {
            name: "New Terminal",
            description:
                "Create terminal window"
        },

        {
            name: "Settings",
            description:
                "Open settings"
        }
    ];


    const results =
        all.filter(
            x =>
                x.name
                    .toLowerCase()
                    .includes(query)
        )
        .slice(0,25);


    const container =
        document.getElementById(
            "paletteResults"
        );


    container.innerHTML =
        results.map(
            x =>
                `<div class="palette-item"
                      data-name="${escapeHTML(x.name)}">
                    ${escapeHTML(x.name)}
                    <small>
                        ${escapeHTML(x.description)}
                    </small>
                 </div>`
        ).join("");


    container
        .querySelectorAll(
            ".palette-item"
        )
        .forEach(
            item => {

                item.onclick = () => {

                    const name =
                        item.dataset.name;


                    document
                        .getElementById(
                            "paletteOverlay"
                        )
                        .classList.add(
                            "hidden"
                        );


                    if (
                        name ===
                        "New Terminal"
                    ) {

                        newTerminal();

                    } else if (
                        name ===
                        "Settings"
                    ) {

                        openSettings();

                    } else if (
                        activeWindow
                    ) {

                        const input =
                            activeWindow
                                .terminal
                                .querySelector(
                                    ".command-input"
                                );


                        if (input) {

                            input.value =
                                name;

                            input.focus();
                        }
                    }
                };
            }
        );
}


document
    .getElementById(
        "paletteInput"
    )
    .addEventListener(
        "input",
        renderPalette
    );


document.addEventListener(
    "keydown",
    e => {

        if (
            (e.ctrlKey ||
             e.metaKey) &&
            e.shiftKey &&
            e.key.toLowerCase()
                === "p"
        ) {

            e.preventDefault();

            openCommandPalette();
        }


        if (
            e.key === "Escape"
        ) {

            document
                .getElementById(
                    "paletteOverlay"
                )
                .classList.add(
                    "hidden"
                );
        }
    }
);


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    const overlay =
        document.getElementById(
            "settingsOverlay"
        );


    overlay.classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "themeSelect"
        )
        .value =
            state.theme;


    document
        .getElementById(
            "fontSlider"
        )
        .value =
            state.fontSize;


    document
        .getElementById(
            "fontValue"
        )
        .textContent =
            state.fontSize +
            "px";
}


function closeSettings() {

    document
        .getElementById(
            "settingsOverlay"
        )
        .classList.add(
            "hidden"
        );
}


function saveSettings() {

    state.theme =
        document
            .getElementById(
                "themeSelect"
            )
            .value;


    state.fontSize =
        Number(
            document
                .getElementById(
                    "fontSlider"
                )
                .value
        );


    state.aiEndpoint =
        document
            .getElementById(
                "aiEndpoint"
            )
            .value;


    applyTheme();

    saveState();

    closeSettings();
}


document
    .getElementById(
        "fontSlider"
    )
    .addEventListener(
        "input",
        e => {

            document
                .getElementById(
                    "fontValue"
                )
                .textContent =
                    e.target.value +
                    "px";
        }
    );


/* =========================================================
   DRAG & DROP
========================================================= */

document.addEventListener(
    "dragover",
    e => {

        e.preventDefault();


        document
            .getElementById(
                "dropOverlay"
            )
            .classList.remove(
                "hidden"
            );
    }
);


document.addEventListener(
    "dragleave",
    e => {

        if (
            e.relatedTarget
        )
            return;


        document
            .getElementById(
                "dropOverlay"
            )
            .classList.add(
                "hidden"
            );
    }
);


document.addEventListener(
    "drop",
    async e => {

        e.preventDefault();


        document
            .getElementById(
                "dropOverlay"
            )
            .classList.add(
                "hidden"
            );


        if (!e.dataTransfer.files.length)
            return;


        const ctx =
            activeWindow;


        for (
            const file
            of e.dataTransfer.files
        ) {

            try {

                const text =
                    await file.text();


                writeVirtualFile(
                    `${DEFAULT_HOME}/Downloads/${file.name}`,
                    text
                );


                output(
                    ctx,
                    `✓ Imported ${file.name} → ~/Downloads`,
                    "success"
                );

            } catch {

                output(
                    ctx,
                    `Could not import ${file.name}`,
                    "error"
                );
            }
        }
    }
);


/* =========================================================
   FILE MANAGER
========================================================= */

function openFileManager() {

    const ctx =
        createTerminalWindow();


    output(
        ctx,
        `
FILE MANAGER

Virtual filesystem mounted at /

Try:

cd ~/Downloads
ls -la
cat <file>
nano <file>

Drag files anywhere into the app to import them.
`,
        "info"
    );
}


/* =========================================================
   UTIL
========================================================= */

function escapeHTML(
    text
) {

    return String(text)
        .replace(
            /[&<>"']/g,
            c => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[c])
        );
}


/* =========================================================
   START
========================================================= */

loadState();

newTerminal();


/* CLOCK */

function updateClock() {

    document
        .getElementById(
            "clock"
        )
        .textContent =
            new Date()
                .toLocaleString(
                    [],
                    {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );
}


updateClock();

setInterval(
    updateClock,
    1000
);


/* GLOBAL SHORTCUTS */

document.addEventListener(
    "keydown",
    e => {

        if (
            (e.ctrlKey ||
             e.metaKey) &&
            e.key.toLowerCase()
                === "l"
        ) {

            e.preventDefault();

            if (activeWindow) {

                activeWindow
                    .terminal
                    .innerHTML = "";

                createPrompt(
                    activeWindow
                );
            }
        }


        if (
            (e.ctrlKey ||
             e.metaKey) &&
            e.key.toLowerCase()
                === "n"
        ) {

            e.preventDefault();

            newTerminal();
        }
    }
);

/* =========================================================
   👾 CODEOS / CDX COMMANDS
========================================================= */

/* =========================================================
   👾 CODEOS CDX UI
   In-terminal modal system
========================================================= */

function closeCDXModal(modal) {

    if (!modal)
        return;

    modal.remove();

}


function createCDXModal({

    title = "CodeOS",

    subtitle = "",

    content = "",

    buttons = []

} = {}) {

    return new Promise(resolve => {

        const modal =
            document.createElement("div");

        modal.className =
            "cdx-modal-overlay";

        modal.innerHTML = `

            <div class="cdx-modal">

                <div class="cdx-modal-header">

                    <div>

                        <div class="cdx-modal-title">
                            ${escapeHTML(title)}
                        </div>

                        ${
                            subtitle
                                ? `
                                <div class="cdx-modal-subtitle">
                                    ${escapeHTML(subtitle)}
                                </div>
                                `
                                : ""
                        }

                    </div>

                    <button
                        class="cdx-modal-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>

                <div class="cdx-modal-content">
                    ${content}
                </div>

                <div class="cdx-modal-actions">

                    ${
                        buttons
                            .map(
                                button => `
                                    <button
                                        type="button"
                                        class="
                                            cdx-modal-button
                                            ${
                                                button.primary
                                                    ? "primary"
                                                    : ""
                                            }
                                        "
                                        data-action="${escapeHTML(
                                            button.id
                                        )}"
                                    >
                                        ${escapeHTML(
                                            button.label
                                        )}
                                    </button>
                                `
                            )
                            .join("")
                    }

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const finish =
            value => {

                closeCDXModal(
                    modal
                );

                resolve(
                    value
                );

            };


        modal
            .querySelector(
                ".cdx-modal-close"
            )
            .onclick = () =>
                finish(null);


        modal
            .querySelectorAll(
                ".cdx-modal-button"
            )
            .forEach(button => {

                button.onclick = () => {

                    const action =
                        button.dataset.action;

                    finish(
                        action
                    );

                };

            });


        modal.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    event.preventDefault();

                    finish(null);

                }

            }
        );


        setTimeout(() => {

            const focusable =
                modal.querySelector(
                    "input, textarea, select, button"
                );

            focusable?.focus();

        }, 0);

    });

}


async function cdxChooseMode() {

    return new Promise(resolve => {

        const modal =
            document.createElement("div");

        modal.className =
            "cdx-modal-overlay";

        modal.innerHTML = `

            <div class="cdx-modal">

                <div class="cdx-modal-header">

                    <div>

                        <div class="cdx-modal-title">
                            📄 Create CDX File
                        </div>

                        <div class="cdx-modal-subtitle">
                            Choose how you want to create it.
                        </div>

                    </div>

                    <button
                        class="cdx-modal-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                <div class="cdx-modal-content">

                    <div class="cdx-choice-grid">

                        <button
                            class="cdx-choice-card"
                            data-choice="new"
                            type="button"
                        >

                            <div class="cdx-choice-icon">
                                🆕
                            </div>

                            <div class="cdx-choice-title">
                                New File
                            </div>

                            <div class="cdx-choice-description">
                                Write brand-new CDX code.
                            </div>

                        </button>


                        <button
                            class="cdx-choice-card"
                            data-choice="existing"
                            type="button"
                        >

                            <div class="cdx-choice-icon">
                                📂
                            </div>

                            <div class="cdx-choice-title">
                                Existing Workspace
                            </div>

                            <div class="cdx-choice-description">
                                Import a saved CodeOS project.
                            </div>

                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const finish =
            value => {

                modal.remove();

                resolve(value);

            };


        modal
            .querySelector(
                ".cdx-modal-close"
            )
            .onclick = () =>
                finish(null);


        modal
            .querySelectorAll(
                ".cdx-choice-card"
            )
            .forEach(card => {

                card.onclick = () => {

                    finish(
                        card.dataset.choice
                    );

                };

            });


        setTimeout(() => {

            modal
                .querySelector(
                    ".cdx-choice-card"
                )
                ?.focus();

        }, 0);

    });

}

commands.cdx = {

    description:
        "CodeOS native CDX tools",

    handler: async (
        args,
        ctx
    ) => {

        const desktop =
            window.CodeOSDesktop;


        /* =================================================
           HELP
        ================================================= */

        if (!args.length) {

            return result(`

╭─────────────────────────────────────────────╮
│                 .CDX 👾                    │
│              CodeOS Terminal               │
╰─────────────────────────────────────────────╯

REAL CODEOS FILES

  cdx choose folder
  cdx gps
  cdx move <folder>

  cdx ls

  cdx create folder <name>
  cdx create file

  cdx read <file>.cdx
  cdx edit <file>.cdx

  cdx open <file>.cdx
  cdx run <file>.cdx

  cdx image <file>
  cdx delete <file>.cdx

ONLY .CDX + IMAGE FILES ARE MANAGED.

`);

        }


        /* =================================================
           DESKTOP ONLY
        ================================================= */

        if (
            !desktop?.isDesktopApp
        ) {

            return result(
                "",
                "🚫 Native CDX tools require the CodeOS desktop app.",
                1
            );

        }


        /* =================================================
           CHOOSE FOLDER
        ================================================= */

        if (
            args[0] === "choose" &&
            args[1] === "folder"
        ) {

            const selection =
                await desktop.chooseFolder();


            if (
                selection.canceled
            ) {

                return result(
                    "❌ Folder selection cancelled."
                );

            }


            state.nativeRoot =
                selection.path;

            state.nativeCwd =
                selection.path;

            saveState();


            return result(`
📁 Native CDX folder mounted.

${selection.path}
`);

        }


        /* =================================================
           ROOT REQUIRED
        ================================================= */

        if (
            !state.nativeRoot
        ) {

            return result(
                "",
                `📁 No native CDX folder is mounted.

Run:

  cdx choose folder
`,
                1
            );

        }


        /* =================================================
           PATH HELPERS
        ================================================= */

        function relativeNativePath(
            absolutePath
        ) {

            const root =
                state.nativeRoot
                    .replace(/[\\/]+$/, "");

            const normalizedRoot =
                root.replace(
                    /\\/g,
                    "/"
                );

            const normalizedTarget =
                absolutePath
                    .replace(
                        /\\/g,
                        "/"
                    );


            if (
                normalizedTarget ===
                normalizedRoot
            ) {

                return ".";

            }


            return normalizedTarget
                .slice(
                    normalizedRoot.length
                )
                .replace(
                    /^\/+/,
                    ""
                ) || ".";

        }


        function normalizeNativePath(
            p
        ) {

            const normalized =
                String(p)
                    .replace(
                        /\\/g,
                        "/"
                    );


            const drive =
                normalized.match(
                    /^[A-Za-z]:/
                )?.[0] || "";


            let remainder =
                normalized.replace(
                    /^[A-Za-z]:/,
                    ""
                );


            const parts = [];


            for (
                const part
                of remainder.split("/")
            ) {

                if (
                    !part ||
                    part === "."
                )
                    continue;


                if (
                    part === ".."
                ) {

                    if (
                        parts.length
                    )
                        parts.pop();

                } else {

                    parts.push(
                        part
                    );

                }

            }


            if (drive) {

                return (
                    drive +
                    "/" +
                    parts.join("/")
                );

            }


            return (
                "/" +
                parts.join("/")
            );

        }


        function resolveNativePath(
            input
        ) {

            if (!input)
                return state.nativeCwd;


            input =
                String(input)
                    .trim();


            if (
                input === "~"
            )
                return state.nativeRoot;


            if (
                /^[A-Za-z]:[\\/]/.test(
                    input
                )
            ) {

                return normalizeNativePath(
                    input
                );

            }


            return normalizeNativePath(
                state.nativeCwd +
                "/" +
                input
            );

        }


        function isImageFile(
            name
        ) {

            return [
                ".png",
                ".jpg",
                ".jpeg",
                ".gif",
                ".webp",
                ".svg",
                ".bmp",
                ".ico"
            ].some(
                extension =>
                    name
                        .toLowerCase()
                        .endsWith(
                            extension
                        )
            );

        }


        /* =================================================
           GPS
        ================================================= */

        if (
            args[0] === "gps"
        ) {

            return result(
                state.nativeCwd
            );

        }


        /* =================================================
           MOVE
        ================================================= */

        if (
            args[0] === "move"
        ) {

            const folder =
                args
                    .slice(1)
                    .join(" ")
                    .trim();


            if (!folder) {

                return result(
                    "",
                    "Usage: cdx move <folder>",
                    1
                );

            }


            const target =
                resolveNativePath(
                    folder
                );


            const check =
                await desktop.listFiles(
                    state.nativeRoot,
                    relativeNativePath(
                        target
                    )
                );


            if (
                !check.success
            ) {

                return result(
                    "",
                    `cdx move: ${check.message}`,
                    1
                );

            }


            state.nativeCwd =
                target;


            saveState();


            return result(
                `📍 Moved to ${target}`
            );

        }


        /* =================================================
           LS
        ================================================= */

        if (
            args[0] === "ls"
        ) {

            const listing =
                await desktop.listFiles(
                    state.nativeRoot,
                    relativeNativePath(
                        state.nativeCwd
                    )
                );


            if (
                !listing.success
            ) {

                return result(
                    "",
                    listing.message,
                    1
                );

            }


            const allowed =
                listing.files.filter(
                    item =>
                        item.type ===
                            "directory" ||
                        item.name
                            .toLowerCase()
                            .endsWith(
                                ".cdx"
                            ) ||
                        isImageFile(
                            item.name
                        )
                );


            if (!allowed.length)
                return result(
                    "Folder is empty."
                );


            return result(
                allowed
                    .map(
                        item => {

                            if (
                                item.type ===
                                "directory"
                            ) {

                                return (
                                    `📁 ${item.name}/`
                                );

                            }


                            if (
                                isImageFile(
                                    item.name
                                )
                            ) {

                                return (
                                    `🖼️ ${item.name} (${item.size} bytes)`
                                );

                            }


                            return (
                                `📄 ${item.name} (${item.size} bytes)`
                            );

                        }
                    )
                    .join("\n")
            );

        }


        /* =================================================
           CREATE FOLDER
        ================================================= */

        if (
            args[0] === "create" &&
            args[1] === "folder"
        ) {

            const name =
                args
                    .slice(2)
                    .join(" ")
                    .trim();


            if (!name) {

                return result(
                    "",
                    "Usage: cdx create folder <name>",
                    1
                );

            }


            const target =
                resolveNativePath(
                    name
                );


            const created =
                await desktop.createFolder(
                    state.nativeRoot,
                    relativeNativePath(
                        target
                    )
                );


            if (
                !created.success
            ) {

                return result(
                    "",
                    `cdx: ${created.message}`,
                    1
                );

            }


            return result(
                `📁 Created ${name}`
            );

        }


        /* =================================================
           CREATE FILE
        ================================================= */

        if (
            args[0] === "create" &&
            args[1] === "file"
        ) {

            /* ---------------------------------------------
               CHOOSE MODE
            --------------------------------------------- */

            const mode =
                await cdxChooseMode();


            if (!mode) {

                return result(
                    "❌ Create cancelled."
                );

            }


            /* =============================================
               🆕 NEW FILE
            ============================================= */

            if (
                mode === "new"
            ) {

                return new Promise(
                    resolve => {

                        const modal =
                            document.createElement(
                                "div"
                            );


                        modal.className =
                            "cdx-modal-overlay";


                        modal.innerHTML = `

                            <div class="cdx-modal cdx-editor-modal">

                                <div class="cdx-modal-header">

                                    <div>

                                        <div class="cdx-modal-title">
                                            🆕 New CDX File
                                        </div>

                                        <div class="cdx-modal-subtitle">
                                            Write your CDX directly here.
                                        </div>

                                    </div>

                                    <button
                                        class="cdx-modal-close"
                                        type="button"
                                    >
                                        ×
                                    </button>

                                </div>


                                <div class="cdx-modal-content">

                                    <input
                                        id="cdxNewFileName"
                                        class="cdx-modal-input"
                                        placeholder="Filename, e.g. test.cdx"
                                        autocomplete="off"
                                    >


                                    <textarea
                                        id="cdxNewFileCode"
                                        class="cdx-code-editor"
                                        placeholder='say "Hello CodeOS!"'
                                    ></textarea>

                                </div>


                                <div class="cdx-modal-actions">

                                    <button
                                        class="cdx-modal-button"
                                        id="cdxNewCancel"
                                        type="button"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        class="cdx-modal-button primary"
                                        id="cdxNewCreate"
                                        type="button"
                                    >
                                        Create CDX
                                    </button>

                                </div>

                            </div>

                        `;


                        document.body.appendChild(
                            modal
                        );


                        const nameInput =
                            modal.querySelector(
                                "#cdxNewFileName"
                            );


                        const codeInput =
                            modal.querySelector(
                                "#cdxNewFileCode"
                            );


                        const close =
                            () => {

                                modal.remove();

                            };


                        const cancel =
                            () => {

                                close();

                                resolve(
                                    result(
                                        "❌ Create cancelled."
                                    )
                                );

                            };


                        modal
                            .querySelector(
                                ".cdx-modal-close"
                            )
                            .onclick =
                                cancel;


                        modal
                            .querySelector(
                                "#cdxNewCancel"
                            )
                            .onclick =
                                cancel;


                        modal
                            .querySelector(
                                "#cdxNewCreate"
                            )
                            .onclick =
                                async () => {

                                    let name =
                                        nameInput.value
                                            .trim();


                                    const code =
                                        codeInput.value;


                                    if (!name) {

                                        nameInput.focus();

                                        return;

                                    }


                                    if (
                                        !name
                                            .toLowerCase()
                                            .endsWith(
                                                ".cdx"
                                            )
                                    ) {

                                        name +=
                                            ".cdx";

                                    }


                                    const target =
                                        resolveNativePath(
                                            name
                                        );


                                    const created =
                                        await desktop.createFile(
                                            state.nativeRoot,
                                            relativeNativePath(
                                                target
                                            ),
                                            code
                                        );


                                    if (
                                        !created.success
                                    ) {

                                        return;

                                    }


                                    close();


                                    resolve(
                                        result(
`✅ Created new native CDX:

${target}`
                                        )
                                    );

                                };


                        setTimeout(
                            () =>
                                nameInput.focus(),
                            0
                        );

                    }
                );

            }


            /* =============================================
   📂 EXISTING WORKSPACE
   ============================================= */
if (mode === "existing") {

    let savedWorkspaces = [];
    let currentWorkspace = null;

    /* ---------------------------------------------
       LOAD SAVED WORKSPACES
    --------------------------------------------- */

    try {
        savedWorkspaces = JSON.parse(
            localStorage.getItem("codeosWorkspaces") || "[]"
        );
    } catch {
        savedWorkspaces = [];
    }

    /* ---------------------------------------------
       ALSO LOAD CURRENT WORKSPACE
       (important for Electron desktop app)
    --------------------------------------------- */

    try {
        currentWorkspace = JSON.parse(
            localStorage.getItem("codeosWorkspace") || "null"
        );
    } catch {
        currentWorkspace = null;
    }

    /* ---------------------------------------------
       BUILD WORKSPACE LIST
    --------------------------------------------- */

    const workspaces = [...savedWorkspaces];

    if (
        currentWorkspace &&
        Array.isArray(currentWorkspace.files)
    ) {

        workspaces.unshift({
            id: "__current_workspace__",
            name: "Current Workspace",
            type: "codeos",
            files: currentWorkspace.files || [],
            folders: currentWorkspace.folders || [],
            openTabs: currentWorkspace.openTabs || [],
            selectedFile: currentWorkspace.selectedFile || 0
        });

    }

    /* ---------------------------------------------
       REMOVE DUPLICATES
    --------------------------------------------- */

    const uniqueWorkspaces = workspaces.filter(
        (workspace, index, array) =>
            index === array.findIndex(
                item =>
                    item.id === workspace.id
            )
    );

    /* ---------------------------------------------
       NOTHING FOUND
    --------------------------------------------- */

    if (!uniqueWorkspaces.length) {

        return new Promise(resolve => {

            const modal =
                document.createElement("div");

            modal.className =
                "cdx-modal-overlay";

            modal.innerHTML = `
                <div class="cdx-modal">

                    <div class="cdx-modal-header">

                        <div>

                            <div class="cdx-modal-title">
                                📂 No Workspaces Found
                            </div>

                            <div class="cdx-modal-subtitle">
                                CodeOS could not find any saved workspaces.
                            </div>

                        </div>

                        <button
                            class="cdx-modal-close"
                            type="button"
                        >
                            ×
                        </button>

                    </div>

                    <div class="cdx-modal-content">

                        <div class="cdx-empty-state">

                            <div style="font-size:48px;">
                                📂
                            </div>

                            <h3>
                                No CodeOS Workspaces
                            </h3>

                            <p>
                                Create or save a workspace in
                                CodeOS first.
                            </p>

                        </div>

                    </div>

                    <div class="cdx-modal-actions">

                        <button
                            class="cdx-modal-button primary"
                            id="cdxWorkspaceEmptyClose"
                            type="button"
                        >
                            Close
                        </button>

                    </div>

                </div>
            `;

            document.body.appendChild(modal);

            const close = () => {
                modal.remove();

                resolve(
                    result(
                        "❌ No CodeOS Workspaces found."
                    )
                );
            };

            modal
                .querySelector(".cdx-modal-close")
                .onclick = close;

            modal
                .querySelector("#cdxWorkspaceEmptyClose")
                .onclick = close;

        });

    }

    /* ---------------------------------------------
       WORKSPACE SELECTOR
    --------------------------------------------- */

    return new Promise(resolve => {

        const modal =
            document.createElement("div");

        modal.className =
            "cdx-modal-overlay";

        modal.innerHTML = `
            <div class="cdx-modal">

                <div class="cdx-modal-header">

                    <div>

                        <div class="cdx-modal-title">
                            📂 Existing Workspace
                        </div>

                        <div class="cdx-modal-subtitle">
                            Choose a CodeOS Workspace.
                        </div>

                    </div>

                    <button
                        class="cdx-modal-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>

                <div class="cdx-modal-content">

                    <div class="cdx-workspace-list">

                        ${uniqueWorkspaces
                            .map(
                                (workspace, index) => `
                                    <button
                                        class="cdx-workspace-card"
                                        data-index="${index}"
                                        type="button"
                                    >

                                        <div class="cdx-workspace-icon">
                                            ${
                                                workspace.id ===
                                                "__current_workspace__"
                                                    ? "🟢"
                                                    : "📦"
                                            }
                                        </div>

                                        <div>

                                            <div class="cdx-workspace-name">
                                                ${escapeHTML(
                                                    workspace.name ||
                                                    "Unnamed Workspace"
                                                )}
                                            </div>

                                            <div class="cdx-workspace-meta">
                                                ${
                                                    (
                                                        workspace.files ||
                                                        []
                                                    ).length
                                                }
                                                files
                                            </div>

                                        </div>

                                    </button>
                                `
                            )
                            .join("")}

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        const close = () => {
            modal.remove();
        };

        const cancel = () => {

            close();

            resolve(
                result(
                    "❌ Import cancelled."
                )
            );

        };

        modal
            .querySelector(".cdx-modal-close")
            .onclick = cancel;

        /* ---------------------------------------------
           WORKSPACE CLICK
        --------------------------------------------- */

        modal
            .querySelectorAll(".cdx-workspace-card")
            .forEach(card => {

                card.onclick = async () => {

                    const workspace =
                        uniqueWorkspaces[
                            Number(
                                card.dataset.index
                            )
                        ];

                    if (!workspace)
                        return;

                    /* ---------------------------------------------
                       FIND CDX FILES
                    --------------------------------------------- */

                    const cdxFiles =
                        (
                            workspace.files || []
                        ).filter(
                            file =>
                                file.name
                                    ?.toLowerCase()
                                    .endsWith(".cdx")
                        );

                    if (!cdxFiles.length) {

                        modal
                            .querySelector(
                                ".cdx-modal-content"
                            )
                            .innerHTML = `
                                <div class="cdx-empty-state">

                                    <div style="font-size:48px;">
                                        📄
                                    </div>

                                    <h3>
                                        No CDX Files
                                    </h3>

                                    <p>
                                        This workspace does not
                                        contain any .cdx files.
                                    </p>

                                    <button
                                        class="cdx-modal-button"
                                        id="cdxBackToWorkspaces"
                                        type="button"
                                    >
                                        ← Back
                                    </button>

                                </div>
                            `;

                        modal
                            .querySelector(
                                ".cdx-modal-title"
                            )
                            .textContent =
                                `📂 ${workspace.name}`;

                        modal
                            .querySelector(
                                ".cdx-modal-subtitle"
                            )
                            .textContent =
                                "No CDX files found.";

                        modal
                            .querySelector(
                                "#cdxBackToWorkspaces"
                            )
                            .onclick = () => {

                                close();

                                /*
                                 * Re-run the command so the
                                 * workspace picker appears again.
                                 */
                                executeCommand(
                                    "cdx create file"
                                );

                            };

                        return;
                    }

                    /* ---------------------------------------------
                       SHOW CDX FILES
                    --------------------------------------------- */

                    const content =
                        modal.querySelector(
                            ".cdx-modal-content"
                        );

                    content.innerHTML = `
                        <div class="cdx-file-list">

                            ${cdxFiles
                                .map(
                                    (file, index) => `
                                        <button
                                            class="cdx-file-card"
                                            data-index="${index}"
                                            type="button"
                                        >
                                            <span>📄</span>

                                            ${escapeHTML(
                                                file.name
                                            )}
                                        </button>
                                    `
                                )
                                .join("")}

                        </div>
                    `;

                    modal
                        .querySelector(
                            ".cdx-modal-title"
                        )
                        .textContent =
                            `📄 ${workspace.name}`;

                    modal
                        .querySelector(
                            ".cdx-modal-subtitle"
                        )
                        .textContent =
                            "Choose a CDX file to import.";

                    /* ---------------------------------------------
                       CDX FILE CLICK
                    --------------------------------------------- */

                    modal
                        .querySelectorAll(
                            ".cdx-file-card"
                        )
                        .forEach(fileButton => {

                            fileButton.onclick =
                                async () => {

                                    const selected =
                                        cdxFiles[
                                            Number(
                                                fileButton.dataset.index
                                            )
                                        ];

                                    if (!selected)
                                        return;

                                    /* ---------------------------------------------
                                       CREATE NATIVE CDX
                                    --------------------------------------------- */

                                    const nativeTarget =
                                        resolveNativePath(
                                            selected.name
                                        );

                                    const created =
                                        await desktop.createFile(
                                            state.nativeRoot,
                                            relativeNativePath(
                                                nativeTarget
                                            ),
                                            selected.content || ""
                                        );

                                    if (!created.success) {

                                        content.innerHTML = `
                                            <div class="cdx-empty-state">

                                                <div style="font-size:48px;">
                                                    ❌
                                                </div>

                                                <h3>
                                                    Import Failed
                                                </h3>

                                                <p>
                                                    ${escapeHTML(
                                                        created.message ||
                                                        "Could not create the CDX file."
                                                    )}
                                                </p>

                                            </div>
                                        `;

                                        return;
                                    }

                                    /* ---------------------------------------------
                                       IMPORT IMAGE ASSETS
                                    --------------------------------------------- */

                                    const images =
                                        (
                                            workspace.files || []
                                        ).filter(
                                            file =>
                                                isImageFile(
                                                    file.name || ""
                                                )
                                        );

                                    let imported = 0;

                                    for (
                                        const image of images
                                    ) {

                                        if (
                                            typeof image.content !==
                                            "string"
                                        ) {
                                            continue;
                                        }

                                        if (
                                            !image.content.startsWith(
                                                "data:"
                                            )
                                        ) {
                                            continue;
                                        }

                                        const imagePath =
                                            resolveNativePath(
                                                image.name
                                            );

                                        const copied =
                                            await desktop.writeNativeImage(
                                                state.nativeRoot,
                                                relativeNativePath(
                                                    imagePath
                                                ),
                                                image.content
                                            );

                                        if (
                                            copied?.success
                                        ) {
                                            imported++;
                                        }

                                    }

                                    /* ---------------------------------------------
                                       FINISH
                                    --------------------------------------------- */

                                    close();

                                    resolve(
                                        result(
                                            `✅ Existing Workspace imported!

Workspace:
${workspace.name}

CDX:
${selected.name}

🖼️ Images imported:
${imported}

Native location:
${nativeTarget}`
                                        )
                                    );

                                };

                        });

                };

            });

        setTimeout(() => {

            modal
                .querySelector(
                    ".cdx-workspace-card"
                )
                ?.focus();

        }, 0);

    });

}


            return result(
                "",
                "❌ Unknown creation mode.",
                1
            );

        }


        /* =================================================
           READ
        ================================================= */

        if (
            args[0] === "read"
        ) {

            const name =
                args
                    .slice(1)
                    .join(" ")
                    .trim();


            if (!name)
                return result(
                    "",
                    "Usage: cdx read <file>.cdx",
                    1
                );


            if (
                !name
                    .toLowerCase()
                    .endsWith(".cdx")
            ) {

                return result(
                    "",
                    "🚫 cdx read only reads .cdx files.",
                    1
                );

            }


            const target =
                resolveNativePath(
                    name
                );


            const file =
                await desktop.readFile(
                    state.nativeRoot,
                    relativeNativePath(
                        target
                    )
                );


            if (
                !file.success
            ) {

                return result(
                    "",
                    `cdx: ${file.message}`,
                    1
                );

            }


            return result(
                file.content || ""
            );

        }


        /* =================================================
           EDIT
        ================================================= */

        if (
            args[0] === "edit"
        ) {

            const name =
                args
                    .slice(1)
                    .join(" ")
                    .trim();


            if (
                !name
                    .toLowerCase()
                    .endsWith(".cdx")
            ) {

                return result(
                    "",
                    "🚫 Only .cdx files can be edited.",
                    1
                );

            }


            const target =
                resolveNativePath(
                    name
                );


            const file =
                await desktop.readFile(
                    state.nativeRoot,
                    relativeNativePath(
                        target
                    )
                );


            if (
                !file.success
            ) {

                return result(
                    "",
                    file.message,
                    1
                );

            }


            return new Promise(
                resolve => {

                    const modal =
                        document.createElement(
                            "div"
                        );


                    modal.className =
                        "cdx-modal-overlay";


                    modal.innerHTML = `

                        <div class="cdx-modal cdx-editor-modal">

                            <div class="cdx-modal-header">

                                <div>

                                    <div class="cdx-modal-title">
                                        ✏️ Edit CDX
                                    </div>

                                    <div class="cdx-modal-subtitle">
                                        ${escapeHTML(target)}
                                    </div>

                                </div>

                                <button
                                    class="cdx-modal-close"
                                    type="button"
                                >
                                    ×
                                </button>

                            </div>


                            <div class="cdx-modal-content">

                                <textarea
                                    class="cdx-code-editor"
                                >${escapeHTML(
                                    file.content || ""
                                )}</textarea>

                            </div>


                            <div class="cdx-modal-actions">

                                <button
                                    class="cdx-modal-button"
                                    id="cdxEditCancel"
                                    type="button"
                                >
                                    Cancel
                                </button>

                                <button
                                    class="cdx-modal-button primary"
                                    id="cdxEditSave"
                                    type="button"
                                >
                                    Save CDX
                                </button>

                            </div>

                        </div>

                    `;


                    document.body.appendChild(
                        modal
                    );


                    const textarea =
                        modal.querySelector(
                            ".cdx-code-editor"
                        );


                    const close =
                        () =>
                            modal.remove();


                    const cancel =
                        () => {

                            close();

                            resolve(
                                result(
                                    "❌ Edit cancelled."
                                )
                            );

                        };


                    modal
                        .querySelector(
                            ".cdx-modal-close"
                        )
                        .onclick =
                            cancel;


                    modal
                        .querySelector(
                            "#cdxEditCancel"
                        )
                        .onclick =
                            cancel;


                    modal
                        .querySelector(
                            "#cdxEditSave"
                        )
                        .onclick =
                            async () => {

                                const saved =
                                    await desktop.writeFile(
                                        state.nativeRoot,
                                        relativeNativePath(
                                            target
                                        ),
                                        textarea.value
                                    );


                                if (
                                    !saved.success
                                ) {

                                    return;

                                }


                                close();


                                resolve(
                                    result(
                                        `✅ Saved ${target}`
                                    )
                                );

                            };


                    setTimeout(
                        () =>
                            textarea.focus(),
                        0
                    );

                }
            );

        }


        /* =================================================
           IMAGE
        ================================================= */

        if (
            args[0] === "image"
        ) {

            const name =
                args
                    .slice(1)
                    .join(" ")
                    .trim();


            if (!name) {

                return result(
                    "",
                    "Usage: cdx image <image>",
                    1
                );

            }


            const target =
                resolveNativePath(
                    name
                );


            const opened =
                await desktop.openFile(
                    state.nativeRoot,
                    relativeNativePath(
                        target
                    )
                );


            if (
                !opened.success
            ) {

                return result(
                    "",
                    opened.message,
                    1
                );

            }


            return result(
                `🖼️ Opened ${name}`
            );

        }


        /* =================================================
           OPEN
        ================================================= */

        if (
            args[0] === "open"
        ) {

            const name =
                args
                    .slice(1)
                    .join(" ")
                    .trim();


            if (
                !name
                    .toLowerCase()
                    .endsWith(".cdx")
            ) {

                return result(
                    "",
                    "🚫 Only .cdx files can be opened in Workspace.",
                    1
                );

            }


            const target =
                resolveNativePath(
                    name
                );


            const file =
                await desktop.readFile(
                    state.nativeRoot,
                    relativeNativePath(
                        target
                    )
                );


            if (
                !file.success
            ) {

                return result(
                    "",
                    file.message,
                    1
                );

            }


            await desktop.openWorkspace(
                target
            );


            return result(
                `📂 Opening ${name} in CodeOS Workspace...`
            );

        }


        /* =================================================
           RUN
        ================================================= */

        if (
            args[0] === "run"
        ) {

            const name =
                args
                    .slice(1)
                    .join(" ")
                    .trim();


            if (
                !name
                    .toLowerCase()
                    .endsWith(".cdx")
            ) {

                return result(
                    "",
                    "🚫 Only .cdx files can be run.",
                    1
                );

            }


            const target =
                resolveNativePath(
                    name
                );


            const file =
                await desktop.readFile(
                    state.nativeRoot,
                    relativeNativePath(
                        target
                    )
                );


            if (
                !file.success
            ) {

                return result(
                    "",
                    file.message,
                    1
                );

            }


            await desktop.runCDX(
                target
            );


            return result(
                `🚀 Running ${name}...`
            );

        }


        /* =================================================
           DELETE
        ================================================= */

        if (
            args[0] === "delete"
        ) {

            const name =
                args
                    .slice(1)
                    .join(" ")
                    .trim();


            if (
                !name
                    .toLowerCase()
                    .endsWith(".cdx")
            ) {

                return result(
                    "",
                    "🚫 cdx delete can only delete .cdx files.",
                    1
                );

            }


            const target =
                resolveNativePath(
                    name
                );


            /* ---------------------------------------------
               CODEOS CONFIRMATION
            --------------------------------------------- */

            return new Promise(
                resolve => {

                    const modal =
                        document.createElement(
                            "div"
                        );


                    modal.className =
                        "cdx-modal-overlay";


                    modal.innerHTML = `

                        <div class="cdx-modal">

                            <div class="cdx-modal-header">

                                <div>

                                    <div class="cdx-modal-title">
                                        🗑️ Delete CDX File
                                    </div>

                                    <div class="cdx-modal-subtitle">
                                        This removes the real native file.
                                    </div>

                                </div>

                                <button
                                    class="cdx-modal-close"
                                    type="button"
                                >
                                    ×
                                </button>

                            </div>


                            <div class="cdx-modal-content">

                                <div class="cdx-delete-warning">

                                    <div class="cdx-delete-icon">
                                        ⚠️
                                    </div>

                                    <div>

                                        <strong>
                                            Delete ${escapeHTML(
                                                name
                                            )}?
                                        </strong>

                                        <div>
                                            ${escapeHTML(
                                                target
                                            )}
                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div class="cdx-modal-actions">

                                <button
                                    class="cdx-modal-button"
                                    id="cdxDeleteCancel"
                                    type="button"
                                >
                                    Cancel
                                </button>

                                <button
                                    class="cdx-modal-button danger"
                                    id="cdxDeleteConfirm"
                                    type="button"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    `;


                    document.body.appendChild(
                        modal
                    );


                    const close =
                        () =>
                            modal.remove();


                    const cancel =
                        () => {

                            close();

                            resolve(
                                result(
                                    "❌ Delete cancelled."
                                )
                            );

                        };


                    modal
                        .querySelector(
                            ".cdx-modal-close"
                        )
                        .onclick =
                            cancel;


                    modal
                        .querySelector(
                            "#cdxDeleteCancel"
                        )
                        .onclick =
                            cancel;


                    modal
                        .querySelector(
                            "#cdxDeleteConfirm"
                        )
                        .onclick =
                            async () => {

                                const deleted =
                                    await desktop.deleteCDX(
                                        state.nativeRoot,
                                        relativeNativePath(
                                            target
                                        )
                                    );


                                if (
                                    !deleted.success
                                ) {

                                    close();


                                    resolve(
                                        result(
                                            "",
                                            `❌ ${deleted.message}`,
                                            1
                                        )
                                    );

                                    return;

                                }


                                close();


                                resolve(
                                    result(
                                        `🗑️ Deleted ${name}`
                                    )
                                );

                            };

                }
            );

        }


        return result(
            "",
            `cdx: unknown command "${args.join(" ")}"`,
            1
        );

    }

};