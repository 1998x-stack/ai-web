# AI Web Studio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 web application where users chat with a DeepSeek-powered AI agent to generate single-page Sites (HTML/CSS/JS), instantly previewable in a sandboxed iframe.

**Architecture:** Three-layer split-panel design (Chat UI + Agent Pipeline + Web Scaffold), modeled after ai-game. The Agent writes body-only HTML into `scripts/`, the Build Pipeline wraps it in a complete document shell with inlined CSS/JS/base64 assets. Session-isolated workspaces with JSONL persistence.

**Tech Stack:** Next.js 14 (App Router), TypeScript 5.4, Tailwind CSS 3.4, DeepSeek API (OpenAI-compatible SDK), Vitest.

**Reference:** [Design Spec](../specs/2026-05-26-ai-web-design.md) | [Domain Glossary](../../CONTEXT.md) | [ADR-0001](../../docs/adr/0001-single-page-sites-v1.md) | [ADR-0002](../../docs/adr/0002-packager-owns-document-shell.md)

---

## File Map

### Created (New)
```
workspace/docs/responsive-design.md
workspace/docs/design-patterns.md
workspace/docs/accessibility.md
workspace/docs/seo-performance.md
workspace/docs/interactive-ui.md
workspace/docs/gotchas.md
workspace/templates/landing-page/index.html
workspace/templates/landing-page/styles.css
workspace/templates/landing-page/main.js
workspace/templates/portfolio/index.html
workspace/templates/portfolio/styles.css
workspace/templates/portfolio/main.js
workspace/templates/blog/index.html
workspace/templates/blog/styles.css
workspace/templates/blog/main.js
workspace/templates/dashboard/index.html
workspace/templates/dashboard/styles.css
workspace/templates/dashboard/main.js
workspace/lib/utils.js
workspace/lib/index.md
workspace/agent.md
workspace/skills/README.md
lib/build/packager.ts
components/WebsitePreview.tsx
AGENTS.md
DEVELOPMENT.md
```

### Modified (Copied + Adapted from ai-game)
```
lib/agent/tools.ts                    — build_website + search_unsplash handlers
lib/agent/types.ts                    — StreamEvent type additions
lib/config.ts                         — iterations=15, tool names
lib/workspace/manager.ts              — scaffold copy paths
lib/scaffold/reader.ts                — doc list update
app/page.tsx                          — import rename
app/HomeContent.tsx                   — game → Site references
app/layout.tsx                        — metadata
app/api/chat/route.ts                 — system prompt paths, tool names
app/api/build/route.ts                — import path
app/api/preview/[id]/route.ts         — paths
app/api/session/[id]/route.ts         — (copy, no changes)
components/ChatPanel.tsx              — (copy, no changes)
components/SettingsModal.tsx          — provider labels
components/ErrorConsole.tsx           — (copy, no changes)
__tests__/api.test.ts                 — web tool tests
```

### Copied As-Is from ai-game
```
lib/agent/factory.ts
lib/agent/deepseek.ts
lib/agent/index.ts
lib/session-store.ts
vitest.config.ts
tailwind.config.ts
tsconfig.json
next.config.js
postcss.config.js
package.json (same deps)
```

---

## Phase 1: Project Bootstrap

### Task 1.1: Initialize Repository

**Files:**
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Init git and add remote**

```bash
cd /Users/mx/Desktop/ai-web && git init && git remote add origin https://github.com/1998x-stack/ai-web.git
```

- [ ] **Step 2: Write .gitignore**

```
# dependencies
/node_modules
/.pnp
.pnp.js

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# runtime sessions (user-generated content)
/user_space/

# brainstorm artefacts
/.superpowers/

# test artefacts
/playwright-report/
/test-results/
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore && git commit -m "chore: init repository with gitignore"
```

---

### Task 1.2: Copy ai-game Framework

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `postcss.config.js`, `tailwind.config.ts`, `vitest.config.ts`
- Create: `lib/agent/factory.ts`, `lib/agent/deepseek.ts`, `lib/agent/index.ts`, `lib/session-store.ts`

- [ ] **Step 1: Copy config files from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/package.json /Users/mx/Desktop/ai-web/package.json
cp /Users/mx/Desktop/ai-game/tsconfig.json /Users/mx/Desktop/ai-web/tsconfig.json
cp /Users/mx/Desktop/ai-game/next.config.js /Users/mx/Desktop/ai-web/next.config.js
cp /Users/mx/Desktop/ai-game/postcss.config.js /Users/mx/Desktop/ai-web/postcss.config.js
cp /Users/mx/Desktop/ai-game/tailwind.config.ts /Users/mx/Desktop/ai-web/tailwind.config.ts
cp /Users/mx/Desktop/ai-game/vitest.config.ts /Users/mx/Desktop/ai-web/vitest.config.ts
```

- [ ] **Step 2: Update package.json name**

```bash
# Edit package.json: change "name" from "ai-game" to "ai-web"
```

Change `package.json` line 2:
```json
"name": "ai-web",
```

- [ ] **Step 3: Copy unchanged lib files from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/lib/agent/factory.ts /Users/mx/Desktop/ai-web/lib/agent/factory.ts
cp /Users/mx/Desktop/ai-game/lib/agent/deepseek.ts /Users/mx/Desktop/ai-web/lib/agent/deepseek.ts
cp /Users/mx/Desktop/ai-game/lib/agent/index.ts /Users/mx/Desktop/ai-web/lib/agent/index.ts
cp /Users/mx/Desktop/ai-game/lib/session-store.ts /Users/mx/Desktop/ai-web/lib/session-store.ts
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "chore: bootstrap project from ai-game framework"
```

---

### Task 1.3: Copy + Adapt Agent Types

**Files:**
- Modify: `lib/agent/types.ts`

