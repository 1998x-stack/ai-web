# AGENTS.md — AI Web Studio

## Quick Reference

```bash
npm run dev       # next dev (port 3000)
npm test          # vitest run (__tests__/*.test.ts)
npm run lint      # next lint
npm run build     # production build
```

## Architecture

| Layer | Location | Role |
|-------|----------|------|
| Chat UI | `app/`, `components/` | Next.js App Router, client-only (dynamic import, SSR-off) |
| Agent pipeline | `lib/agent/` | Factory -> DeepSeek adapter (OpenAI-compatible SDK) |
| Web scaffold | `workspace/` | Docs, templates, utils for site-generating agents |
| Runtime sessions | `user_space/{uuid}/` | Gitignored. HMR wipes in-memory Map; files persist on disk. |

**Central config**: `lib/config.ts` — all magic numbers, timeouts, and allowlists. Import from here, don't hardcode.
**Domain concepts**: `CONTEXT.md`. **Developer gotchas**: `DEVELOPMENT.md`.

## Critical Don'ts

- **NEVER add `allow-same-origin` to the iframe sandbox** — exposes parent DOM including API key. `postMessage` works cross-origin. Validate messages via `event.source !== iframeRef.current?.contentWindow` — NOT `event.origin` (iframe origin is `null` without `allow-same-origin`).

- **ALWAYS use static import for the packager** (`import { buildWebsite } from '@/lib/build/packager'`) — never `await import('@/lib/build/packager')`. Dynamic imports route through Next.js webpack and fail on stale `.next` chunks. The packager is pure Node.js (`fs` + `path`) — no webpack dependency needed.

- **Agent MUST NOT redeclare scaffold utilities** — 12 exports from `lib/utils.js` are pre-loaded in the same module scope: `$`, `$$`, `onReady`, `debounce`, `throttle`, `createModal`, `validateForm`, `initDarkMode`, `observeElements`, `smoothScroll`, `initTabs`, `initAccordion`.

