export interface CommunitySkill {
  id: string;
  name: string;
  description: string;
  category: "Testing" | "Design" | "DevOps" | "Database" | "Security" | "AI Agents" | "Workflow";
  author: string;
  stars: number;
  repoUrl: string;
  skillContent: string;
}

export const CURATED_MARKETPLACE_SKILLS: CommunitySkill[] = [
  {
    id: "playwright-pro",
    name: "Playwright E2E Master",
    description: "End-to-end browser automation, regression testing, screenshots, and DOM inspection.",
    category: "Testing",
    author: "anthropic-community",
    stars: 1240,
    repoUrl: "https://github.com/microsoft/playwright",
    skillContent: `---
name: "playwright-pro"
description: "End-to-end browser automation and testing with Playwright for Claude Code."
---

# Playwright E2E Master

Use this skill when you need to verify web interfaces, perform browser automation, or write resilient end-to-end tests.

## Instructions
1. Inspect the web application structure and port before launching browser tests.
2. Generate resilient locators (prefer role and test-id over volatile CSS classes).
3. Always run tests in headless mode by default unless debugging screenshots are requested.
4. Clean up lingering browser instances on completion.
`,
  },
  {
    id: "security-guard",
    name: "Security & Secret Scanner",
    description: "Scan codebases for hardcoded secrets, injection vectors, and dependencies with known CVEs.",
    category: "Security",
    author: "sec-ops",
    stars: 980,
    repoUrl: "https://github.com/trufflesecurity/trufflehog",
    skillContent: `---
name: "security-guard"
description: "Scans codebase for hardcoded secrets, injection vectors, and dependency vulnerabilities."
---

# Security & Secret Scanner

Use this skill before committing code or making production releases to catch security vulnerabilities.

## Checks Performed
- Secrets in git history or staged files (.env, AWS keys, JWT tokens)
- SQL injection, XSS, and command injection patterns
- Outdated npm/cargo/pip packages with high severity CVEs
`,
  },
  {
    id: "docker-architect",
    name: "Docker & Container Architect",
    description: "Generate minimal multi-stage Dockerfiles, docker-compose.yml files, and optimize build cache.",
    category: "DevOps",
    author: "devops-guild",
    stars: 890,
    repoUrl: "https://github.com/docker/awesome-compose",
    skillContent: `---
name: "docker-architect"
description: "Generates ultra-lean, secure Dockerfiles and multi-container Compose setups."
---

# Docker & Container Architect

Specialized assistant for containerization and local dev orchestration.

## Guidelines
1. Always use minimal base images (alpine or distroless where applicable).
2. Leverage multi-stage builds to exclude build tooling from runtime containers.
3. Keep .dockerignore strictly configured.
`,
  },
  {
    id: "figma-to-tailwind",
    name: "Figma to Tailwind Tokens",
    description: "Translate design tokens, spacing scales, and component specs into clean Tailwind CSS v4.",
    category: "Design",
    author: "craft-designers",
    stars: 1450,
    repoUrl: "https://github.com/tailwindlabs/tailwindcss",
    skillContent: `---
name: "figma-to-tailwind"
description: "Converts design specifications and tokens into clean, responsive Tailwind CSS v4."
---

# Figma to Tailwind Tokens

Use this skill when translating UI designs into production code following Impeccable principles.

## Guidelines
- Avoid magic numbers: align strictly to 4px/8px micro-grid.
- Match contrast ratios: text must satisfy WCAG AA (>= 4.5:1).
- Implement interactive states (hover, focus-visible, active, disabled) on all controls.
`,
  },
  {
    id: "sql-optimizer-pro",
    name: "SQL & Query Optimizer",
    description: "Diagnose slow queries, inspect EXPLAIN plans, and recommend composite indexes.",
    category: "Database",
    author: "db-specialists",
    stars: 760,
    repoUrl: "https://github.com/postgres/postgres",
    skillContent: `---
name: "sql-optimizer-pro"
description: "Diagnoses slow database queries, analyzes EXPLAIN ANALYZE, and suggests optimal indexes."
---

# SQL & Query Optimizer

Helps diagnose database bottlenecks and structure performant queries.

## Guidelines
1. Inspect execution plans for Sequential Scans on large tables.
2. Suggest composite index ordering matching WHERE and ORDER BY filters.
3. Detect N+1 query patterns in ORM usage.
`,
  },
  {
    id: "multi-agent-orchestrator",
    name: "Multi-Agent Subagent Runner",
    description: "Coordinate parallel autonomous subagents for deep research and concurrent task execution.",
    category: "AI Agents",
    author: "matt-pocock-style",
    stars: 2100,
    repoUrl: "https://github.com/mattpocock/skills",
    skillContent: `---
name: "multi-agent-orchestrator"
description: "Orchestrates parallel autonomous subagents for deep research and concurrent task execution."
---

# Multi-Agent Orchestrator

Use this skill when a task is too broad for a single context window or requires concurrent verification.

## Rules
- Define explicit task briefs for each worker.
- Never let subagents duplicate file modifications.
- Aggregate findings into a structured summary report.
`,
  },
];
