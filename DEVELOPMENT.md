# DEVELOPMENT.md

## Agent Pipeline Gotchas

### Provider Name Casing
The frontend sends provider names capitalized (`DeepSeek`, `OpenAI`, `Claude`) but the factory expects lowercase (`deepseek`, `openai`, `claude`). The chat route normalizes casing via `config.provider.toLowerCase()`. If adding a new provider, register it in the factory switch, the `ALLOWED_PROVIDERS` set, and the SettingsModal provider list.

### build_website Must Pass workspaceRoot + sessionId
The agent's `build_website` tool calls `buildWebsite(this.workspaceRoot, sessionId)`. The `workspaceRoot` is resolved to an absolute path in the `DeepSeekAgent` constructor. If you restructure the agent, ensure `this.workspaceRoot` is always resolved via `path.resolve()`.

### fromOpenAIToolCalls JSON.parse
Malformed JSON from the LLM in tool call arguments will NOT crash the entire agent loop. `fromOpenAIToolCalls()` catches parse errors with try-catch and returns empty args (`{}`). The error is handled downstream in `executeToolCalls` where the tool receives empty arguments and fails gracefully.

### System Prompt Size
Scaffold docs are truncated at 30,000 characters with gotchas always preserved. The truncation logic in `chat/route.ts` keeps the first 5 parts, the gotcha section, and the last 5 parts. If adding new scaffold docs, test that the truncated prompt still includes enough context for quality site generation.

### reasoning_content Must Be Echoed Back
DeepSeek reasoning/thinking models return a `reasoning_content` field in assistant messages. This field **MUST** be preserved and passed back unchanged in all subsequent multi-turn API calls. Dropping it causes HTTP 400: `The reasoning_content in the thinking mode must be passed back to the API.`

Three places handle this:
1. `AgentMessage` type has optional `reasoning_content?: string` (in `types.ts`)
2. `sendMessage()` captures it from the API response via `(responseMessage as unknown as Record<string, unknown>).reasoning_content`
3. `toOpenAIMessages()` emits it back in assistant messages via spread `...(msg.reasoning_content ? { reasoning_content: msg.reasoning_content } : {})`

If adding a new LLM provider, ensure reasoning/thinking content is preserved across turns.

### Provider Validation Ordering
Provider name validation (`ALLOWED_PROVIDERS.has(...)`) **must lowercase BEFORE checking**, not after. The frontend sends capitalized names (`'DeepSeek'`) but the set contains lowercase (`'deepseek'`). The correct order is:
```typescript
// Correct — lowercase before validation
ALLOWED_PROVIDERS.has(config.provider.toLowerCase())

// Wrong — validates original casing, then lowercases for factory call
ALLOWED_PROVIDERS.has(config.provider)  // 'DeepSeek' != 'deepseek'
```

