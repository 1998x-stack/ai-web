# 🌐 AI Web Studio

> **Natural Language to Production Sites — Chat to develop, see it render instantly.**
>
> *用自然语言创造网站 — 对话即开发，所见即所得。*

<p align="center">
  <img src="https://img.shields.io/github/stars/1998x-stack/ai-web?style=for-the-badge&color=3b82f6" alt="Stars">
  <img src="https://img.shields.io/github/license/1998x-stack/ai-web?style=for-the-badge&color=0f3460" alt="License">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/DeepSeek-API-4d6bfe?style=for-the-badge" alt="DeepSeek">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build">
  <img src="https://img.shields.io/badge/tools-11-brightgreen?style=flat-square" alt="Tools">
  <img src="https://img.shields.io/badge/templates-4-brightgreen?style=flat-square" alt="Templates">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs">
</p>

---

## ✨ Core Capabilities

<table>
<tr>
<td width="50%">

### 💬 Natural Language Driven
Describe your site in Chinese or English — *"Build a SaaS landing page with hero, features, and pricing"*, *"Create a dark-themed portfolio"*. The agent reads scaffold documentation, studies templates, and generates optimized HTML/CSS/JS code.

### 🤖 Subagent Delegation
The agent spawns up to 3 research subagents for low-signal-to-noise tasks — reading documentation, searching code patterns, gathering context — freeing the main agent for high-level design decisions.

### 📋 Todo Visualization
Site plans are extracted from `todo.md` and rendered as interactive progress cards in the chat — progress bar, checkbox list with completion status, and next-task indicator.

</td>
<td width="50%">

### ⚡ Streaming Generation
Every tool call, reasoning chain, and code output streams in real-time. The entire development process is transparent — not a black box.

### 🛡️ Model Resilience
Built-in fallback mechanism: when the primary model (deepseek-v4-pro) is unavailable, the system automatically retries with the fallback (deepseek-v4-flash) — for both the main agent loop and subagent delegation.

### 🌐 Responsive Preview
The right-panel iframe renders your Site at customizable viewport widths (375px mobile, 768px tablet, 1200px desktop). Fullscreen mode. Draggable resize handle for freeform testing.

</td>
</tr>
</table>

### Additional Features

| Feature | Description |
|---|---|
| 🎨 **Scaffold-First Generation** | Agent reads 6 authoritative web dev guides before writing code. 5 guides + 21 gotchas + 4 templates. |
| 🔄 **Iterative Refinement** | Multi-turn conversations refine every aspect — layout, colors, typography, interactivity. |
| 🧠 **Knowledge Flywheel** | Gotchas, utils, and skills are agent-extensible. Every solved problem becomes reusable knowledge. |
| 📦 **Self-Contained Builds** | All HTML/CSS/JS + assets → single HTML file. Zero external dependencies. Instant preview. |
| 🔌 **BYO-Key Architecture** | Bring your own DeepSeek API key. No server-side key storage. OpenAI-compatible endpoints supported. |
| 🌐 **Session Persistence** | JSONL file-based persistence survives server restarts. `?session={id}` restores full conversation + Site state. |
| ♿ **Accessibility Built-In** | Semantic HTML, ARIA labels, keyboard navigation, color contrast, skip-to-content link — all auto-enforced. |
| 🖼️ **Unsplash Integration** | Agent can search and embed real stock photos. Falls back to placeholder images if no API key configured. |

---

## 🚀 Quick Start

```bash
git clone https://github.com/1998x-stack/ai-web.git
cd ai-web
npm install
npm run dev
# Open http://localhost:3000
# Configure your DeepSeek API Key → Start creating sites
```

