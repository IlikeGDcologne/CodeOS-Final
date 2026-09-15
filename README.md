# 👾 CodeOS

<p align="center">
  <img src="https://img.shields.io/badge/CodeOS-0.1.0-7c3aed?style=for-the-badge&logo=github" alt="CodeOS Version">
  <img src="https://img.shields.io/badge/Status-Alpha-f59e0b?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Built%20With-JavaScript-facc15?style=for-the-badge&logo=javascript&logoColor=111827" alt="JavaScript">
  <img src="https://img.shields.io/badge/Desktop-Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
</p>

<p align="center">
  <strong>🚀 A programming ecosystem built around CodeOS and CDX.</strong>
</p>

<p align="center">
  Write code. Build projects. Run CDX. Install extensions. Explore.
</p>

<p align="center">
  <a href="#-features">Features</a>
  •
  <a href="#-cdx">CDX</a>
  •
  <a href="#-desktop-app">Desktop App</a>
  •
  <a href="#-getting-started">Getting Started</a>
  •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 🌌 What is CodeOS?

**CodeOS** is a programming environment designed to make coding feel more like an ecosystem than a single editor.

Instead of being just a code editor, CodeOS brings together:

```text
                    👾 CodeOS
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   🧠 Workspace      🚀 Runner       💻 Terminal
       │               │                │
       └───────────────┼────────────────┘
                       │
        ┌──────────────┼───────────────┐
        │              │               │
     🧩 Extensions    ✨ Plus+       🛠️ DevTools
        │              │               │
        └──────────────┼───────────────┘
                       │
                    🌐 Community
```

The goal is simple:

> **One place to create, run, explore, and extend projects.**

---

# ✨ Features

## 🧠 Workspace

A browser-style programming workspace for creating and managing CodeOS projects.

* 📄 Multiple files
* 📁 Folders
* 🗂️ Tabs
* 🖼️ Image assets
* 💾 Workspace saving
* 🎨 Dark glass-style UI
* 🧩 Extension-friendly architecture

---

## 🚀 CDX Runner

Run `.cdx` programs directly inside CodeOS.

Example:

```cdx
say("Hello World")

player is Rivaan

if player clicked
    say("You clicked me!")
end
```

The runner supports CodeOS functionality such as:

* Variables
* Conditions
* Loops
* Functions
* Sprites
* Input
* Random values
* Waiting
* Events
* Extensions

---

# 💻 Native `.CDX` Terminal

CodeOS includes a native desktop terminal for managing real `.cdx` files.

Example:

```text
cdx choose folder

cdx ls

cdx create folder Games

cdx create file

cdx read game.cdx

cdx edit game.cdx

cdx open game.cdx

cdx run game.cdx

cdx image player.png

cdx delete game.cdx
```

### 📂 Native file structure

```text
CDX/
├── game.cdx
├── player.png
├── background.png
└── assets/
```

The native terminal is intentionally limited to **CDX and supported image assets** rather than acting like an unrestricted system file manager.

---

# 🧩 Extensions

CodeOS supports extensions that can add new commands and capabilities.

Example extension command:

```js
CodeOS.commands.register(
    "move",
    async (context) => {
        const args = context.args || [];

        const spriteName = args[0];
        const direction = String(args[1] || "").toLowerCase();
        const amount = Number(args[2]);

        // ...
    },
    { category: "sprites" }
);
```

Then inside CDX:

```cdx
move hero right 50
```

The idea is to make CodeOS **expandable instead of fixed**.

---

# 🛠️ DevTools

CodeOS includes developer tooling for working with projects and debugging the ecosystem.

The DevTools side of CodeOS is designed to eventually become a complete development environment rather than just another browser utility.

---

# ✨ CodeOS Plus+

An evolving collection of advanced CodeOS functionality.

The Plus+ layer is intended for features that go beyond the core editor/runtime and help turn CodeOS into a larger ecosystem.

---

# 🌐 Community

CodeOS also includes a community layer for sharing projects and interacting with other CodeOS users.

Planned / existing community concepts include:

* 👤 Profiles
* 🧩 Project sharing
* 💬 Discussions
* ❤️ Likes & reactions
* 🏆 Awards
* 🏅 Badges
* 🎯 Challenges
* 👥 Groups
* 🔔 Notifications

---

# 🏆 Badges & Awards

CodeOS includes an achievement system designed around exploration and building.

Example categories include:

```text
🐾 ALL ANIMALS
🍔 ALL FOOD
😂 ALL MEME
```

The system is designed to reward discovering different parts of the CodeOS ecosystem.

---

# 🖼️ Screenshots

> Replace these image paths with screenshots from your actual project.

### 🧠 Workspace

<p align="center">
  <img src="screenshots/workspace.png" alt="CodeOS Workspace" width="900">
</p>

---

### 💻 CDX Terminal

<p align="center">
  <img src="screenshots/terminal.png" alt="CodeOS CDX Terminal" width="900">
