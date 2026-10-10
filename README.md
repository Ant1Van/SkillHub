<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="120" alt="SkillHub Logo" />
</p>

<h1 align="center">SkillHub</h1>

<p align="center">
  <strong>The Universal Desktop Manager & Marketplace for AI Coding Agent Skills</strong><br />
  <em>Supporting Claude Code, OpenAI Codex, Cursor, Cline / Roo Code, Windsurf, and custom workspaces.</em>
</p>

<p align="center">
  <a href="https://github.com/Ant1Van/SkillHub/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Status" /></a>
  <a href="https://github.com/Ant1Van/SkillHub/releases"><img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=flat-square" alt="Platforms" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple?style=flat-square" alt="License" /></a>
  <a href="https://github.com/Ant1Van/homebrew-tap"><img src="https://img.shields.io/badge/homebrew-cask-orange?style=flat-square&logo=homebrew" alt="Homebrew Cask" /></a>
  <a href="https://tauri.app"><img src="https://img.shields.io/badge/built%20with-Tauri%202.0-blueviolet?style=flat-square" alt="Tauri 2" /></a>
</p>

---

## 💡 Why SkillHub?

Modern AI coding agents (Claude Code, OpenAI Codex, Cursor, Cline, Windsurf) bring game-changing autonomy through **Skills and Instruction Rules** (`SKILL.md`). However, skills typically sit isolated in hidden directories:
- ❌ Fragmented across agents (`~/.claude/skills`, `~/.codex/skills`, `~/.cursor/skills`, `~/.cline/skills`).
- ❌ No visual way to know which skills are currently active or disabled.
- ❌ No one-click toggle to enable/disable skills for specific tasks.
- ❌ No centralized marketplace to discover and install community skills across agents.
- ❌ No easy way to share or copy a skill from Claude Code to Codex or Cursor.

**SkillHub solves this completely.** It provides a lightweight, ultra-fast native desktop application that lives in your menu bar and dock, giving you full visual mastery and seamless cross-agent skill management.

---

## ✨ Features

- 🤖 **Universal Multi-Agent Support**:
  - 🟣 **Claude Code** (`~/.claude/skills`)
  - 🟢 **OpenAI Codex & ChatGPT** (`~/.codex/skills`)
  - 🔵 **Cursor IDE** (`~/.cursor/skills`)
  - 🟠 **Cline / Roo Code** (`~/.cline/skills`)
  - 🌊 **Windsurf Cascade** (`~/.windsurf/skills`)
  - 📁 **Custom Workspaces** (Point to any project skills directory)
- 🔄 **Cross-Agent Skill Sharing**: Copy any skill from Claude to Codex or Cursor in 1 click.
- ⚡ **Lightweight & Fast**: Built with **Tauri 2.0 (Rust)** + **React 19** + **Tailwind CSS v4**. Bundle size is only **~4 MB** with near-zero memory footprint.
- 🎛️ **Instant On/Off Toggle**: Disable or enable any skill instantly without losing your configuration.
- 🛍️ **1-Click Community Marketplace**:
  - **Curated Vault**: Explore top skills for Testing (Playwright, TDD), Security, DevOps, Database optimization, and AI Agent workflows.
  - **Live GitHub Search**: Search open-source community repositories on GitHub and clone them directly into your selected agent.
- 🔍 **Real-Time Search & Filters**: Filter by `All`, `Active`, or `Disabled` status with instant keyboard shortcut (`⌘K` / `Ctrl+K`).
- 🛠️ **Full Studio Mode**:
  - Inspect frontmatter and full documentation.
  - Explore nested scripts (`scripts/`, `agents/`, `references/`).
  - Integrated `SKILL.md` editor with live saving.
- 🗑️ **Safe Skill Deletion**: Uninstall unused skills cleanly with one click.
- 🔗 **Quick GitHub & Finder Links**: Direct links to open the original repository or reveal files on disk.
- 🎨 **Impeccable Design Standards**: Strictly adheres to modern dark-mode craft—balanced contrast, micro-grid rhythm, and zero visual clutter.

---

## 📥 Installation

### macOS (via Homebrew) 🍏

Install SkillHub in one command via the official tap:

```bash
brew install --cask --no-quarantine Ant1Van/tap/skillhub
```

Or standard tap & install:

```bash
brew tap Ant1Van/tap
brew install --cask skillhub
```

> [!NOTE]
> If macOS Gatekeeper blocks opening or says *"SkillHub is damaged"*, this is standard macOS quarantine behavior for open-source apps. Either install with `--no-quarantine` as shown above, or run this one-time command in Terminal:
> ```bash
> xattr -cr /Applications/SkillHub.app
> ```

To update in the future:
```bash
brew upgrade --cask skillhub
```

---

### Direct Download & Other Platforms 📦

Download pre-built packages from the **[Latest Release](https://github.com/Ant1Van/SkillHub/releases/latest)**:

| Operating System | Architecture | Package Format |
|---|---|---|
| **macOS** | Apple Silicon (M1/M2/M3/M4) | [`.dmg`](https://github.com/Ant1Van/SkillHub/releases/latest) |
| **macOS** | Intel (x86_64) | [`.dmg`](https://github.com/Ant1Van/SkillHub/releases/latest) |
| **Windows** | x64 | Setup [`.exe`](https://github.com/Ant1Van/SkillHub/releases/latest) / [`.msi`](https://github.com/Ant1Van/SkillHub/releases/latest) |
| **Linux** | x64 (Universal) | [`.AppImage`](https://github.com/Ant1Van/SkillHub/releases/latest) |
| **Linux** (Debian / Ubuntu) | x64 | [`.deb`](https://github.com/Ant1Van/SkillHub/releases/latest) |
| **Linux** (Fedora / RHEL) | x64 | [`.rpm`](https://github.com/Ant1Van/SkillHub/releases/latest) |

---

## 🚀 Quickstart for Developers

```bash
# Clone the repository
git clone https://github.com/Ant1Van/SkillHub.git
cd SkillHub

# Install dependencies
npm install

# Start in development mode with Hot Reload
npm run tauri dev
```

---

## 🧪 Testing

SkillHub comes with complete automated test coverage for both the frontend and backend:

```bash
# Run Frontend Tests (Vitest & Testing Library)
npm run test

# Run Rust Backend Tests
cd src-tauri && cargo test
```

---

## 🏗️ Architecture

```
skillhub/
├── .github/workflows/       # CI/CD (Multiplatform builds + test checks)
├── src/
│   ├── components/          # Modular UI components (Header, Cards, Modals)
│   ├── data/                # Curated marketplace skills directory
│   ├── hooks/               # State management (useSkills)
│   ├── services/            # Typed IPC bridge (api.ts)
│   └── types.ts             # Shared TypeScript schemas
└── src-tauri/
    ├── src/
    │   ├── models.rs        # Rust data structures
    │   ├── skills.rs        # Skills filesystem CRUD & frontmatter parser
    │   ├── marketplace.rs   # 1-Click install & Git clone engine
    │   ├── window.rs        # Cross-platform window & shell actions
    │   └── lib.rs           # Tauri app entrypoint & command dispatch
    └── Cargo.toml           # Rust dependencies
```

---

## 🤝 Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues, feature requests, or adding your own skill to the curated index.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