- **Body-only HTML in `scripts/index.html`** — no `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags. The packager owns the document shell. Agent writes only the content that goes inside `<body>`.

- **Canvas ID is NOT "gameCanvas"** — ai-web has no canvas. Sites use semantic HTML elements (`<header>`, `<main>`, `<footer>`). The main content landmark ID is `main-content` (target of the auto-injected skip link).

- **Module scripts, never IIFE** — packager uses `<script type="module">`. `export` inside IIFE is a syntax error. All scaffold utilities are ES module exports.

## DeepSeek Provider Notes

- **`reasoning_content` MUST be preserved across turns** — echoed back unchanged. Handled in: `AgentMessage` type, `sendMessage()` capture, `toOpenAIMessages()` emit. If adding a new provider, replicate this pattern.
- **Provider names: lowercase in factory, capitalized from frontend** — `chat/route.ts` normalizes casing.
- **Provider validation: lowercase FIRST, then check** — `ALLOWED_PROVIDERS.has(config.provider.toLowerCase())`.
- **Fallback model**: on primary model failure, the agent retries with `config.fallbackModel` (`deepseek-v4-flash`). Handled via try-catch in `createCompletion()`.

## Code Patterns

### Error handling
- Read API error body BEFORE checking `!res.ok` (`res.json()` first, then status check). Server error messages live in JSON body.
- `buildResult.success` is a boolean — check it directly. `!!data.buildResult` is always truthy when the field exists, even on failure.
- API-key redaction: error responses auto-redact `config.apiKey`. New error paths must do the same.
- Build error messages must be **actionable** — tell the agent WHAT to do: `"BUILD FAILED: ${errors}. Fix the errors in scripts/ and call build_website again."` Not just `"Build completed with warnings."`
- Tool call JSON.parse failures return empty args (not thrown) — handled downstream in `executeToolCalls`.

### Path & session validation
- Session IDs validated as UUID (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) before `path.join()` — prevents directory traversal.
- Workspace path validation: reject `..` -> verify under `user_space/` -> resolve -> boundary check -> `realpathSync`. All 4 layers must be preserved.
- Preview route: two-tier lookup (in-memory Map -> filesystem fallback) survives HMR resets.
- Agent tool `validatePath()` has 4 layers: reject `..` -> verify workspace root under `user_space/` -> boundary check -> `realpathSync`. All tools use this.

### Testing
- Vitest with `@/` path alias (mirrors tsconfig). Tests in `__tests__/`, globals enabled, node environment.

### Git / GitHub
- Each session workspace auto-initializes a git repo (`lib/git.ts`). Auto-commits on every successful `build_website`.
- Agent tools: `git_log`, `git_diff`, `git_status` (always available), `github_push` (gated — hidden when no `config.githubToken`).
- **Tool gating**: `getOpenAIToolsFiltered()` filters tools based on role (`master` vs `subagent`) and config. New conditional tools follow this pattern.
- **GitHub auth**: PAT in SettingsModal (localStorage) -> `config.githubToken` -> agent receives it in handler. No server-side storage.

### Session Recovery
- **`restoreWorkspace()`** vs `createWorkspace()`: use the former when `jsonlExists(sessionId)` — it checks for existing `scripts/site.js` and skips scaffold recopy, preserving agent additions.
- **Workspace state summary**: On session restore, the system prompt is extended with current `index.html` existence, build status, `todo.md` state, and recent git history.
- **UI state reconstruction**: `GET /api/session/{id}` returns `hasBuild`, `hasTodo`, `todoContent`, `gitPagesUrl`. HomeContent reconstructs badges from these.
- **New Session guard**: `HomeContent.tsx` compares `urlSessionId !== sessionId` (not just param existence) to prevent 404 when starting new session with `?session=` in URL.
- **Session API usage**: Use `jsonlExists()` and `readJsonl()` to persist/restore message history. The chat route loads history into the agent on session restore.

## Adding Features

### New LLM provider
1. Implement `AgentSession` interface (reference: `lib/agent/deepseek.ts`)
2. Register in `lib/agent/factory.ts` switch
3. Add to `SettingsModal.tsx` provider list
4. Add normalization in `app/api/chat/route.ts`
5. Add to `ALLOWED_PROVIDERS` in `lib/config.ts`

### New template
1. Add `index.html` to `workspace/templates/{name}/`
2. Must use body-only HTML (no document shell)
3. Optionally include `styles.css` and `main.js` in the template directory

### New tool
1. Define JSON Schema in `lib/agent/tools.ts`
2. Add handler function with proper error handling
3. Register in `toolRegistry` array
4. Add to `CONFIG.tools.allowed.master` (and optionally `subagent`) in `lib/config.ts`
5. Add path validation if tool accepts file paths

### New scaffold doc
1. Add `.md` file to `workspace/docs/`
2. It will be auto-loaded into the system prompt (subject to 30K char truncation)
3. Gotchas are always preserved in truncated prompts — put critical rules in `gotchas.md`

## Scaffold Knowledge Base

`workspace/` is git-tracked and auto-copied to each session. Key files:

- `workspace/docs/` — 6 web dev guides: `responsive-design.md`, `design-patterns.md`, `accessibility.md`, `seo-performance.md`, `interactive-ui.md`, `gotchas.md`
- `workspace/docs/gotchas.md` — 21 anti-patterns. Always preserved in truncated prompts (30K char limit).
- `workspace/lib/utils.js` — 12 utility exports (`$`, `$$`, `onReady`, `debounce`, `throttle`, `createModal`, `validateForm`, `initDarkMode`, `observeElements`, `smoothScroll`, `initTabs`, `initAccordion`). Copied to `scripts/utils.js` at session start.
- `workspace/templates/` — 4 template sites: `blog/`, `dashboard/`, `landing-page/`, `portfolio/`
- `workspace/agent.md` — agent system instructions, injected into system prompt after scaffold docs

## Domain Terms

| Term | Meaning |
|------|---------|
| Site | The generated single-file HTML output |
| Site Preview | Right-panel iframe showing the built Site |
| Agent | LLM with 11 tools operating in a Workspace |
| Workspace | Per-session `user_space/{uuid}/` directory |
| Web Scaffold | Git-tracked `workspace/` knowledge base |
| Build Pipeline | `lib/build/packager.ts` — produces `output/index.html` |
| Session | Ephemeral chat identified by UUID, persisted via JSONL |
| Tool Call | Agent's mechanism for interacting with the Workspace |
| Subagent | Research agent with 4 restricted tools, max 3 concurrent |
| Knowledge Flywheel | Agents extending the Web Scaffold with gotchas and utils |
