# Contributing to SkillHub

Thank you for your interest in contributing to **SkillHub**! We welcome community contributions, bug fixes, feature requests, and new skills in our curated marketplace.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Rust & Cargo**: Latest stable toolchain (`rustup update`)
- **Git**

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/skillhub.git
cd skillhub

# 2. Install dependencies
npm install

# 3. Start development server with hot-reload
npm run tauri dev
```

---

## 🧪 Running Tests

### Frontend Unit Tests (Vitest & Testing Library)
```bash
npm run test
```

### Rust Backend Tests
```bash
cd src-tauri
cargo test
```

---

## 📦 Adding a Skill to the Curated Marketplace

Want your Claude Code skill featured in the 1-Click Curated Hub?
1. Open `src/data/marketplaceSkills.ts`.
2. Add your skill object into `CURATED_MARKETPLACE_SKILLS`:
   ```typescript
   {
     id: "your-skill-id",
     name: "Your Skill Title",
     description: "Clear and concise explanation of what the skill does",
     category: "Testing", // 'Testing' | 'Design' | 'DevOps' | 'Database' | 'Security' | 'AI Agents'
     author: "your-github-handle",
     stars: 100,
     repoUrl: "https://github.com/username/your-skill-repo",
     skillContent: `---
   name: "your-skill-id"
   description: "..."
   ---
   # Instructions...
   `
   }
   ```
3. Submit a Pull Request!

---

## 📜 Code Style & Impeccable Standards
- **No AI-slop UI**: Keep styling restrained, functional, and adhering to macOS native design principles.
- **Micro-interactions**: Fast transitions (150ms ease-out), proper keyboard accessibility (`focus-visible`).
- **Modularity**: Keep components decoupled, typed, and well-tested.