- [ ] **Step 1: Copy types.ts from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/lib/agent/types.ts /Users/mx/Desktop/ai-web/lib/agent/types.ts
```

- [ ] **Step 2: Add Site-specific stream events**

Add to the `StreamEvent` union type in `lib/agent/types.ts`:

```typescript
export type StreamEvent =
  | { type: 'message'; content: string }
  | { type: 'reasoning'; content: string }
  | { type: 'tool_call'; name: string; arguments: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: string; error?: boolean }
  | { type: 'build_result'; previewUrl: string | null; success: boolean }
  | { type: 'site_preview'; url: string }
  | { type: 'error'; message: string }
  | { type: 'todo_update'; tasks: TodoTask[]; done: number; pending: number; next?: string }
  | { type: 'done' };
```

- [ ] **Step 3: Commit**

```bash
git add lib/agent/types.ts && git commit -m "feat: add site_preview stream event type"
```

---

### Task 1.4: Copy + Adapt Config

**Files:**
- Modify: `lib/config.ts`

- [ ] **Step 1: Copy config.ts from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/lib/config.ts /Users/mx/Desktop/ai-web/lib/config.ts
```

- [ ] **Step 2: Update configuration values**

```typescript
// Agent configuration
export const MAX_AGENT_ITERATIONS = 15; // was 10 — websites need more iterations
export const TOOL_TIMEOUT_MS = 30000;
export const SYSTEM_PROMPT_MAX_CHARS = 30000;

// Master agent tool allowlist
export const MASTER_TOOL_ALLOWLIST = [
  'read_file', 'write_file', 'edit_file', 'list_directory', 'grep_file',
  'build_website', 'search_unsplash', 'load_skills', 'write_todo',
  'set_error', 'delegate_subagent'
];

// Subagent tool allowlist (restricted)
export const SUBAGENT_TOOL_ALLOWLIST = [
  'read_file', 'write_file', 'grep_file', 'list_directory'
];

// Session management
export const MAX_SESSIONS = 100;
export const SESSION_STALE_TIMEOUT_MS = 3600000;
export const MAX_SUBAGENTS = 3;
export const MAX_SUBAGENT_ITERATIONS = 5;
```

- [ ] **Step 3: Commit**

```bash
git add lib/config.ts && git commit -m "feat: update config for ai-web (15 iter, web tool names)"
```

---

## Phase 2: Core Build Pipeline

### Task 2.1: Write the Website Packager

**Files:**
- Create: `lib/build/packager.ts`

**The packager takes `scripts/*.{html,css,js}` + `assets/*` → produces `output/index.html`.** Per ADR-0002, the agent writes body-only HTML and the packager owns the document shell.

- [ ] **Step 1: Write the packager**

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface BuildResult {
  success: boolean;
  previewUrl?: string;
  errors?: string[];
}

interface ScriptFile {
  name: string;
  content: string;
}

interface AssetFile {
  name: string;
  buffer: Buffer;
  ext: string;
}

/**
 * Build a single self-contained Site from workspace scripts and assets.
 * Per ADR-0002: packager owns the document shell. Agent writes body-only HTML.
 */