**Prerequisites**: Node.js 18+ | [DeepSeek API Key](https://platform.deepseek.com/)

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        AI Web Studio                              │
├──────────────────────┬───────────────────────────────────────────┤
│   Chat Panel (left)  │        Site Preview (right)               │
│                      │                                            │
│  ┌────────────────┐  │  ┌─────────────────────────────────────┐  │
│  │ User: "Build a │  │  │                                     │  │
│  │   SaaS landing │──┼─▶│   ┌───────────────────────────┐    │  │
│  │   page"        │  │  │   │  🌐 Generated Site         │    │  │
│  └────────────────┘  │  │   │  (sandbox iframe)          │    │  │
│                      │  │   └───────────────────────────┘    │  │
│  ┌────────────────┐  │  │                                     │  │
│  │ Agent:          │  │  │   [Mobile | Tablet | Desktop]     │  │
│  │  📁 read_file  │◀─┼──│   [Fullscreen]                     │  │
│  │  ✏️ write_file │  │  │                                     │  │
│  │  🔍 grep_file  │  │  │   [Error Console]                  │  │
│  │  🖼️ unsplash   │  │  │                                     │  │
│  │  🌐 build_site │  │  │   [Todo Card: 4/6 done]            │  │
│  │  ✅ Build OK!   │  │  └─────────────────────────────────────┘  │
│  └────────────────┘  │                                            │
├──────────────────────┴───────────────────────────────────────────┤
│                   Agent Pipeline (11 tools)                        │
│   System Prompt → Scaffold Docs → Gotchas → Templates → Tool Loop  │
│         ↓                     ↓                                    │
│   scripts/*.{html,css,js}  build_website → output/index.html       │
│         ↓                     ↓                                    │
│   /api/preview/{id} → iframe    Unsplash → real images              │
└────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.4 |
| Styling | Tailwind CSS 3.4 |
| Agent SDK | DeepSeek API (OpenAI-compatible) |
| Output | Single HTML file (inlined CSS + JS + base64 assets) |
| Sandbox | iframe `allow-scripts` |
| Persistence | JSONL files + in-memory Map |

### Agent Tool Registry (11 tools)

| Tool | Purpose |
|---|---|
| `read_file` | Read files (2K-line default) |
| `write_file` | Write files (overwrite-protected) |
| `edit_file` | Unique-match text replacement |
| `list_directory` | List with deterministic format |
| `grep_file` | ripgrep search (JS fallback) |
| `build_website` | Package HTML/CSS/JS → single Site |
| `search_unsplash` | Stock photo search (picsum fallback) |
| `load_skills` | Discover workspace skills |
| `write_todo` | JSON tasks → checklist |
| `set_error` | Report unrecoverable errors |
| `delegate_subagent` | Spawn research subagents (max 3) |

---

## 📂 Project Structure

```
ai-web/
├── app/                          # Next.js pages + API routes
│   ├── page.tsx                  # Dynamic import entry (SSR disabled)
│   ├── HomeContent.tsx           # Split-panel layout + state management
│   ├── layout.tsx                # Root layout
│   └── api/
│       ├── chat/route.ts         # Agent chat (POST, SSE streaming)
│       ├── build/route.ts        # Manual build (POST)
│       ├── preview/[id]/route.ts # Site preview (GET, iframe source)
│       └── session/[id]/route.ts # Session history (GET, JSONL reader)
├── components/                   # React components
│   ├── ChatPanel.tsx             # Chat panel + Markdown + TodoCard
│   ├── WebsitePreview.tsx        # Sandbox iframe + viewport controls
│   ├── SettingsModal.tsx         # API key configuration
│   └── ErrorConsole.tsx          # Runtime error display
├── lib/                          # Core libraries
│   ├── agent/                    # Agent SDK (factory + DeepSeek adapter)
│   │   ├── types.ts              # Type definitions + StreamEvent
│   │   ├── tools.ts              # 11 tool definitions + handlers
│   │   ├── factory.ts            # Provider factory
│   │   ├── deepseek.ts           # DeepSeek agent (fallback-aware)
│   │   └── index.ts              # Barrel export
│   ├── build/packager.ts         # HTML/CSS/JS + assets → single Site
│   ├── workspace/manager.ts      # Session isolation + scaffold copy
│   ├── scaffold/reader.ts        # Scaffold document loader
│   └── session-store.ts          # JSONL persistence
├── workspace/                    # Scaffold knowledge base
│   ├── agent.md                  # Agent system instructions
│   ├── docs/                     # 6 web development guides
│   │   ├── responsive-design.md
│   │   ├── design-patterns.md
│   │   ├── accessibility.md
│   │   ├── seo-performance.md
│   │   ├── interactive-ui.md
│   │   └── gotchas.md
│   ├── templates/                # 4 website templates
│   │   ├── landing-page/
│   │   ├── portfolio/
│   │   ├── blog/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── utils.js              # 12 reusable web utilities
│   │   └── index.md              # API reference
│   └── skills/                   # Extensible skill system
├── user_space/                   # Runtime sessions (gitignored)
├── __tests__/                    # Vitest tests
├── docs/                         # Project documentation
│   ├── adr/                      # Architecture Decision Records
│   └── superpowers/              # Specs and plans
├── CONTEXT.md                    # Domain context glossary
├── AGENTS.md                     # Agent operating instructions
└── DEVELOPMENT.md                # Developer gotchas
```

---

## 🎯 Design Philosophy

| Principle | Practice |
|---|---|
| **Scaffold-First** | Agent reads authoritative docs + gotchas + templates before generating code |
| **Knowledge Flywheel** | Gotchas, utils, and skills are agent-extensible — every solved problem becomes reusable knowledge |
| **Single File Output** | All HTML/CSS/JS inlined into one self-contained file. No build tooling, no CDN deps |
| **BYO-Key** | No server-side key storage — API key lives only in browser localStorage |
| **Defense in Depth** | Four-layer path validation: `..` rejection → `user_space/` check → boundary check → symlink resolution |
| **Model Resilience** | Automatic failover to fallback model on API errors — main loop and subagents |
| **Mobile-First** | All generated Sites use mobile-first CSS (breakpoints: 640, 768, 1024, 1280) |
| **Accessibility Baseline** | Semantic HTML, ARIA, keyboard nav, skip-to-content — enforced by scaffold |

---

## 📖 Documentation

| Document | Purpose |
|---|---|
| [CONTEXT.md](./CONTEXT.md) | Domain glossary — Agent, Site, Workspace, Scaffold, Build Pipeline |
| [AGENTS.md](./AGENTS.md) | Quick reference for agents working on this project |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Developer gotchas and conventions |
| [Design Spec](./docs/superpowers/specs/2026-05-26-ai-web-design.md) | Full technical specification |
| [ADR-0001](./docs/adr/0001-single-page-sites-v1.md) | Decision: single-page Sites for v1 |
| [ADR-0002](./docs/adr/0002-packager-owns-document-shell.md) | Decision: packager owns document shell |

---

## 🤝 Contributing

1. Read [CONTEXT.md](./CONTEXT.md) — understand the domain model
2. Read [DEVELOPMENT.md](./DEVELOPMENT.md) — developer gotchas and conventions
3. Extend the scaffold — add new templates, gotchas, or skills under `workspace/`
4. Add a new LLM provider — implement `AgentSession` interface (see `lib/agent/deepseek.ts`)
5. Add a new tool — define + register in `lib/agent/tools.ts`

**21 gotchas documented** — covering layout, typography, interactivity, images, CSS, performance, and mobile.

---

## 📄 License

MIT © 2024 AI Web Studio

---

<p align="center">
  <sub>Built with ❤️ using <a href="https://nextjs.org">Next.js</a> · <a href="https://platform.deepseek.com">DeepSeek</a> · <a href="https://tailwindcss.com">Tailwind CSS</a></sub>
</p>
