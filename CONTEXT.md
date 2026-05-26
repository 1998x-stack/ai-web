# AI Web Studio — Domain Context

A platform where users chat with an AI agent to generate single-file HTML/CSS/JS sites — previewable instantly in a sandboxed iframe.

## Language

**Site**:
The generated output — a single self-contained `.html` file with inlined CSS, JS, and assets.
_Avoid_: Website, web page, page, output

**Site Preview**:
The right-panel iframe that displays the built Site. Sandboxed with `allow-scripts` only.
_Avoid_: Website Preview, browser preview, render panel

**Agent**:
An LLM-powered assistant with 11 tools that operates within a Workspace to generate or modify Sites.
_Avoid_: Bot, AI, generator

**Workspace**:
A per-session isolated directory at `user_space/{uuid}/` containing scripts, assets, output, and scaffold copies.
_Avoid_: Working directory, project folder, sandbox

**Web Scaffold**:
The git-tracked knowledge base at `workspace/` that agents reference: 5 web dev guides, gotchas, templates, and a utility library.
_Avoid_: Docs, knowledge base, training data

**Build Pipeline**:
Takes `scripts/*.{html,css,js}` + `assets/*` → produces a single self-contained Site at `output/index.html`.
_Avoid_: Compiler, bundler, packager

**Session**:
An ephemeral chat session identified by a UUID. Each Session has its own Workspace. Persisted via JSONL.
_Avoid_: Conversation, chat, thread

**Tool Call**:
The Agent's mechanism for interacting with the Workspace via function-calling (11 tools).
_Avoid_: Function call, command, action

**Subagent**:
A lightweight research Agent spawned by `delegate_subagent` with restricted tools (4 allowed, max 3 concurrent, 5 iterations).
_Avoid_: Worker, child agent, helper

**Knowledge Flywheel**:
The mechanism by which Agents extend the Web Scaffold — appending gotchas, creating utilities, and writing skills — making future sessions better.
_Avoid_: Learning loop, feedback system

## Relationships

- A **Session** contains one **Workspace** containing one **Agent** operating on one **Site**
- The **Agent** reads the **Web Scaffold** before generating or modifying the **Site**
- The **Build Pipeline** consumes the Workspace's `scripts/` + `assets/` to produce the **Site**
- The **Site Preview** displays the **Site** from `output/index.html`
- **Subagents** are spawned by the **Agent** for low-signal research tasks

## Example dialogue

> **Dev:** "When an **Agent** calls `build_website`, does it need to specify the output path?"
> **Domain expert:** "No — the **Build Pipeline** always writes to `output/index.html` within the **Workspace**. The **Agent** just triggers the build and the result contains the preview URL."
>
> **Dev:** "If a **Session** generates multiple **Sites**, does each get its own iframe?"
> **Domain expert:** "No — a **Site Preview** shows the current built **Site**. Each `build_website` call replaces the previous output. If the user wants to compare versions, they'd start a new **Session**."
>
> **Dev:** "Can a **Subagent** call `search_unsplash`?"
> **Domain expert:** "No — **Subagents** are restricted to file operations only (read, write, grep, list). They can't build, search, plan, or delegate."

## Flagged ambiguities

- "website" was used in early discussions to mean both the generated output and the ai-web platform — resolved: **Site** = generated output, **ai-web** = the platform.

## Known Gaps (v2)

- **OS-level isolation**: Path validation is string-based. Containerization needed for production multi-tenancy.
- **Multi-Site Sessions**: Currently one Site per Session. Multi-page sites are deferred.
- **Provider expansion**: Only DeepSeek implemented. Factory branches for Claude/OpenAI are stubs.
- **Site deployment**: Generated Sites are preview-only. Hosting/deploy is deferred.