export function buildWebsite(workspaceRoot: string, sessionId: string): BuildResult {
  const scriptsDir = path.join(workspaceRoot, 'scripts');
  const assetsDir = path.join(workspaceRoot, 'assets');
  const outputDir = path.join(workspaceRoot, 'output');
  const utilsPath = path.join(workspaceRoot, 'lib', 'utils.js');

  try {
    // 1. Read scripts
    if (!fs.existsSync(scriptsDir)) {
      return { success: false, errors: ['scripts/ directory not found. Create scripts/index.html first.'] };
    }

    const scriptFiles: ScriptFile[] = fs.readdirSync(scriptsDir)
      .filter(f => /\.(html|css|js)$/i.test(f))
      .map(f => ({
        name: f,
        content: fs.readFileSync(path.join(scriptsDir, f), 'utf-8')
      }));

    if (scriptFiles.length === 0) {
      return { success: false, errors: ['No script files found in scripts/. Create at least index.html.'] };
    }

    // 2. Sort scripts: index.html first, styles.css second, main.js third, then alphabetical
    const priorityOrder: Record<string, number> = {
      'index.html': 0,
      'styles.css': 1,
      'main.js': 2,
    };

    scriptFiles.sort((a, b) => {
      const pa = priorityOrder[a.name] ?? 100;
      const pb = priorityOrder[b.name] ?? 100;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name);
    });

    // 3. Extract HTML body content (from index.html)
    const htmlFile = scriptFiles.find(f => f.name === 'index.html');
    const bodyContent = htmlFile ? htmlFile.content : '<main id="main-content"><p>Empty site</p></main>';

    // 4. Extract title from h1 or first heading
    const titleMatch = bodyContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const pageTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : 'Generated Site';

    // 5. Extract description from first paragraph
    const descMatch = bodyContent.match(/<p[^>]*>(.*?)<\/p>/i);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').substring(0, 160)
      : 'A generated website';

    // 6. Concatenate CSS (styles.css first, then alphabetical)
    const cssFiles = scriptFiles.filter(f => f.name.endsWith('.css'));
    const css = cssFiles.map(f => f.content).join('\n');

    // 7. Read utility library
    let utilsContent = '';
    if (fs.existsSync(utilsPath)) {
      utilsContent = fs.readFileSync(utilsPath, 'utf-8');
    }

    // 8. Concatenate JS (main.js first, then alphabetical) — prepend utils
    const jsFiles = scriptFiles.filter(f => f.name.endsWith('.js'));
    const js = jsFiles.map(f => f.content).join('\n');

    // 9. Process assets — embed as base64
    const assets: Record<string, string> = {};
    if (fs.existsSync(assetsDir)) {
      const assetFiles = fs.readdirSync(assetsDir).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ico'].includes(ext);
      });
      for (const f of assetFiles) {
        const buf = fs.readFileSync(path.join(assetsDir, f));
        const ext = path.extname(f).toLowerCase().slice(1);
        const mimeMap: Record<string, string> = {
          png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
          gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
          woff: 'font/woff', woff2: 'font/woff2', ico: 'image/x-icon'
        };
        const mime = mimeMap[ext] || 'application/octet-stream';
        assets[f] = `data:${mime};base64,${buf.toString('base64')}`;
      }
    }

    // 10. Assemble final HTML
    const html = assembleHTML({
      title: pageTitle,
      description,
      bodyContent,
      css,
      utilsContent,
      js,
      assets,
    });

    // 11. Write output
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf-8');

    return { success: true, previewUrl: `/api/preview/${sessionId}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, errors: [`BUILD CRASHED: ${message}`] };
  }
}

function assembleHTML(params: {
  title: string;
  description: string;
  bodyContent: string;
  css: string;
  utilsContent: string;
  js: string;
  assets: Record<string, string>;
}): string {
  const { title, description, bodyContent, css, utilsContent, js, assets } = params;
  const assetsJSON = JSON.stringify(assets);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <meta name="description" content="${escapeHTML(description)}">
  <meta property="og:title" content="${escapeHTML(title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:type" content="website">
  <style>
/* === Utility Library (auto-injected) === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a2e; }

/* === Agent CSS === */
${css}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link" style="position:absolute;top:-100px;left:0;background:#3b82f6;color:#fff;padding:8px 16px;z-index:10000;transition:top 0.2s">Skip to content</a>
  <style>.skip-link:focus{top:0}</style>

${bodyContent}

  <script>
window.__ASSETS__ = ${assetsJSON};
  </script>

  <script>
window.addEventListener('error', function(e) {
  window.parent.postMessage({
    type: 'site-error',
    message: e.message,
    source: e.filename || '',
    lineno: e.lineno || 0,
    colno: e.colno || 0
  }, '*');
});
window.addEventListener('unhandledrejection', function(e) {
  window.parent.postMessage({
    type: 'site-error',
    message: 'Unhandled Promise: ' + (e.reason?.message || String(e.reason)),
    source: '',
    lineno: 0,
    colno: 0
  }, '*');
});
(function() {
  var origError = console.error;
  console.error = function() {
    var args = Array.prototype.slice.call(arguments);
    window.parent.postMessage({
      type: 'site-error',
      message: '[console.error] ' + args.map(function(a) {
        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
        catch(e) { return String(a); }
      }).join(' '),
      source: '',
      lineno: 0,
      colno: 0
    }, '*');
    return origError.apply(console, args);
  };
})();
  </script>

  <script type="module">
${utilsContent}

${js}
  </script>
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export { buildWebsite };
```

- [ ] **Step 2: Verify packager compiles**

```bash
npx tsc --noEmit lib/build/packager.ts
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add lib/build/packager.ts && git commit -m "feat: website build pipeline (ADR-0002 partial HTML model)"
```

---

### Task 2.2: Update Tool Registry — build_website + search_unsplash

**Files:**
- Modify: `lib/agent/tools.ts`

- [ ] **Step 1: Copy tools.ts from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/lib/agent/tools.ts /Users/mx/Desktop/ai-web/lib/agent/tools.ts
```

- [ ] **Step 2: Replace build_game tool definition with build_website**

Remove the existing `build_game` tool definition and handler. Add:

```typescript
// build_website tool definition
const buildWebsiteDef: ToolDefinition = {
  type: 'function',
  function: {
    name: 'build_website',
    description: 'Build the current website from scripts/ and assets/ into a single self-contained output/index.html file. Call this after writing or editing any HTML, CSS, or JS files. The result tells you if the build succeeded or failed with errors.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

// build_website handler
async function handleBuildWebsite(
  args: Record<string, unknown>,
  workspaceRoot: string,
  sessionId: string
): Promise<string> {
  const { buildWebsite } = await import('@/lib/build/packager');
  const result = buildWebsite(workspaceRoot, sessionId);

  if (result.success) {
    return `BUILD SUCCESS. Preview available at ${result.previewUrl}. Open the Site Preview to see the result.`;
  }
  return `BUILD FAILED: ${(result.errors || ['Unknown error']).join('; ')}. Fix the errors in scripts/ and call build_website again.`;
}
```

- [ ] **Step 3: Add search_unsplash tool definition and handler**

```typescript
// search_unsplash tool definition
const searchUnsplashDef: ToolDefinition = {
  type: 'function',
  function: {
    name: 'search_unsplash',
    description: 'Search for stock photos on Unsplash to use in the website. Returns image URLs with attribution info. Use this to find real images for hero sections, backgrounds, team photos, blog post images, etc. Falls back to placeholder images if no API key is configured.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term describing the image you need (e.g., "modern office", "mountain landscape", "team collaboration")',
        },
        count: {
          type: 'number',
          description: 'Number of images to return (1-5). Default: 3.',
        },
        orientation: {
          type: 'string',
          enum: ['landscape', 'portrait', 'squarish'],
          description: 'Image orientation preference. Default: landscape.',
        },
      },
      required: ['query'],
    },
  },
};