</p>

---

### 🚀 Runner

<p align="center">
  <img src="screenshots/runner.png" alt="CodeOS Runner" width="900">
</p>

---

### 🌐 Community

<p align="center">
  <img src="screenshots/community.png" alt="CodeOS Community" width="900">
</p>

---

# 🖥️ Desktop App

CodeOS can run as a desktop application using **Electron**.

The desktop version provides native functionality such as:

* 📂 Native folder selection
* 📄 Real `.cdx` files
* 🖼️ Native image assets
* 🚀 Native CDX launching
* 🧩 Desktop-integrated CodeOS tools

Build the desktop application with:

```bash
cd desktop-app
npm install
npm run build
```

The resulting installer is generated in:

```text
desktop-app/dist/
```

> Build output is intentionally excluded from the Git repository.

---

# 🧰 Project Structure

```text
CodeOS/
│
├── 📄 index.html
│
├── 🧠 workspace.html
├── 🧠 workspace.js
├── 🎨 workspace.css
│
├── 🚀 run.html
├── 🚀 run.js
│
├── 🌐 community.html
├── 🌐 community.js
├── 🏆 community_badges.js
│
├── ✨ plus.html
├── ✨ plus.js
├── ✨ codeos-plus.js
│
├── 🛠️ devtools.html
│
├── 📚 documentation.js
├── 🎓 learning.js
│
├── 💻 terminal/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── 🧩 DevTools Extension/
│   └── ...
│
├── ⚙️ backend/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── 🖥️ desktop-app/
│   ├── main.js
│   ├── preload.js
│   ├── package.json
│   └── ...
│
├── 📘 README.md
└── 🚫 .gitignore
```

---

# ⚡ Getting Started

## 1. Clone CodeOS

```bash
git clone https://github.com/YOUR_USERNAME/CodeOS.git
cd CodeOS
```

## 2. Install dependencies

For the backend:

```bash
cd backend
npm install
```

For the desktop app:

```bash
cd ../desktop-app
npm install
```

## 3. Start the desktop app

```bash
npm start
```

---

# 🔐 Environment Variables

Private credentials should **never** be committed to GitHub.

Use a local `.env` file for secrets.

Example:

```env
OPENROUTER_API_KEY=your_key_here
```

A safe template can be committed as:

```text
.env.example
```

but the real `.env` file should remain ignored by Git.

---

# 🗺️ Roadmap

CodeOS is still evolving.

### ✅ Built

* [x] CodeOS Workspace
* [x] CDX Runner
* [x] Native CDX Terminal
* [x] Native CDX file creation
* [x] Native CDX editing
* [x] Native CDX deletion
* [x] Workspace → CDX importing
* [x] Image asset importing
* [x] CodeOS Extensions
* [x] Community system
* [x] Badges
* [x] Awards
* [x] Electron desktop app
* [x] DevTools integration

### 🚧 In Progress

* [ ] More powerful CDX APIs
* [ ] Improved AI coding integration
* [ ] More extensions
* [ ] Deeper DevTools integration
* [ ] Better project management
* [ ] More desktop-native functionality

### 🔮 Future

* [ ] Full CodeOS extension marketplace
* [ ] More advanced AI-assisted editing
* [ ] Native project packaging
* [ ] More CDX language features
* [ ] Richer community ecosystem

---

# 🧪 CDX Example

A tiny example project:

```cdx
player is Rivaan
colour is lime

say("Welcome to CodeOS!")

if player clicked
    say("Hello, Rivaan!")
end
```

Run it from the native terminal:

```bash
cdx run game.cdx
```

Open it in Workspace:

```bash
cdx open game.cdx
```

Edit it:

```bash
cdx edit game.cdx
```

---

# 🏗️ Philosophy

CodeOS is being built around a few ideas:

```text
                 MAKE
                  │
            ┌─────▼─────┐
            │   CODE    │
            └─────┬─────┘
                  │
               CREATE
                  │
            ┌─────▼─────┐
            │   BUILD   │
            └─────┬─────┘
                  │
             EXTEND
                  │
            ┌─────▼─────┐
            │ EXPERIMENT│
            └─────┬─────┘
                  │
             SHARE IT
                  │
            ┌─────▼─────┐
            │ COMMUNITY │
            └───────────┘
```

The long-term goal is for CodeOS to feel like a **complete programming ecosystem**, not simply an editor with a run button.

---

# 🤝 Contributing

Contributions, ideas, bug reports, and experiments are welcome.

Please open an issue before making major architectural changes so development stays organized.

---

# 📜 License

CodeOS is released under the **MIT License**.

See [`LICENSE`](LICENSE) for the full license text.

---

<p align="center">
  👾 <strong>CodeOS</strong>
  <br>
  <sub>Build something weird. Build something useful. Build something awesome.</sub>
</p>

<p align="center">
  <code>© CodeOS</code>
</p>
