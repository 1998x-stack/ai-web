# ai-web — Design Specification

> **Natural Language to Production Websites — Chat to develop, see it render instantly.**
>
> Status: Approved | Date: 2026-05-26 | Version: 1.0

---

## 1. Overview

### 1.1 What Is ai-web?

A Next.js 14 web application where users chat with a DeepSeek-powered AI agent to generate single-file HTML/CSS/JS **Sites** — instantly previewable in a sandboxed iframe. The agent has 11 tools (file operations, build pipeline, stock photo search, planning, delegation).

> **Domain vocabulary**: See [CONTEXT.md](../../CONTEXT.md) for canonical terms. Key: **Site** = the generated output, **Site Preview** = the right-panel iframe, **Agent** = the LLM-powered assistant, **Web Scaffold** = the knowledge base at `workspace/`.

### 1.2 Relationship to ai-game

ai-web is modeled directly after [ai-game](https://github.com/1998x-stack/ai-game) — same architecture, same patterns, domain-adapted. Where ai-game generates standalone HTML5 Canvas games, ai-web generates standalone HTML/CSS/JS Sites.

**Code reuse target**: ~70% of ai-game's code copies directly. Only the build pipeline, scaffold knowledge base, and domain-specific tools are rewritten.

### 1.3 Core Design Decisions

| Decision | Rationale |
|---|---|
| Single-page Site output | Self-contained, no build step, instantly previewable. Multi-view apps deferred to v2. See [ADR-0001](../../docs/adr/0001-single-page-sites-v1.md). |
| Scaffold-first generation | Agent reads authoritative web dev docs before writing code. Prevents guesswork. |
| Packager owns document shell | Agent writes body content only. Packager wraps with DOCTYPE, head, meta tags, error handler. See [ADR-0002](../../docs/adr/0002-packager-owns-document-shell.md). |
| Knowledge flywheel | Gotchas, utils, and skills are agent-extensible (session-local in v1, human-reviewed). |
| BYO-Key architecture | API key in browser `localStorage`, never on the server. |
| DeepSeek provider only (v1) | Same as ai-game. Factory pattern allows future providers. |
| Pure HTML/CSS/JS output | No frameworks (React, Vue, etc.) in v1. Keeps the build pipeline simple. |
| 15 iteration agent loop | 10 was insufficient for website generation (scaffold reads + writes + image search + build). Simple prompts finish early. |

---

## 2. Architecture

### 2.1 Three-Layer Design

```
┌──────────────────────────────────────────────────────────────────┐
│                        ai-web                                     │
├──────────────────────┬───────────────────────────────────────────┤
│   Chat Panel (left)  │        Website Preview (right)             │
│                      │                                            │
│  ┌────────────────┐  │  ┌─────────────────────────────────────┐  │
│  │ User: "Build a │  │  │                                     │  │
│  │   SaaS landing │──┼─▶│   ┌───────────────────────────┐    │  │
│  │   page"        │  │  │   │  🌐 Generated Website      │    │  │
│  └────────────────┘  │  │   │  (sandbox iframe)          │    │  │
│                      │  │   └───────────────────────────┘    │  │
│  ┌────────────────┐  │  │                                     │  │
│  │ Agent:          │  │  │   [Responsive toggle] (v2)        │  │
│  │  📁 read_file  │◀─┼──│   [Error Console]                  │  │
│  │  ✏️ write_file │  │  │                                     │  │
│  │  🔍 grep_file  │  │  │   [Todo Card: 4/6 done]            │  │
│  │  🖼️ unsplash   │  │  └─────────────────────────────────────┘  │
│  │  🌐 build_site │  │                                            │
│  │  ✅ Build OK!   │  │                                            │
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

| Layer | Location | Role |
|---|---|---|
| Chat UI | `app/`, `components/` | Next.js App Router + React (client-only, dynamic import SSR-off) |
| Agent Pipeline | `lib/agent/` | Factory pattern → DeepSeek adapter → 11-tool agent loop |
| Web Scaffold | `workspace/` | Git-tracked knowledge base: 5 guides, 4 templates, utils, gotchas |
| Runtime Sessions | `user_space/{uuid}/` | Per-session isolated workspaces (gitignored) |

### 2.2 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.4 |
| Styling | Tailwind CSS 3.4 |
| Agent SDK | DeepSeek API (OpenAI-compatible SDK) |
| Output Format | Single HTML file (inlined CSS + JS + base64 assets) |
| Sandbox | iframe `allow-scripts` (no `allow-same-origin`) |
| Persistence | JSONL files + in-memory Map |
| Testing | Vitest (unit) |
| External APIs | Unsplash (stock photos, optional) |

---

## 3. Agent Tool System

### 3.1 Tool Registry (11 tools)

| # | Tool | Parameters | Purpose | Change from ai-game |
|---|---|---|---|---|
| 1 | `read_file` | path, offset, limit | Read files (2K-line default) | Identical |
| 2 | `write_file` | path, content, overwrite | Write files (overwrite-protected) | Identical |
| 3 | `edit_file` | path, old_str, new_str | Unique-match text replacement | Identical |
| 4 | `list_directory` | path | List with deterministic format | Identical |
| 5 | `grep_file` | path, pattern, context | ripgrep search (JS fallback) | Identical |
| 6 | `build_website` | — | Package scripts → HTML | **Rewritten** (was build_game) |
| 7 | `search_unsplash` | query, count, orientation | Stock photo search | **New** (replaces game_runtime) |
| 8 | `load_skills` | — | Discover workspace skills | Identical |
| 9 | `write_todo` | tasks[] | JSON tasks → checklist | Identical |
| 10 | `set_error` | message | Report unrecoverable errors | Identical |
| 11 | `delegate_subagent` | instruction | Spawn research subagents (max 3) | Identical |

### 3.2 Tool Allowlist

| Role | Allowed Tools | Max Iterations |
|---|---|---|
| Master Agent | All 11 tools | 10 |
| Subagent | read_file, write_file, grep_file, list_directory | 5 |

Subagents cannot build, plan, delegate, or search. Max 3 concurrent per session.

### 3.3 build_website — Output Structure

The Agent writes **body content only** — no DOCTYPE, `<html>`, or `<head>`. The packager owns the document shell (see ADR-0002).

**Agent writes to `scripts/`**:
- `index.html` — body content: `<header>...</header><main id="main-content">...</main><footer>...</footer>`
- `styles.css` — all CSS (mobile-first, CSS custom properties)
- `main.js` — all JavaScript (module, uses provided utilities)
- Additional `.css`/`.js` files — loaded alphabetically after primary files

**Packager produces `output/index.html`**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>...</title>
  <meta name="description" content="...">
  <meta property="og:title" content="...">

  <!-- Inlined CSS (styles.css first, then alphabetical .css files) -->
  <style>...</style>
</head>
<body>
  <!-- Auto-injected skip-to-content link -->
  <a href="#main-content" class="skip-link">Skip to content</a>

  <!-- Agent-written body content from index.html -->
  <header>...</header>
  <main id="main-content">...</main>
  <footer>...</footer>

  <!-- Asset map (plain script, before modules) -->
  <script>window.__ASSETS__ = {...}</script>

  <!-- Error handler (plain script, before modules) -->
  <script>window.addEventListener('error', function(e) {
    window.parent.postMessage({type:'site-error', message:e.message, source:e.filename, lineno:e.lineno, colno:e.colno}, '*');
  });</script>

  <!-- Auto-injected utility library (prepended before agent JS) -->
  <!-- Agent-written JS (main.js first, then alphabetical .js files) — ALL module type -->
  <script type="module">
    // [utility library content — DO NOT redeclare these exports]
    // [agent-written main.js content]
    // [alphabetical .js files]
  </script>

  <!-- Unsplash attribution (if images from Unsplash) -->
</body>
</html>
```

**Script loading order**: `styles.css` → alphabetical CSS → `utility library` → `main.js` → alphabetical JS.

### 3.4 search_unsplash

| Parameter | Type | Description |
|---|---|---|
| `query` | string | Search term (e.g., "modern office", "nature landscape") |
| `count` | number | 1-5 images |
| `orientation` | string | "landscape" (default), "portrait", or "square" |

Returns image URLs + attribution links. Three-tier fallback:
1. **Unsplash API** (if key configured) → real stock photo URL with attribution
2. **picsum.photos** → seeded random placeholder by dimensions
3. **Inline SVG placeholder** → colored rectangle with icon, data URI encoded. Never 404s.

During `build_website`, the packager downloads referenced images and embeds them as base64 data URIs. This ensures Sites are permanently self-contained — no external URL rot. Trade-off: ~33% larger HTML output.

### 3.5 Site Preview — Dimensions & Behavior

The right-panel iframe displays the built Site with the following defaults:

| Property | Value |
|---|---|
| Default width | 375px (mobile-first), centered in panel |
| Height | Fills available panel height |
| Scrolling | Internal iframe scroll (vertical) |
| Sandbox | `allow-scripts` only — no `allow-same-origin` |
| Visual frame | Subtle border/shadow to distinguish from white-background Sites |
| Error channel | `postMessage({ type: 'site-error', ... })` to parent |

The iframe includes a **draggable resize handle** on its right edge, allowing the user to resize the viewport to test different widths. The full mobile/tablet/desktop preset toggle is deferred to v1.1.

### 3.6 Error Reporting from Generated Sites

The packager injects error handling into every Site that captures:

| Error Type | Mechanism | Severity |
|---|---|---|
| JS runtime errors | `window.addEventListener('error', ...)` | Error |
| Unhandled promise rejections | `window.addEventListener('unhandledrejection', ...)` | Error |
| Image load failures | `<img onerror>` → postMessage | Warning |
| Console.error calls | Monkey-patched `console.error` → postMessage | Warning |

CSS issues (layout breaks, overflow) are not caught — they require visual inspection. The ErrorConsole UI is identical to ai-game (capped at 50 entries, expandable).

---

## 4. Scaffold Knowledge Base

### 4.1 Structure

```
workspace/
├── agent.md                  # Agent system prompt (web-dev focused)
├── docs/
│   ├── responsive-design.md  # Flexbox, Grid, mobile-first, breakpoints (~800 lines)
│   ├── design-patterns.md    # Typography, color, spacing, visual hierarchy (~700 lines)
│   ├── accessibility.md      # Semantic HTML, ARIA, contrast, keyboard nav (~500 lines)
│   ├── seo-performance.md    # Meta tags, structured data, lazy loading (~500 lines)
│   ├── interactive-ui.md     # Navigation, forms, modals, dark mode (~600 lines)
│   └── gotchas.md            # 15+ anti-patterns, agent-extensible (~400 lines seed)
├── templates/
│   ├── landing-page/         # Hero, features, testimonials, pricing, CTA
│   ├── portfolio/            # About, project grid, skills, contact form
│   ├── blog/                 # Article list, post page, tags, search
│   └── dashboard/            # Stats cards, tables, sidebar nav, dark mode
├── lib/
│   ├── utils.js              # CSS reset, grid, common JS utilities (~500 lines seed)
│   └── index.md              # API reference for utils.js
└── skills/                   # Extensible skill system
    ├── README.md
    └── examples/
```

### 4.2 Knowledge Flywheel

Three components that agents can actively extend (session-local in v1, human-reviewed before propagation to global scaffold):

| Component | Mechanism | Purpose |
|---|---|---|
| `docs/gotchas.md` | APPEND new entries | Mistakes prevented forever |
| `lib/utils.js` | APPEND new exports | Reusable patterns accumulate |
| `skills/examples/` | CREATE new .md files | Domain knowledge grows |

The Agent modifies the session workspace copy (`user_space/{uuid}/`), not the global `workspace/`. A developer reviews session improvements and manually commits valuable ones to the global scaffold.

### 4.3 System Prompt Construction

Assembled from: base instructions → gotchas → 5 scaffold docs → agent.md. Truncated at 30K characters. Gotchas always preserved in truncated prompts.

### 4.4 agent.md Outline (~200 lines)

Injected into system prompt after scaffold docs. Provides the Agent with behavioral rules:

| Section | Content | ~Lines |
|---|---|---|
| Identity & Purpose | You are a web development agent. Generate single-page Sites. | 5 |
| File Structure Rules | Body content only in index.html. styles.css for styles. main.js for behavior. | 15 |
| Utility Library Reference | Full list of available classes/functions. DO NOT redeclare any. | 20 |
| Site Structure Rules | Semantic HTML required: header, main#main-content, footer. Skip-link auto-injected. | 10 |
| CSS Rules | Mobile-first. CSS custom properties for theming. Use rem/em, not px. No inline styles. | 20 |
| JS Rules | Module scripts. Use provided utilities. Event listeners, not onclick attributes. | 15 |
| Responsive Rules | Breakpoints: 640/768/1024/1280. Test at 320px. max-width + padding. | 10 |
| Accessibility Rules | Alt text on all images. Labels on all form inputs. Sequential heading hierarchy. Focus-visible. | 20 |
| Asset Rules | Use search_unsplash for images. Attribution auto-injected. Base64 embedding by build. | 10 |
| Build Rules | Call build_website when ready. Fix errors and retry. Check preview. | 10 |
| Iteration Rules | Use edit_file for targeted changes (read file first). Use CSS vars for easy theming. | 10 |
| Gotchas Quick Reference | Top 15 anti-patterns as bullet list. | 15 |
| Tool Guidance | When to use each tool. When NOT to use them. | 20 |
| Example Workflow | Walkthrough: read docs → plan → write → build → iterate. | 25 |
| **Total** | | **~200** |

### 4.5 Iterative Refinement (Multi-Turn)

### 4.5 Iterative Refinement (Multi-Turn)

After the initial generation, users can refine the Site in the same Session:

> "Make the hero shorter" → Agent reads index.html, uses `edit_file`, rebuilds
> "Change the CTA color to green" → Agent reads styles.css, uses `edit_file`, rebuilds

The Agent follows this pattern:
1. **Read the current file** to get exact text (needed for unique-match `edit_file`)
2. **Use `edit_file`** with surrounding context for unique match
3. **Call `build_website`** to update the preview
4. **Verify** in the Site Preview

The scaffold encourages CSS custom properties from the start:
```css
:root { --cta-bg: #3b82f6; }
.cta-button { background: var(--cta-bg); }
```

This makes style changes trivial — one line edits instead of complex multi-line replacements.

### 4.6 Seed Gotchas (15 items)

1. Never use px for font sizes — always rem/em
2. Never skip heading levels (h1→h2→h3)
3. Never use fixed widths on containers — use max-width + padding
4. Never use `<br>` for spacing — use CSS margin/padding
5. Never nest interactive elements (button inside a, a inside button)
6. Always set viewport meta tag
7. Always test at 320px width (smallest common mobile)
8. Never use onclick for accessibility-critical interactions
9. Always include skip-to-content link
10. Never use document.write()
11. Always define :focus-visible styles
12. Images must have explicit width/height (prevents CLS)
13. Never use inline styles for layout — CSS classes only
14. Form buttons must have explicit type attribute
15. Always use semantic HTML elements (nav, main, article, etc.)

---

## 5. Project Structure

```
ai-web/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dynamic import wrapper (SSR off)
│   ├── HomeContent.tsx           # Split-panel state management
│   ├── layout.tsx                # Root layout
│   └── api/
│       ├── chat/route.ts         # Agent chat (POST, SSE streaming)
│       ├── build/route.ts        # Manual build trigger
│       ├── preview/[id]/route.ts # Website preview serving
│       └── session/[id]/route.ts # Session restore
├── components/
│   ├── ChatPanel.tsx             # Chat + Markdown + TodoCard
│   ├── WebsitePreview.tsx        # Sandbox iframe (renamed from GamePreview)
│   ├── SettingsModal.tsx         # API key configuration
│   └── ErrorConsole.tsx          # Runtime error display
├── lib/
│   ├── agent/
│   │   ├── types.ts              # AgentConfig, StreamEvent, AgentSession
│   │   ├── tools.ts              # 11 tool definitions + handlers
│   │   ├── factory.ts            # Provider factory
│   │   ├── deepseek.ts           # DeepSeek agent (fallback-aware)
│   │   └── index.ts              # Barrel export
│   ├── build/packager.ts         # HTML/CSS/JS → single file
│   ├── workspace/manager.ts      # Session isolation + scaffold copy
│   ├── scaffold/reader.ts        # Scaffold document loader
│   ├── session-store.ts          # JSONL persistence
│   └── config.ts                 # Centralized config
├── workspace/                    # Scaffold knowledge base (git-tracked)
│   ├── agent.md
│   ├── docs/                     # 5 web dev guides + gotchas
│   ├── templates/                # 4 website templates
│   ├── lib/                      # Web utility library
│   └── skills/                   # Extensible skill system
├── user_space/                   # Runtime sessions (gitignored)
├── __tests__/api.test.ts         # Vitest test suite
├── docs/                         # Project documentation
├── CONTEXT.md                    # Domain context glossary
├── AGENTS.md                     # Agent operating instructions
├── DEVELOPMENT.md                # Developer gotchas
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── next.config.js
└── postcss.config.js
```

### 5.1 Files That Copy Directly from ai-game (~70%)

| File | Changes Needed | Effort |
|---|---|---|
| `lib/agent/types.ts` | Add `preview_website` event type | Minimal |
| `lib/agent/factory.ts` | None | Copy |
| `lib/agent/deepseek.ts` | None (tool handlers routed via tools.ts) | Copy |
| `lib/agent/index.ts` | Update exports | Copy |
| `lib/workspace/manager.ts` | Update scaffold copy paths | Minimal |
| `lib/scaffold/reader.ts` | Update doc list | Minimal |
| `lib/session-store.ts` | None | Copy |
| `lib/config.ts` | Update tool names, defaults | Minimal |
| `app/page.tsx` | Update import name | Minimal |
| `app/layout.tsx` | Update metadata | Minimal |
| `app/api/chat/route.ts` | Update tool names, system prompt paths | Minimal |
| `app/api/build/route.ts` | Update import path | Minimal |
| `app/api/preview/route.ts` | Update paths | Minimal |
| `app/api/session/route.ts` | None | Copy |
| `components/ChatPanel.tsx` | None (tool-agnostic rendering) | Copy |
| `components/SettingsModal.tsx` | Update provider labels | Minimal |
| `components/ErrorConsole.tsx` | None | Copy |
| `vitest.config.ts` | None | Copy |
| `tailwind.config.ts` | None | Copy |
| `tsconfig.json` | None | Copy |
| `next.config.js` | None | Copy |
| `postcss.config.js` | None | Copy |

### 5.2 Files That Are Rewritten or New (~30%)

| File | Description | Effort |
|---|---|---|
| `lib/build/packager.ts` | HTML/CSS/JS packaging (replaces game packager) | High |
| `lib/agent/tools.ts` | 2 tool definitions changed (build_website, search_unsplash) | Medium |
| `workspace/agent.md` | Web-dev system prompt | Medium |
| `workspace/docs/*.md` | 5 web dev guides + gotchas (~3500 lines total) | High |
| `workspace/templates/*/` | 4 website templates (3 files each) | Medium |
| `workspace/lib/utils.js` | Web utility library | Medium |
| `workspace/skills/` | Web-specific skill examples | Low |
| `components/WebsitePreview.tsx` | Renamed, minor adjustments | Low |
| `app/HomeContent.tsx` | Renamed game → website references | Low |
| `CONTEXT.md` | Web domain glossary | Low |
| `AGENTS.md` | Web agent instructions | Low |
| `DEVELOPMENT.md` | Web developer gotchas | Low |
| `__tests__/api.test.ts` | Adapted for web tool naming/behavior | Medium |

---

## 6. Session Model

### 6.1 Workspace Lifecycle

1. Client generates UUID via `crypto.randomUUID()`
2. Server validates UUID format (`/^[0-9a-f-]{36}$/i`)
3. `createWorkspace(sessionId)` copies `workspace/` → `user_space/{sessionId}/`
4. Agent operates within workspace (reads, writes, builds)
5. Preview served from `user_space/{sessionId}/output/index.html`
6. Sessions persist via JSONL on disk, survive server restart and HMR

### 6.2 Two-Tier Lookup

- **Tier 1**: In-memory `Map<string, WorkspaceSession>` — fast, wiped by Next.js HMR
- **Tier 2**: Filesystem fallback — `path.join(process.cwd(), 'user_space', sessionId, ...)`

Preview route attempts Map first, falls back to filesystem. This handles the HMR reset problem.

### 6.3 Cleanup

- Max 100 active sessions
- LRU eviction on overflow
- 1-hour stale timeout
- `Promise.allSettled` for deletion (one failure doesn't block others)

---

## 7. Security

### 7.1 BYO-Key

- API key stored in browser `localStorage` only
- Sent with every request via `config.apiKey`
- Auto-redacted from all error responses
- Never logged, never persisted server-side

### 7.2 iframe Sandbox

- `sandbox="allow-scripts"` only — **no `allow-same-origin`**
- Prevents generated code from accessing parent DOM, cookies, or localStorage
- `postMessage` works cross-origin (origin is `null`)
- Error validation via `event.source !== iframeRef.current?.contentWindow`

### 7.3 Path Validation (4 layers)

1. Reject `..` in path strings
2. Verify resolved path is within workspace root
3. Boundary check with path separator
4. `realpathSync` symlink resolution

### 7.4 Session ID Validation

UUID format enforced server-side. Non-UUID → HTTP 400. Prevents directory traversal via crafted session IDs.

### 7.5 DeepSeek-Specific: reasoning_content Preservation

The `reasoning_content` field from DeepSeek thinking models must be echoed back unchanged in multi-turn API calls. Handled in 3 places:
1. `AgentMessage` type (optional field)
2. `sendMessage()` — captured from API response
3. `toOpenAIMessages()` — emitted back in assistant messages

---

## 8. Error Handling

| Error | Handling |
|---|---|
| API unavailable | Auto-retry with fallback model (deepseek-v4-flash) |
| Malformed tool call JSON | Try-catch, returns empty args, caught downstream |
| Build failure | Actionable error: "Fix errors in scripts/ and call build_website again" |
| Tool timeout | 30s timeout via `Promise.race` |
| iframe runtime error | `postMessage` → ErrorConsole (capped at 50 entries) |
| System prompt too long | Truncate at 30K chars, gotchas always preserved |
| Subagent failure | Caught by `allSettled`, error returned to master agent |
| Unknown error | `set_error` tool → agent reports gracefully, loop continues |

---

## 9. Testing Strategy

### 9.1 Patterns from ai-game (Reused)

- Vitest with `@/` path alias
- Tests in `__tests__/`, globals enabled, node environment
- Deep mock of `fs`, `fs/promises`, `openai`
- Helper factories for `mockAgent()`, `mockWorkspace()`, request builders
- `beforeEach` with `vi.clearAllMocks()`

### 9.2 Test Categories

| Category | Coverage |
|---|---|
| Chat route validation | Missing fields, UUID format, message length, provider, API key redaction |
| Build route | Success/failure/error cases, session missing |
| Preview route | UUID validation, two-tier lookup, CSP headers |
| Session route | In-memory vs JSONL, system message filtering |
| Tool handlers | read_file limits, write_file overwrite protection, edit_file uniqueness, build_website status codes, search_unsplash format |
| Subagent system | Max concurrency, tool allowlist, timeout, cancellation, counter lifecycle |
| Stream events | reasoning, message, tool_call, tool_result, build_result, done event types |

---

## 10. v2 Roadmap (Out of Scope)

| Feature | Milestone |
|---|---|
| Responsive preview presets (mobile/tablet/desktop toggle) | v1.1 |
| Deploy to subdomain (`{slug}.ai-web.app`) | v1.2 |
| Gallery / showcase of generated Sites | v1.2 |
| Multi-view/multi-page Site generation | v2.0 |
| Framework-based output (React, Vue) | v2.0 |
| Image generation (AI art for hero images) | v2.0 |
| Sharing URLs for generated Sites | v2.0 |
| OS-level container isolation (Docker) | v2.1 |
| Additional LLM providers (Claude, OpenAI) | v2.1 |
| Collaborative sessions | v2.2 |
| Automatic Knowledge Flywheel propagation | v2.2 |

---

## 11. Implementation Plan (High-Level)

### Phase 0: Documentation & ADRs (Done)
- ✅ CONTEXT.md — domain glossary (Site, Site Preview, Agent, Workspace, etc.)
- ✅ ADR-0001 — single-page Sites for v1
- ✅ ADR-0002 — packager owns document shell
- ✅ Design spec (this document)

### Phase 1: Project Bootstrap
1. Initialize git repo, connect to GitHub remote
2. Copy ai-game project structure (Next.js + configs)
3. Remove game-specific code, keep framework intact
4. Rename components and routes (GamePreview → WebsitePreview, etc.)
5. Update iteration limit to 15 in config.ts

### Phase 2: Scaffold Content
1. Write 5 web development guides (~3500 lines)
2. Write 15 seed gotchas
3. Write 4 website templates (3 files each = 12 files)
4. Write web utility library (CSS reset, grid, JS utilities)
5. Write agent.md system prompt (web-dev focused)

### Phase 3: Build Pipeline
1. Rewrite `lib/build/packager.ts` for partial HTML model (ADR-0002):
   - Read agent's body content from `scripts/index.html`
   - Wrap in complete document shell (DOCTYPE, head, meta tags, skip-link)
   - Inline CSS from `styles.css` + alphabetical `.css` files
   - Prepend utility library to JS module block
   - Inline JS from `main.js` + alphabetical `.js` files
   - Embed assets as base64 (images, fonts)
   - Inject error handler (postMessage for JS errors, console.error)
   - Auto-inject Unsplash attribution
2. Implement `build_website` tool handler
3. Implement `search_unsplash` tool handler with three-tier fallback
4. Update `lib/agent/tools.ts` tool registry

### Phase 4: Integration & Polish
1. Update API routes (chat, build, preview, session)
2. Update frontend components:
   - WebsitePreview.tsx — 375px default width, resize handle, internal scroll
   - HomeContent.tsx — rename game → site references, update SSE event handling
3. Update config.ts: agent iterations=15, tool names, provider settings
4. Update scaffold copy paths in workspace/manager.ts

### Phase 5: Testing
1. Adapt `__tests__/api.test.ts` for web tool naming
2. Add web-specific test cases (build_website, search_unsplash)
3. Test full generation pipeline end-to-end

---

## 12. Appendix: ai-game Reference

The reference implementation lives at `/Users/mx/Desktop/ai-game`. Key files to reference during implementation:

| File | Lines | Purpose |
|---|---|---|
| `lib/agent/deepseek.ts` | 316 | Agent loop, fallback, streaming, tool execution |
| `lib/agent/tools.ts` | 867 | Tool definitions + handlers + validatePath |
| `lib/build/packager.ts` | 145 | Build pipeline (model for website packager) |
| `lib/workspace/manager.ts` | ~120 | Session lifecycle, scaffold copying |
| `app/api/chat/route.ts` | 332 | System prompt construction, SSE streaming |
| `app/HomeContent.tsx` | 447 | SSE event handling, state management |
| `components/ChatPanel.tsx` | 673 | Markdown rendering, tool cards, todo display |
| `__tests__/api.test.ts` | 1689 | Test patterns, mock factories |

Reference commit on GitHub: https://github.com/1998x-stack/ai-game