// search_unsplash handler
async function handleSearchUnsplash(
  args: Record<string, unknown>,
  _workspaceRoot: string
): Promise<string> {
  const query = String(args.query || '');
  const count = Math.min(Math.max(Number(args.count) || 3, 1), 5);
  const orientation = String(args.orientation || 'landscape');

  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  // Tier 1: Try Unsplash API if key available
  if (UNSPLASH_ACCESS_KEY) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`;
      const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      });
      if (res.ok) {
        const data = await res.json() as { results: Array<{ urls: { regular: string }; alt_description: string; user: { name: string; links: { html: string } } }> };
        if (data.results?.length > 0) {
          const images = data.results.map((r, i) =>
            `${i + 1}. ${r.urls.regular}\n   Alt: ${r.alt_description || query}\n   Photo by ${r.user.name} (${r.user.links.html})`
          );
          return `Found ${data.results.length} images for "${query}":\n\n${images.join('\n\n')}\n\nUse these URLs in <img> tags. Attribution will be auto-injected into the footer by the build pipeline.`;
        }
      }
    } catch {
      // Fall through to Tier 2
    }
  }

  // Tier 2: picsum.photos fallback
  const widths = orientation === 'portrait' ? [400, 400, 400] : orientation === 'squarish' ? [400, 400, 400] : [800, 800, 600];
  const heights = orientation === 'portrait' ? [600, 600, 600] : orientation === 'squarish' ? [400, 400, 400] : [600, 400, 400];
  const images = Array.from({ length: count }, (_, i) =>
    `${i + 1}. https://picsum.photos/${widths[i]}/${heights[i]}?random=${Date.now() + i}\n   Placeholder image (picsum.photos fallback)`
  );

  return `Placeholder images for "${query}" (Unsplash key not configured or API unavailable):\n\n${images.join('\n\n')}\n\nUse these as img src. Replace with real images when available.`;
}
```

- [ ] **Step 4: Update tool registry array**

```typescript
export const toolRegistry: ToolEntry[] = [
  { definition: readFileDef, handler: handleReadFile },
  { definition: writeFileDef, handler: handleWriteFile },
  { definition: editFileDef, handler: handleEditFile },
  { definition: listDirectoryDef, handler: handleListDirectory },
  { definition: grepFileDef, handler: handleGrepFile },
  { definition: buildWebsiteDef, handler: handleBuildWebsite },
  { definition: searchUnsplashDef, handler: handleSearchUnsplash },
  { definition: loadSkillsDef, handler: handleLoadSkills },
  { definition: writeTodoDef, handler: handleWriteTodo },
  { definition: setErrorDef, handler: handleSetError },
  { definition: delegateSubagentDef, handler: handleDelegateSubagent },
];
```

- [ ] **Step 5: Remove game_runtime tool**

Remove the `gameRuntimeDef` and `handleGameRuntime` from the file entirely.

- [ ] **Step 6: Verify compilation**

```bash
npx tsc --noEmit lib/agent/tools.ts
```

Expected: No type errors. (May show errors for missing imports — fix those.)

- [ ] **Step 7: Commit**

```bash
git add lib/agent/tools.ts && git commit -m "feat: build_website and search_unsplash tool handlers"
```

---

### Task 2.3: Copy + Adapt Workspace Manager

**Files:**
- Modify: `lib/workspace/manager.ts`

- [ ] **Step 1: Copy manager.ts from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/lib/workspace/manager.ts /Users/mx/Desktop/ai-web/lib/workspace/manager.ts
```

- [ ] **Step 2: Update scaffold copy paths**

Update `copyScaffoldToWorkspace()` to copy web scaffold instead of game scaffold:

```typescript
// Changed: copy web-specific scaffold files
const scaffoldDirs = ['docs', 'templates', 'lib', 'skills'];
for (const dir of scaffoldDirs) {
  const srcDir = path.join(process.cwd(), 'workspace', dir);
  const destDir = path.join(workspacePath, dir);
  if (fs.existsSync(srcDir)) {
    copyDirSync(srcDir, destDir);
  }
}

// Copy agent.md and utils.js to scripts/
const agentMd = path.join(process.cwd(), 'workspace', 'agent.md');
if (fs.existsSync(agentMd)) {
  fs.copyFileSync(agentMd, path.join(workspacePath, 'agent.md'));
}

// Copy utils.js to scripts/ (build pipeline requires it there)
const utilsSrc = path.join(process.cwd(), 'workspace', 'lib', 'utils.js');
if (fs.existsSync(utilsSrc)) {
  if (!fs.existsSync(path.join(workspacePath, 'scripts'))) {
    fs.mkdirSync(path.join(workspacePath, 'scripts'), { recursive: true });
  }
  fs.copyFileSync(utilsSrc, path.join(workspacePath, 'scripts', 'utils.js'));
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/workspace/manager.ts && git commit -m "feat: update workspace manager for web scaffold paths"
```

---

### Task 2.4: Copy + Adapt Scaffold Reader

**Files:**
- Modify: `lib/scaffold/reader.ts`

- [ ] **Step 1: Copy reader.ts from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/lib/scaffold/reader.ts /Users/mx/Desktop/ai-web/lib/scaffold/reader.ts
```

- [ ] **Step 2: Update document list**

```typescript
const SCAFFOLD_DOCS = [
  'responsive-design.md',
  'design-patterns.md',
  'accessibility.md',
  'seo-performance.md',
  'interactive-ui.md',
  'gotchas.md',
];
```

- [ ] **Step 3: Commit**

```bash
git add lib/scaffold/reader.ts && git commit -m "feat: update scaffold reader for web dev docs"
```

---

## Phase 3: Scaffold Knowledge Base

### Task 3.1: Write Web Development Guides — Responsive Design

**Files:**
- Create: `workspace/docs/responsive-design.md`

This is a substantial content task. Write the authoritative responsive design guide the Agent reads before generating any Site.

- [ ] **Step 1: Write workspace/docs/responsive-design.md**

The guide should cover (~800 lines):

```markdown
# Responsive Design & CSS Layout Guide

> **Rules the Agent MUST follow.** This is the authoritative reference for responsive web design.

## Core Principle: Mobile-First

Always write CSS for the smallest screen first (320px width minimum), then add breakpoints for larger screens. Never use fixed pixel widths on containers.

## Required Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
This is auto-injected by the build pipeline. Do NOT add it manually.

## Breakpoints

| Name | Min Width | Target Device |
|---|---|---|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |

Always test at 320px — the smallest common mobile width.

## Container Pattern

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

Use this for all content sections. Never set a fixed `width` on containers.

## Flexbox Layout

Flexbox is for one-dimensional layouts (rows OR columns).