### 15 Iteration Limit
The agent loop defaults to 15 iterations (NOT the game project's 10 — web site generation needs more cycles for writing HTML, CSS, JS, and iterating on appearance). Configured in `CONFIG.agent.maxIterations`. Subagents are limited to 5 iterations via `CONFIG.subagent.maxIterations`.

### Tool Timeout
Each tool call has a 30-second timeout (`CONFIG.agent.toolTimeoutMs`). Long-running tools (especially `delegate_subagent`) need explicit timeout handling. The timeout is enforced via `Promise.race` in `invokeTool()`.

### Fallback Model Retry
When the primary model fails (network error, API error), `createCompletion()` catches the error and retries with `config.fallbackModel` (defaults to `deepseek-v4-flash`). The retry is transparent to the agent, emitting a status message: `[Primary model unavailable, retrying with ${fallback}...]`.

### Agent Config Signal Propagation
Cancellation signals are passed to subagents and long-running tools via `this.config.signal`. The signal is set before `executeToolCalls()` and cleared after. Subagents check `config.signal?.aborted` on each iteration loop.

## Security Gotchas

### Iframe Sandbox — No allow-same-origin
**Never** add `allow-same-origin` back to the Site Preview iframe. Combined with `allow-scripts`, this lets generated site code access the parent origin's DOM, cookies, and localStorage (including the API key). `postMessage` works cross-origin — `allow-same-origin` is not needed.

### postMessage Origin Validation
The `WebsitePreview` message handler must validate `event.source` against the iframe's `contentWindow`. Without this check, any cross-origin page can send spoofed `site-error` messages. The validation is:
```typescript
if (event.source !== iframeRef.current?.contentWindow) return;
```
After removing `allow-same-origin` from the iframe sandbox, the iframe has a `null` origin — `event.origin` checks won't work. Use `event.source` instead.

### Path Validation (4 Layers)
The `validatePath()` function in `tools.ts` has four layers of defense:
1. Reject `..` in path strings
2. Verify workspace root itself is under `user_space/` (checks path segments)
3. Resolve path and check it starts with the workspace root boundary
4. Resolve symlinks via `realpathSync` (with graceful fallback if not found)

When modifying path validation, ensure all four layers are preserved.

### Session ID Validation
Session IDs from the client are validated as UUID format (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) before use in `path.join()` for workspace creation. This prevents directory traversal via crafted session IDs. Non-UUID session IDs receive HTTP 400. This validation exists in three places: preview route, session route, and chat route.

### API Key in Error Messages
Error responses auto-redact the API key. When adding new error paths in the chat route, ensure `config.apiKey` is redacted before returning error text to the client. The subagent error handler also redacts: `msg.replace(config.apiKey, '[REDACTED]')`.

### CSP Headers
The preview endpoint (`[sessionId]/route.ts`) sends `Content-Security-Policy` headers: `default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src 'self' data: blob:; media-src 'self' data: blob:`. This allows inline styles/scripts (needed for generated sites) while restricting external resources.

## Build Pipeline Gotchas

### Script Ordering
Scripts in `scripts/` are sorted in this priority order: `index.html` first, `styles.css` second, `main.js` third, then alphabetical for any additional files. If your site template needs a specific load order for CSS/JS files, name them accordingly.

### Module Scripts (not IIFE)
Generated site code uses `<script type="module">` instead of IIFE wrapping. The packager:
- Inlines all JS scripts into a single `<script type="module">` tag
- Prepends `utils.js` content before the main JS (shared scope)
- Never wraps in IIFE (would cause `SyntaxError: export` inside IIFE)
- Runs error handlers in plain `<script>` blocks (before the module) so they catch module runtime errors
- Emits the asset map (`window.__ASSETS__`) in a plain `<script>` before the module

The error handler posts `site-error` messages to `window.parent` for display in ErrorConsole.

### Body-Only HTML
The agent writes **only** the content that goes inside `<body>` to `scripts/index.html`. No `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags. The packager owns the full document shell:

```html
<!-- Written by agent (body-only): -->
<header>...</header>
<main id="main-content">...</main>
<footer>...</footer>

<!-- Produced by packager: -->
<!DOCTYPE html>
<html lang="en">
<head>...</head>
<body>
  <a href="#main-content" class="skip-link">...</a>
  <!-- Agent's body content here -->
  <script>window.__ASSETS__ = {...}</script>
  <script>window.addEventListener('error', ...)</script>
  <script type="module">/* utils + JS */</script>
</body>
</html>
```

### Scaffold Utilities Are Pre-Loaded
`utils.js` is concatenated BEFORE the agent's JS in the same `<script type="module">` tag. All its exports are available in scope. The agent MUST NOT redeclare any of these:

DOM: `$`, `$$`, `onReady`
Event: `debounce`, `throttle`
UI Components: `createModal`, `validateForm`, `initDarkMode`, `observeElements`, `smoothScroll`, `initTabs`, `initAccordion`

Redeclaring any of them causes `"Identifier has already been declared"` at runtime. The agent instructions list all 12 utilities by name.

### Assets Are Embedded as Base64
Assets in `assets/` are embedded as base64 data URIs in `window.__ASSETS__`. Supported formats: png, jpg, jpeg, gif, svg, webp, woff, woff2, ico. Large assets (>10MB) bloat the output HTML and may cause memory issues.

### .next Cache Compatibility
The `.next/` directory is **not compatible** between `npm run build` (production) and `npm run dev` (development). Switching between them causes `MODULE_NOT_FOUND` errors for stale webpack chunks. Always run:
```bash
rm -rf .next && npm run dev   # after npm run build
rm -rf .next && npm run build # after npm run dev
```

### .gitignore Pattern Scoping
The pattern `build/` in `.gitignore` matches ANY directory named `build` (including `app/api/build/` and `lib/build/`). Use `/build/` to scope to root-level only. Same applies to `output/`, `dist/`, and similar patterns.

### Packager Must Use Static Import
The `handleBuildWebsite` handler in `tools.ts` imports the packager. **Always use static import** (`import { buildWebsite } from '@/lib/build/packager'`) — never `await import('@/lib/build/packager')`. Dynamic imports route through Next.js webpack bundling and fail with `Cannot find module` errors when the `.next` cache is stale. The packager is pure Node.js (only `fs` + `path`) — no webpack needed.

### Build Error Messages Must Be Actionable
When the build tool returns errors, the message must tell the agent WHAT TO DO, not just what happened:
```typescript
// Correct — clear action instruction
return `BUILD FAILED: ${errors}. Fix the errors in scripts/ and call build_website again.`;

// Wrong — agent doesn't know next step
return `Build completed with warnings: ${errors}`;
```
Use "BUILD FAILED" not "Build completed with warnings" for actual errors. Always include a recovery instruction.

### Build Pipeline Skips Page Title/Description
The packager extracts the page title from the first `<h1>` in the body content and the description from the first `<p>`. If neither exists, it falls back to `'Generated Site'` and `'A generated website'`. Custom templates should include a clear `<h1>` and descriptive `<p>` for proper SEO meta tags.

## Frontend Gotchas

### Settings Initialization
On first visit (no localStorage), the SettingsModal auto-opens. The "New Session" button does NOT reset settings — only session state (messages, site URL, errors).

### Error Types and Limits
`SiteError` is exported from `WebsitePreview.tsx` as the canonical type (`{ message, source, lineno, colno }`). Import from there — do not redefine locally. Site runtime errors are capped at 50 entries to prevent unbounded growth from buggy site code.

### isGenerating Guard
`handleSendMessage` uses `isGenerating` as a dependency in `useCallback`. Between React's batch state updates and re-render, concurrent sends are possible in edge cases. The guard is best-effort, not a hard mutex.

### SSR + dynamic import pattern
The main page uses browser APIs (`crypto.randomUUID()`, `localStorage`, `window.innerWidth`) that cannot SSR. The correct pattern is a thin `page.tsx` wrapper with `dynamic` import:
```typescript
// page.tsx — thin wrapper
import dynamic from 'next/dynamic';
const HomeContent = dynamic(() => import('./HomeContent'), { ssr: false });
export default HomeContent;

// HomeContent.tsx — actual component
'use client';
export default function HomeContent() { /* browser APIs here */ }
```

**Do NOT** use `dynamic(() => Promise.resolve(Component), { ssr: false })` — this causes module resolution errors during build.

### Dark Reader Hydration
The `<html>` tag in `layout.tsx` must have `suppressHydrationWarning` to handle browser extensions (Dark Reader, Grammarly, etc.) that inject `data-*` attributes into the DOM after SSR. The `<body>` also needs it. Without these, every page load logs a hydration warning.

### Error Response Body Read Order
When handling API errors, **read `res.json()` BEFORE checking `!res.ok`**. The server's error message is in the JSON body; checking status first and throwing loses it:
```typescript
// Correct — capture error body before status check
const data = await res.json();
if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`);

// Wrong — error body is lost
if (!res.ok) throw new Error(`Server error: ${res.status}`);
const data = await res.json(); // never reached
```

### buildResult Success Check
The `buildResult` field on chat API responses has a `success` boolean. Check it directly — don't rely on truthiness of `data.buildResult` (which is always truthy when the object exists, even if `success: false`):
```typescript
// Correct
if (data.buildResult?.success && data.buildResult?.previewUrl) {
  setSiteUrl(data.buildResult.previewUrl);
}

// Wrong — shows "Site ready!" badge even when build failed
buildResult: !!data.buildResult
```

### Message Size Limit
Messages are capped at 50,000 characters (`MAX_MESSAGE_LENGTH` in `lib/config.ts`). This prevents memory/API DoS. The limit is enforced in the chat route.

### Streaming Response Handling
The chat route uses SSE (Server-Sent Events) for streaming. Event types are: `message`, `reasoning`, `tool_call`, `tool_result`, `build_result`, `github_push_result`, `todo_update`, `site_preview`, `error`, `done`. The client parses SSE `data:` lines and dispatches by `event.type`.

### Todo Update Via SSE
After `write_todo` or `edit_file` on `todo.md`, the server parses the markdown and emits a `todo_update` event with `tasks`, `done`, `pending`, and `next` fields. The `ChatPanel` renders a `TodoCard` with progress tracking.

### Mobile View Toggle
On mobile (<768px), the UI switches to a tabbed view with "Chat" and "Preview" tabs. The `HomeContent` component uses a `mobileView` state and conditional rendering based on `isMobile`.

## Workspace Manager Gotchas

### In-Memory Sessions + HMR
Sessions are stored in an in-memory `Map` in `manager.ts`. Next.js HMR **wipes all module-level state** on any code change during dev. This means `getWorkspace()` returns `null` even though files exist on disk.

The preview route (`/api/preview/[sessionId]`) handles this with a two-tier lookup:
```typescript
// 1. Fast path: in-memory Map (works when no HMR reset)
const workspace = getWorkspace(sessionId);
// 2. Fallback: construct path directly from disk (survives HMR resets)
const outputPath = workspace
  ? path.join(workspace.workspacePath, 'output', 'index.html')
  : path.join(USER_SPACE_DIR, sessionId, 'output', 'index.html');
```

If adding another API route that needs workspace access, include the filesystem fallback.

### Scaffold Copying (Web-Specific Paths)
On session creation, `copyScaffoldToWorkspace` copies scaffold into `user_space/{sessionId}/`:
- `workspace/docs/` -> `user_space/{id}/docs/` (responsive-design, design-patterns, accessibility, seo-performance, interactive-ui, gotchas)
- `workspace/templates/` -> `user_space/{id}/templates/` (blog, dashboard, landing-page, portfolio)
- `workspace/lib/` -> `user_space/{id}/lib/` (utils.js source, index.md API reference)
- `workspace/lib/utils.js` -> `user_space/{id}/scripts/utils.js` (build pipeline requires it here)
- `workspace/agent.md` + `workspace/claude.md` -> `user_space/{id}/` (agent instructions)

Silent skip on missing files (`.catch(() => {})`).

### Agent.md Injection
The chat route reads `workspace/agent.md` and appends it to the system prompt after scaffold docs. This ensures the agent always gets the full instruction set even if the agent.md file isn't read separately. Missing agent.md is silently skipped.

### Stale Cleanup
`cleanupStaleWorkspaces` uses `Promise.allSettled` to ensure one failed deletion doesn't block others. Stale sessions (default: 1 hour inactivity) are evicted. Max active sessions is 100 (LRU eviction on overflow).

### Workspace Gitignore
Each workspace gets a `.gitignore` with `output/` — build output is regenerated and never committed. Scripts and assets are always tracked.

### restoreWorkspace vs createWorkspace
When re-creating an agent for an existing session (HMR, restart), use `restoreWorkspace()` — not `createWorkspace()`. The former detects existing `scripts/site.js` on disk and skips scaffold recopy, preserving agent additions to `utils.js`, `gotchas.md`, and the git history. The latter would overwrite these.

```typescript
// chat/route.ts — correct pattern
const isRestoring = jsonlExists(sessionId);
const workspace = isRestoring
  ? await restoreWorkspace(sessionId)  // preserves existing files
  : await createWorkspace(sessionId);  // fresh scaffold for new sessions
```

### Session API Usage
`jsonlExists()` and `readJsonl()` persist and restore message history. On session restore (`jsonlExists` returns true), the chat route loads history into the agent via `agent.loadHistory(history)`. The `GET /api/session/{id}` endpoint returns structured data including `messages`, `siteUrl`, `hasBuild`, `hasTodo`, `todoContent`, and `gitPagesUrl`.

### Workspace State Summary
When restoring a session, the system prompt is extended with a "Session Restoration" block. This tells the agent about existing `index.html`, build status, `todo.md`, and recent git history — preventing the agent from restarting from scratch.

```typescript
if (isRestoring) {
  // Injects workspace state summary to orient the agent
  // Checks for: scripts/index.html, output/index.html, todo.md
  // Includes: git log --oneline -5
}
```

### Git Auto-commit After Build
In `chat/route.ts`, after a successful `build_website` tool result, `gitCommit(workspacePath, 'Build: site update')` is called. This is fire-and-forget — commit failures are silently ignored (the site still builds). The agent sees commits via `git_log`.

### Tool Gating via Config
`github_push` is conditionally exposed to the agent based on `config.githubToken`. `getOpenAIToolsFiltered(role, config)` filters it out when no token is configured. New conditional tools should follow this pattern:

```typescript
// tools.ts
export function getOpenAIToolsFiltered(role, config?) {
  return toolRegistry
    .filter((t) => allowed.includes(t.definition.name))
    .filter((t) => {
      if (t.definition.name === 'github_push' && !config?.githubToken) return false;
      return true;
    })
    .map(...)
}
```

### Session Limit and LRU Eviction
Max 100 active sessions (`CONFIG.workspace.maxActiveSessions`). When exceeded, the oldest session (by `lastActiveAt`) is evicted and its workspace deleted from disk. Session cleanup also runs periodically for sessions inactive >1 hour.

### New Session Guard
The session restoration effect in HomeContent compares `urlSessionId !== sessionId` instead of just checking param existence. This prevents the "New Session" button from triggering a 404 when `?session=` is in the URL:

```typescript
// HomeContent.tsx — correct guard
const urlSessionId = params.get('session');
if (!urlSessionId || urlSessionId !== sessionId) return; // skip if IDs don't match
```