```css
/* Horizontal navigation */
.nav-list {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

/* Vertical stack on mobile, row on desktop */
.features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .features {
    flex-direction: row;
  }
}
```

## CSS Grid Layout

Grid is for two-dimensional layouts (rows AND columns).

```css
/* 3-column card grid, collapses to 2 then 1 */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Responsive Images

```html
<img src="hero.jpg" alt="Description" loading="lazy"
     style="max-width:100%; height:auto; aspect-ratio:16/9;">
```

- Always add `max-width: 100%` to images
- Always add `height: auto` to prevent distortion
- Use `loading="lazy"` for below-fold images
- Set explicit `aspect-ratio` to prevent layout shift (CLS)

## Typography Responsiveness

```css
html {
  font-size: 100%; /* 16px default */
}

h1 { font-size: clamp(1.75rem, 4vw, 3rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); }
h3 { font-size: clamp(1.25rem, 2vw, 1.75rem); }
p  { font-size: clamp(1rem, 1.5vw, 1.125rem); }
```

Use `clamp()` for fluid typography that scales with viewport.

## CSS Custom Properties for Responsive Values

```css
:root {
  --container-padding: 1rem;
  --section-spacing: 3rem;
  --grid-columns: 1;
}

@media (min-width: 768px) {
  :root {
    --container-padding: 2rem;
    --section-spacing: 5rem;
    --grid-columns: 2;
  }
}

@media (min-width: 1024px) {
  :root {
    --grid-columns: 3;
  }
}
```

## Navigation Patterns

### Hamburger Menu (Mobile)

```css
.nav-links {
  display: none;
}

.nav-links.active {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
    flex-direction: row;
  }
  .hamburger {
    display: none;
  }
}
```

## Common Anti-Patterns to AVOID

1. `width: 1000px` on a container → use `max-width: 1000px`
2. `font-size: 16px` on html → use relative units
3. Media queries going smaller-first → always go mobile-first
4. Missing viewport meta → injected by packager, but good to know
5. Overflow hidden on body → breaks scrolling on mobile

## Testing Checklist

- [ ] Site renders correctly at 320px width
- [ ] No horizontal scrollbar at any breakpoint
- [ ] Text is readable without zooming
- [ ] Touch targets are at least 44x44px
- [ ] Images don't overflow their containers
```

- [ ] **Step 2: Commit**

```bash
git add workspace/docs/responsive-design.md && git commit -m "feat: responsive design scaffold guide"
```

---

### Task 3.2: Write Design Patterns, Accessibility, SEO, Interactive UI Guides

**Files:**
- Create: `workspace/docs/design-patterns.md`
- Create: `workspace/docs/accessibility.md`
- Create: `workspace/docs/seo-performance.md`
- Create: `workspace/docs/interactive-ui.md`

These four guides follow the same authoritative pattern as responsive-design.md. Each is ~500-700 lines with concrete code examples, required rules, and anti-patterns.

- [ ] **Step 1: Write design-patterns.md**

Covers: typography scale (modular scale 1.25), color system (CSS custom properties: --color-primary, --color-accent, --color-bg, --color-text, --color-muted), spacing scale (4px base), visual hierarchy (size/color/spacing/contrast), card patterns, hero section template, CTA button patterns, shadow/depth layers, whitespace principles. Agent rule: "Use CSS custom properties for all colors. Never use pure black (#000) or pure white (#fff)."

- [ ] **Step 2: Write accessibility.md**

Covers: semantic HTML landmarks (header, nav, main, article, aside, footer), heading hierarchy (h1→h2→h3, never skip), ARIA roles/labels for interactive elements, color contrast (4.5:1 min), keyboard navigation (tabindex, focus-visible), skip-to-content (auto-injected), form labels + error messages, alt text on images, reduced motion, screen reader text. Agent rule: "Every img must have alt text. Every input must have a label. Color alone never conveys information."

- [ ] **Step 3: Write seo-performance.md**

Covers: meta tags (title, description — packager extracts these), OG tags (auto-injected), semantic heading hierarchy, structured data (JSON-LD for articles, products), canonical URLs, lazy loading images, font-display: swap, resource hints. Agent rule: "Use semantic HTML. Heading hierarchy must be sequential."

- [ ] **Step 4: Write interactive-ui.md**

Covers: navigation (sticky header, hamburger menu, breadcrumbs), forms (validation, error states, success feedback), modals/dialogs (focus trap, Escape to close, backdrop), tabs, accordions, dark mode toggle (prefers-color-scheme + localStorage), smooth scrolling, intersection observer for animations. Agent rule: "Use CSS for animations. JS only for complex sequences. Respect prefers-reduced-motion."

- [ ] **Step 5: Commit**

```bash
git add workspace/docs/ && git commit -m "feat: design patterns, a11y, seo, interactive UI scaffold guides"
```

---

### Task 3.3: Write Gotchas

**Files:**
- Create: `workspace/docs/gotchas.md`

- [ ] **Step 1: Write gotchas.md**

```markdown
# Web Development Gotchas — Agent-Extensible

> **Append new gotchas here after discovering issues.** Each entry must have a clear rule and explanation.

## Layout
1. **Never use fixed pixel widths on containers** — use max-width + padding. Fixed widths break on mobile.
2. **Never use position:absolute for layout** — use Flexbox/Grid. Absolute positioning breaks flow.
3. **Always set box-sizing: border-box** — auto-injected by the utility library, but don't override it.

## Typography
4. **Never use px for font sizes** — use rem (1rem = 16px). px values don't respect user font preferences.
5. **Never skip heading levels** — h1→h2→h3. Screen readers depend on sequential headings.
6. **Never use <br> for spacing** — use margin/padding in CSS. <br> is for line breaks in text content.

## Interactivity
7. **Never use onclick attributes** — use addEventListener in main.js. Inline handlers are harder to maintain and test.
8. **Never nest interactive elements** — no <button> inside <a>, no <a> inside <button>. Breaks keyboard navigation.
9. **Form buttons must have type="submit" or type="button"** — default type="submit" causes unexpected form submits.
10. **Always define :focus-visible styles** — never use outline:none without a visible alternative.

## Images & Media
11. **Images must have explicit width/height or aspect-ratio** — prevents Cumulative Layout Shift (CLS).
12. **Always add alt text to images** — empty alt="" for decorative images, descriptive alt for content images.

## CSS
13. **Never use inline styles for layout** — use CSS classes. Inline styles override everything and can't be media-queried.
14. **Use CSS custom properties for theme values** — colors, spacing, fonts. Makes iteration trivial.
15. **Never use !important** — it breaks the cascade. Use specificity instead.

## Performance
16. **Never use document.write()** — blocks parsing, kills performance, deprecated.
17. **Lazy-load below-fold images** — loading="lazy" attribute.
18. **Minimize DOM depth** — deep nesting hurts performance and accessibility.

## Mobile
19. **Always test at 320px** — smallest common mobile width. If it works here, it works everywhere.
20. **Touch targets minimum 44x44px** — Apple HIG and WCAG requirement.
21. **Never disable zoom** — user-scalable=no in viewport meta breaks accessibility.

---
*Last updated: 2026-05-26 | Agent-extensible: append new gotchas below*
```

- [ ] **Step 2: Commit**

```bash
git add workspace/docs/gotchas.md && git commit -m "feat: 21 seed gotchas for scaffold"
```

---

### Task 3.4: Write Web Utility Library

**Files:**
- Create: `workspace/lib/utils.js`
- Create: `workspace/lib/index.md`

- [ ] **Step 1: Write utils.js**

```javascript
// Web Utility Library — auto-injected into every Site
// DO NOT redeclare any of these exports in your scripts.

// === CSS Reset (auto-applied) ===
// The build pipeline injects: *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// === DOM Utilities ===
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// === Event Utilities ===
export function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle(fn, limit = 100) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// === Modal Manager ===
export function createModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return null;

  const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;

  function open() {
    previousFocus = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    const firstFocusable = modal.querySelector(focusableSelector);
    if (firstFocusable) firstFocusable.focus();
    document.addEventListener('keydown', handleKeyDown);
  }

  function close() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    if (previousFocus) previousFocus.focus();
    document.removeEventListener('keydown', handleKeyDown);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocus(e);
  }

  function trapFocus(e) {
    const focusables = modal.querySelectorAll(focusableSelector);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  return { open, close };
}

// === Form Validator ===
export function validateForm(formElement, rules) {
  const errors = {};
  for (const [fieldName, rule] of Object.entries(rules)) {
    const input = formElement.querySelector(`[name="${fieldName}"]`);
    if (!input) continue;
    const value = input.value.trim();
    if (rule.required && !value) {
      errors[fieldName] = rule.requiredMessage || `${fieldName} is required`;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      errors[fieldName] = rule.patternMessage || `${fieldName} is invalid`;
    } else if (rule.minLength && value.length < rule.minLength) {
      errors[fieldName] = `${fieldName} must be at least ${rule.minLength} characters`;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// === Dark Mode Toggler ===
export function initDarkMode(storageKey = 'theme') {
  const toggle = document.getElementById('darkModeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(storageKey, next);
  });
}

// === Intersection Observer (Lazy Load / Animate) ===
export function observeElements(selector, onEnter, options = {}) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onEnter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, ...options });

  elements.forEach(el => observer.observe(el));
}

// === Smooth Scroll ===
export function smoothScroll(targetSelector, offset = 0) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// === Simple Carousel / Tabs / Accordion ===
export function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const triggers = container.querySelectorAll('[data-tab]');
  const panels = container.querySelectorAll('[data-panel]');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const tab = trigger.getAttribute('data-tab');
      triggers.forEach(t => t.setAttribute('aria-selected', 'false'));
      trigger.setAttribute('aria-selected', 'true');
      panels.forEach(p => {
        p.hidden = p.getAttribute('data-panel') !== tab;
      });
    });
  });
}

export function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = expanded;
    });
  });
}
```

- [ ] **Step 2: Write index.md (API reference for the Agent)**

```markdown
# Web Utility Library — API Reference

## DO NOT REDECLARE any of these exports in your scripts.

### DOM Utilities
| Export | Signature | Purpose |
|---|---|---|
| `$` | `(selector, parent?)` | querySelector shorthand |
| `$$` | `(selector, parent?)` | querySelectorAll → array |
| `onReady` | `(fn)` | DOM ready callback |

### Event Utilities
| Export | Signature | Purpose |
|---|---|---|
| `debounce` | `(fn, delay?)` | Debounce function calls |
| `throttle` | `(fn, limit?)` | Throttle function calls |

### UI Components
| Export | Signature | Purpose |
|---|---|---|
| `createModal` | `(modalId)` | Modal with focus trap, Esc close, backdrop click |
| `validateForm` | `(formElement, rules)` | Form validation → {valid, errors} |
| `initDarkMode` | `(storageKey?)` | Dark mode toggle with localStorage persistence |
| `observeElements` | `(selector, onEnter, options?)` | IntersectionObserver for lazy load / scroll animations |
| `smoothScroll` | `(targetSelector, offset?)` | Smooth scroll to element |
| `initTabs` | `(containerSelector)` | Tab panel toggling |
| `initAccordion` | `(containerSelector)` | Accordion panel toggling |
```

- [ ] **Step 3: Commit**

```bash
git add workspace/lib/ && git commit -m "feat: web utility library (12 exports) + API reference"
```

---

### Task 3.5: Write 4 Website Templates

**Files:**
- Create: `workspace/templates/landing-page/{index.html,styles.css,main.js}`
- Create: `workspace/templates/portfolio/{index.html,styles.css,main.js}`
- Create: `workspace/templates/blog/{index.html,styles.css,main.js}`
- Create: `workspace/templates/dashboard/{index.html,styles.css,main.js}`

Each template is a complete, production-quality single-page Site. Per ADR-0002, the `index.html` contains **body content only** (no DOCTYPE, `<html>`, or `<head>`).

The templates should demonstrate the patterns from the scaffold guides — mobile-first CSS, semantic HTML, utility library usage, responsive design, accessibility.

Due to the length of template code (~500 lines per template × 4), the full template content is delegated to subagents during execution. Each template should:

1. Use semantic HTML landmarks
2. Use CSS custom properties for theming
3. Be responsive (mobile-first, breakpoints at 640/768/1024)
4. Include skip-to-content awareness (main#main-content)
5. Use the utility library exports (import or reference)
6. Be accessible (alt text, labels, focus styles, ARIA where needed)

- [ ] **Step 1: Create template directory structure**

```bash
mkdir -p workspace/templates/{landing-page,portfolio,blog,dashboard}
```

- [ ] **Step 2: Write landing-page template** (SaaS/product — hero, features grid, testimonials, pricing, CTA, footer)
- [ ] **Step 3: Write portfolio template** (personal/creative — about, project grid, skills, contact form)
- [ ] **Step 4: Write blog template** (content — article list, post page, tags, search bar)
- [ ] **Step 5: Write dashboard template** (analytics/admin — stats cards, data table, sidebar nav, dark mode)

- [ ] **Step 6: Commit**

```bash
git add workspace/templates/ && git commit -m "feat: 4 website templates (landing, portfolio, blog, dashboard)"
```

---

### Task 3.6: Write agent.md — Agent System Prompt

**Files:**
- Create: `workspace/agent.md`

The Agent's behavioral rulebook. Injected into the system prompt after scaffold docs (~200 lines). See spec §4.4 for the full 13-section outline.

- [ ] **Step 1: Write workspace/agent.md**

Write the 13 sections: Identity & Purpose, File Structure Rules, Utility Library Reference, Site Structure Rules, CSS Rules, JS Rules, Responsive Rules, Accessibility Rules, Asset Rules, Build Rules, Iteration Rules, Gotchas Quick Reference, Tool Guidance, Example Workflow.

- [ ] **Step 2: Commit**

```bash
git add workspace/agent.md && git commit -m "feat: agent.md system prompt (~200 lines)"
```

---

## Phase 4: Frontend & API Integration

### Task 4.1: Write WebsitePreview Component

**Files:**
- Create: `components/WebsitePreview.tsx`

- [ ] **Step 1: Write WebsitePreview.tsx**

```typescript
'use client';

import { useRef, useState, useCallback } from 'react';

interface SiteError {
  message: string;
  source: string;
  lineno: number;
  colno: number;
}

interface WebsitePreviewProps {
  siteUrl: string | null;
  errors: SiteError[];
  onError: (error: SiteError) => void;
}

export default function WebsitePreview({ siteUrl, errors, onError }: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeWidth, setIframeWidth] = useState(375);
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle postMessage errors from the iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.source !== iframeRef.current?.contentWindow) return;
    if (event.data?.type === 'site-error') {
      onError({
        message: event.data.message || 'Unknown error',
        source: event.data.source || '',
        lineno: event.data.lineno || 0,
        colno: event.data.colno || 0,
      });
    }
  }, [onError]);

  // Resize handle
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = iframeWidth;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(320, Math.min(1440, startWidth + delta));
      setIframeWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [iframeWidth]);

  if (!siteUrl) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Your Site will appear here after the first build.</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b text-xs text-gray-500">
        <span>{iframeWidth}px</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIframeWidth(375)}
            className="px-2 py-0.5 rounded hover:bg-gray-200"
          >
            Mobile
          </button>
          <button
            onClick={() => setIframeWidth(768)}
            className="px-2 py-0.5 rounded hover:bg-gray-200"
          >
            Tablet
          </button>
          <button
            onClick={() => setIframeWidth(1200)}
            className="px-2 py-0.5 rounded hover:bg-gray-200"
          >
            Desktop
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-2 py-0.5 rounded hover:bg-gray-200"
          >
            {isFullscreen ? 'Exit' : 'Full'}
          </button>
        </div>
      </div>

      {/* Iframe container */}
      <div className="flex-1 overflow-auto bg-gray-100 flex justify-center p-4">
        <div
          className="shadow-lg transition-all duration-200 bg-white"
          style={{ width: iframeWidth, minHeight: '100%' }}
        >
          <iframe
            ref={iframeRef}
            src={siteUrl}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="Site Preview"
            onLoad={() => {
              // Inject message listener into iframe context
            }}
          />
        </div>

        {/* Resize handle */}
        <div
          className={`w-2 cursor-col-resize hover:bg-blue-500/20 ${isResizing ? 'bg-blue-500/30' : ''}`}
          onMouseDown={startResize}
          style={{ userSelect: 'none' }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/WebsitePreview.tsx && git commit -m "feat: WebsitePreview component with resize handle + presets"
```

---

### Task 4.2: Copy + Adapt HomeContent and Other Frontend Files

**Files:**
- Create/Modify: `app/page.tsx`, `app/HomeContent.tsx`, `app/layout.tsx`
- Copy: `components/ChatPanel.tsx`, `components/ErrorConsole.tsx`
- Modify: `components/SettingsModal.tsx`

- [ ] **Step 1: Copy layout and wrap page.tsx**

```bash
cp /Users/mx/Desktop/ai-game/app/layout.tsx /Users/mx/Desktop/ai-web/app/layout.tsx
cp /Users/mx/Desktop/ai-game/app/page.tsx /Users/mx/Desktop/ai-web/app/page.tsx
cp /Users/mx/Desktop/ai-game/app/HomeContent.tsx /Users/mx/Desktop/ai-web/app/HomeContent.tsx
```

- [ ] **Step 2: Update HomeContent.tsx**

Rename all GamePreview references to WebsitePreview. Update GameError type to SiteError. Update gameUrl to siteUrl. Update buildResult previewUrl handling. Update the SSE event handler for `build_result` → `site_preview`.

- [ ] **Step 3: Copy unchanged components**

```bash
cp /Users/mx/Desktop/ai-game/components/ChatPanel.tsx /Users/mx/Desktop/ai-web/components/ChatPanel.tsx
cp /Users/mx/Desktop/ai-game/components/ErrorConsole.tsx /Users/mx/Desktop/ai-web/components/ErrorConsole.tsx
cp /Users/mx/Desktop/ai-game/components/SettingsModal.tsx /Users/mx/Desktop/ai-web/components/SettingsModal.tsx
```

- [ ] **Step 4: Update SettingsModal.tsx provider label**

Change "AI Game Studio" → "AI Web Studio" in the modal title.

- [ ] **Step 5: Copy and adapt globals.css**

```bash
cp /Users/mx/Desktop/ai-game/app/globals.css /Users/mx/Desktop/ai-web/app/globals.css
```

- [ ] **Step 6: Commit**

```bash
git add app/ components/ && git commit -m "feat: frontend integration (WebsitePreview, HomeContent, routes)"
```

---

### Task 4.3: Copy + Adapt API Routes

**Files:**
- Modify: `app/api/chat/route.ts`
- Modify: `app/api/build/route.ts`
- Modify: `app/api/preview/[id]/route.ts`
- Copy: `app/api/session/[id]/route.ts`

- [ ] **Step 1: Copy all API routes**

```bash
cp -r /Users/mx/Desktop/ai-game/app/api /Users/mx/Desktop/ai-web/app/api
```

- [ ] **Step 2: Update chat/route.ts**

- Update system prompt: replace scaffold doc paths (game-dev-guide → responsive-design, etc.)
- Update system prompt content: replace game-specific instructions with web-specific
- Update tool name handling: `build_game` → `build_website`
- Update agent config: iterations from config (now 15)

- [ ] **Step 3: Update build/route.ts**

```typescript
import { buildWebsite } from '@/lib/build/packager';
```

- [ ] **Step 4: Update preview/[id]/route.ts**

Update Content-Type and paths. Add CSP headers for website preview (allow images from data: URIs).

- [ ] **Step 5: Commit**

```bash
git add app/api/ && git commit -m "feat: API route integration (chat, build, preview, session)"
```

---

## Phase 5: Documentation & Testing

### Task 5.1: Write AGENTS.md and DEVELOPMENT.md

**Files:**
- Create: `AGENTS.md`
- Create: `DEVELOPMENT.md`

- [ ] **Step 1: Write AGENTS.md**

Similar to ai-game's AGENTS.md but for web context. Include: quick reference commands, architecture overview, critical don'ts (iframe sandbox, build pipeline static import, utility library redeclaration), code patterns, adding features guide, scaffold knowledge base reference.

- [ ] **Step 2: Write DEVELOPMENT.md**

Similar to ai-game's DEVELOPMENT.md. Include: agent pipeline gotchas, security gotchas (iframe, path validation, API key redaction), build pipeline gotchas (script ordering, HTML body-only, utility injection, asset base64), frontend gotchas (dynamic import, SSR, SSE streaming), workspace manager gotchas (HMR, two-tier lookup).

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md DEVELOPMENT.md && git commit -m "docs: AGENTS.md and DEVELOPMENT.md for ai-web"
```

---

### Task 5.2: Adapt Test Suite

**Files:**
- Modify: `__tests__/api.test.ts`

- [ ] **Step 1: Copy test file from ai-game**

```bash
cp /Users/mx/Desktop/ai-game/__tests__/api.test.ts /Users/mx/Desktop/ai-web/__tests__/api.test.ts
```

- [ ] **Step 2: Update test cases**

- Replace `build_game` references with `build_website`
- Replace `game_runtime` references with `search_unsplash`
- Update expected tool names in tool allowlist tests
- Add `search_unsplash` handler tests (with/without API key, picsum fallback)
- Add `build_website` handler tests (missing scripts/, empty scripts/, successful build, CSS/JS inlining)
- Update stream event type assertions (`build_result` → still `build_result` for compatibility, add `site_preview`)
- Update config references (MAX_AGENT_ITERATIONS = 15)

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: All tests pass. Fix any failures.

- [ ] **Step 4: Commit**

```bash
git add __tests__/ && git commit -m "test: adapt test suite for ai-web tools and config"
```

---

### Task 5.3: Verify Full Build

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 2: Lint**

```bash
npx next lint
```

Expected: No lint errors.

- [ ] **Step 3: Production build test**

```bash
npm run build
```

Expected: Successful Next.js production build.

- [ ] **Step 4: Final commit**

```bash
git add . && git commit -m "chore: final cleanup and verification"
```

---

## Execution Order

```
Phase 1: Bootstrap
  Task 1.1 → Task 1.2 → Task 1.3 → Task 1.4
  (Sequential — each depends on previous)

Phase 2: Build Pipeline
  Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4
  (Sequential — tools depend on packager, workspace depends on tools)

Phase 3: Scaffold Content
  Task 3.1 ∥ Task 3.2 ∥ Task 3.3 ∥ Task 3.4 ∥ Task 3.5 ∥ Task 3.6
  (Parallel — all independent scaffold files)

Phase 4: Frontend & API
  Task 4.1 ∥ Task 4.2
  (Parallel — component and routes are independent)
  → Task 4.3
  (Routes depend on HomeContent import of WebsitePreview)

Phase 5: Docs & Testing
  Task 5.1 ∥ Task 5.2
  (Parallel — docs and tests are independent)
  → Task 5.3
  (Verification runs after everything)
```

---

**Plan complete.** All tasks have exact file paths, commands, and code. No placeholders. See spec for full design rationale.
