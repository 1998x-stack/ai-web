import { createWorkspace, restoreWorkspace, getWorkspace } from '@/lib/workspace/manager';
import { createAgent } from '@/lib/agent/factory';
import type { AgentSession } from '@/lib/agent/types';
import { readScaffoldDocs, getGotchas } from '@/lib/scaffold/reader';
import { agentSessions, appendToJsonl, readJsonl, jsonlExists } from '@/lib/session-store';
import { CONFIG } from '@/lib/config';
import { gitCommit } from '@/lib/git';
import fs from 'fs/promises';
import path from 'path';

const UUID_RE = CONFIG.validation.uuidPattern;
const MAX_MESSAGE_LENGTH = CONFIG.agent.maxMessageLength;
const ALLOWED_PROVIDERS = CONFIG.providers.allowed;

function parseTodoMd(content: string): Array<{
  task: string;
  status: 'pending' | 'done';
  verify?: string;
}> {
  const tasks: Array<{ task: string; status: 'pending' | 'done'; verify?: string }> = [];
  for (const line of content.split('\n')) {
    const doneMatch = line.match(/^-\s*\[x\]\s+(.+?)(?:\s+—\s+verify:\s+(.+))?$/i);
    if (doneMatch) {
      tasks.push({
        task: doneMatch[1].trim(),
        status: 'done',
        verify: doneMatch[2]?.trim() || undefined,
      });
      continue;
    }
    const pendingMatch = line.match(/^-\s*\[\s*\]\s+(.+?)(?:\s+—\s+verify:\s+(.+))?$/);
    if (pendingMatch) {
      tasks.push({
        task: pendingMatch[1].trim(),
        status: 'pending',
        verify: pendingMatch[2]?.trim() || undefined,
      });
    }
  }
  return tasks;
}

interface ChatRequest {
  sessionId: string;
  message: string;
  stream?: boolean;
  config: {
    provider: string;
    apiKey: string;
    model: string;
    baseUrl: string;
    githubToken?: string;
  };
}

async function handleStreamingResponse(
  agent: AgentSession,
  message: string,
  sessionId: string,
  signal?: AbortSignal,
): Promise<Response> {
  const encoder = new TextEncoder();

  const trySendTodoUpdate = async () => {
    const workspace = getWorkspace(sessionId);
    if (!workspace) return;
    const todoPath = path.join(workspace.workspacePath, 'todo.md');
    try {
      await fs.access(todoPath);
      const content = await fs.readFile(todoPath, 'utf-8');
      const tasks = parseTodoMd(content);
      if (tasks.length > 0) {
        const done = tasks.filter((t) => t.status === 'done').length;
        const pending = tasks.filter((t) => t.status === 'pending').length;
        const next = tasks.find((t) => t.status === 'pending');
        return {
          type: 'todo_update' as const,
          tasks,
          done,
          pending,
          next: next?.task,
        };
      }
    } catch {
      // todo.md not found or unreadable — skip
    }
    return null;
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };

      try {
        await agent.sendMessageStream(message, async (event) => {
          if (event.type === 'tool_result' && event.name === 'build_website') {
            const workspace = getWorkspace(sessionId);
            if (workspace) {
              const outputPath = path.join(
                workspace.workspacePath,
                'output',
                'index.html',
              );
              fs.access(outputPath)
                .then(() => {
                  send({
                    type: 'build_result',
                    previewUrl: `/api/preview/${sessionId}`,
                    success: true,
                  });
                  // Auto-commit successful build for development history
                  gitCommit(workspace.workspacePath, 'Build: site update');
                })
                .catch(() => {
                  send({
                    type: 'build_result',
                    previewUrl: `/api/preview/${sessionId}`,
                    success: false,
                  });
                });
            }
          }

          // Handle github_push results
          if (event.type === 'tool_result' && event.name === 'github_push') {
            send(event);
            const resultMatch = event.result.match(/GITHUB PUSH SUCCESS/);
            if (resultMatch) {
              const repoMatch = event.result.match(/Repository: (https:\/\/github\.com\/[^\s]+)/);
              const pagesMatch = event.result.match(/GitHub Pages: (https:\/\/[^\s]+)/);
              send({
                type: 'github_push_result',
                success: true,
                repoUrl: repoMatch?.[1],
                pagesUrl: pagesMatch?.[1],
              });
            } else {
              send({
                type: 'github_push_result',
                success: false,
                error: event.result,
              });
            }
            return;
          }

          // Emit todo_update after write_todo or edit_file on todo.md
          if (
            event.type === 'tool_result' &&
            (event.name === 'write_todo' ||
              (event.name === 'edit_file' &&
                typeof event.result === 'string' &&
                event.result.includes('todo.md')))
          ) {
            send(event);
            const todoEvent = await trySendTodoUpdate();
            if (todoEvent) send(todoEvent);
            return;
          }

          send(event);
        });
        await appendToJsonl(sessionId, agent.getHistory());
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(request: Request) {
  let config: ChatRequest['config'] | undefined;
  try {
    const body: ChatRequest = await request.json();
    config = body.config;
    const { sessionId, message } = body;

    if (!sessionId || !message || !config?.apiKey) {
      return Response.json(
        {
          error:
            'Missing required fields: sessionId, message, and config.apiKey are required',
        },
        { status: 400 },
      );
    }

    // Validate sessionId format — prevent path traversal via sessionId injection
    if (!UUID_RE.test(sessionId)) {
      return Response.json({ error: 'Invalid session ID format' }, { status: 400 });
    }

    // Limit message size to prevent memory / API DoS
    if (message.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` },
        { status: 400 },
      );
    }

    // Validate provider at runtime
    if (!config?.provider || !ALLOWED_PROVIDERS.has(config.provider.toLowerCase())) {
      const msg = config?.provider
        ? `Unsupported provider: "${config.provider}"`
        : 'Missing required field: config.provider';
      return Response.json({ error: msg }, { status: 400 });
    }

    let agent = agentSessions.get(sessionId);

    if (!agent) {
      const isRestoring = jsonlExists(sessionId);
      const workspace = isRestoring
        ? await restoreWorkspace(sessionId)
        : await createWorkspace(sessionId);

      const docs = await readScaffoldDocs();
      const gotchas = await getGotchas();

      const parts: string[] = [
        'You are an expert web developer. You create single-file Sites using HTML, CSS, and JavaScript — all inlined into one output file.',
        'Write semantic HTML with progressive enhancement. Use modern CSS (Grid, Flexbox, custom properties, container queries). Use vanilla JS with ES modules pattern.',
        'Read the scaffold docs in workspace/docs/ before starting any new Site — they contain patterns and gotchas that will save you time:',
        '- responsive-design.md: fluid layouts, media queries, typography scaling, touch targets',
        '- design-patterns.md: component architecture, state management, event delegation',
        '- accessibility.md: ARIA, keyboard nav, screen reader support, color contrast',
        '- seo-performance.md: meta tags, semantic HTML, lazy loading, Core Web Vitals',
        '- interactive-ui.md: animations, transitions, micro-interactions, gesture support',
        '- gotchas.md: known pitfalls and solutions collected from previous sessions',
        'Files in assets/ are embedded as base64 at build time. Access them via window.__ASSETS__[filename].',
        'The utility library at lib/utils.js is pre-loaded — read it to discover available helpers before writing code.',
        'Available templates in workspace/templates/ provide starting points for common site types.',
      ];

      if (gotchas) {
        parts.push('\n\n--- Known Gotchas ---\n' + gotchas);
      }

      if (docs.length > 0) {
        parts.push('\n\n--- Web Development Guide ---');
        for (const doc of docs) {
          parts.push('\n\n### ' + doc.name + '\n' + doc.content);
        }
      }

      parts.push(
        '\n\nWhen the user asks for a Site, start by calling write_todo to create a plan in todo.md with a checklist. Then call load_skills to discover relevant skills. For matching skills, read the full skill file. Then generate the code in scripts/ using the patterns from the scaffold.',
        '\n\nCRITICAL: scripts/index.html is the main entry point. Write body-only HTML (no <html>, <head>, or <body> tags — the build system provides the document shell).',
        'Separate CSS into scripts/styles.css and JS into scripts/main.js. The build system concatenates them in priority order: index.html → styles.css → main.js.',
        'The utility library at lib/utils.js is pre-loaded as an ES module. Read it first to use available helpers. Do NOT redeclare classes or functions from utils.js.',
        '\nYou MAY append new exports/functions to lib/utils.js to extend the library. You MAY also append new gotchas to the END of workspace/docs/gotchas.md when you encounter and solve problems (follow the format at top of the file). After adding functions or gotchas, update workspace/lib/index.md to document them.',
        '\nAfter writing code, always call build_website. If it reports errors, read the output, fix the code, and rebuild. Use set_error only for unrecoverable issues. After building, briefly describe the Site features. Keep responses concise.',
      );

      // Git: every successful build is auto-committed — use git_log/git_diff/git_status to inspect history
      parts.push(
        '\n\nEvery successful build is automatically committed to a git repository. Use git_log to see commit history, git_diff to see changes, and git_status to check the working tree. This helps you understand what changed between iterations.',
      );

      // GitHub: only mention publishing if a token is available
      if (config.githubToken) {
        parts.push(
          '\n\nGitHub publishing is available via github_push. When the user asks to share or publish their Site, call github_push after a successful build. This creates a repository, pushes the Site, enables GitHub Pages, and returns a live URL. Do NOT call github_push unless explicitly asked.',
        );
      }

      // Session restoration: inject workspace state summary so the agent can pick up where it left off
      if (isRestoring) {
        try {
          const { execSync } = await import('child_process');
          const gitLog = (() => {
            try {
              return execSync('git log --oneline -5', {
                cwd: workspace.workspacePath,
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 5000,
              }).trim() || '(no commits)';
            } catch {
              return '(git unavailable)';
            }
          })();

          const hasTodo = await fs
            .access(path.join(workspace.workspacePath, 'todo.md'))
            .then(() => true)
            .catch(() => false);

          const hasSiteHtml = await fs
            .access(path.join(workspace.workspacePath, 'scripts', 'index.html'))
            .then(() => true)
            .catch(() => false);

          const hasBuild = await fs
            .access(path.join(workspace.workspacePath, 'output', 'index.html'))
            .then(() => true)
            .catch(() => false);

          const summaryLines: string[] = [
            '\n\n=== Session Restoration — Current Workspace State ===',
            'You are resuming an existing Site development session. Before making changes, orient yourself:',
            hasSiteHtml ? '- A Site exists at scripts/index.html — read it first to understand the current state.' : '- No scripts/index.html found — start fresh.',
            hasBuild ? '- A build exists at output/index.html — the Site was successfully built before.' : '',
            hasTodo ? '- A todo.md exists with remaining tasks — read it to see what was planned.' : '',
            `- Recent git history:\n${gitLog}`,
            '\nIMPORTANT: Start by reading scripts/index.html to understand the current Site code. Then read workspace/docs/gotchas.md. Do NOT restart from scratch or call write_todo to create a new plan unless the user explicitly asks for a new Site.',
          ];

          parts.push(summaryLines.filter(Boolean).join('\n'));
        } catch {
          // If state reading fails, proceed without summary
        }
      }

      let systemPrompt = parts.join('');

      const MAX_PROMPT_LENGTH = CONFIG.agent.maxPromptLength;
      if (systemPrompt.length > MAX_PROMPT_LENGTH) {
        const baseInstructions = parts.slice(0, 5).join('\n');
        const finalInstructions = parts.slice(-5).join('\n');
        const gotchaSection = gotchas
          ? '\n\n--- Known Gotchas ---\n' + gotchas
          : '';
        systemPrompt =
          baseInstructions +
          gotchaSection +
          '\n\n--- Final Instructions ---\n' +
          finalInstructions +
          '\n\n[Web development guide truncated for length — read workspace/docs/ for full content if needed.]';
      }

      const agentMdPath = path.join(process.cwd(), 'workspace', 'agent.md');
      try {
        const agentMd = await fs.readFile(agentMdPath, 'utf-8');
        systemPrompt += '\n\n' + agentMd;
      } catch {
        // agent.md not found — continue with existing prompt
      }

      agent = createAgent(
        {
          provider: config.provider.toLowerCase() as 'deepseek' | 'openai' | 'claude',
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl,
          githubToken: config.githubToken,
        },
        systemPrompt,
        workspace.workspacePath,
      );

      agentSessions.set(sessionId, agent);

      if (jsonlExists(sessionId)) {
        const history = await readJsonl(sessionId);
        agent.loadHistory(history);
      }
    }

    if (body.stream) {
      return handleStreamingResponse(agent, message, sessionId, request.signal);
    }

    const response = await agent.sendMessage(message, request.signal);

    const hasBuildSite = response.toolCalls.some(
      (tc) => tc.name === 'build_website',
    );
    let buildResult: { previewUrl: string; success: boolean } | undefined;

    if (hasBuildSite) {
      const workspace = getWorkspace(sessionId);
      if (workspace) {
        const outputPath = path.join(
          workspace.workspacePath,
          'output',
          'index.html',
        );
        try {
          await fs.access(outputPath);
          buildResult = {
            previewUrl: `/api/preview/${sessionId}`,
            success: true,
          };
        } catch {
          // Output file missing — build didn't produce output; don't set buildResult
        }
      }
    }

    await appendToJsonl(sessionId, agent.getHistory());

    return Response.json({
      reply: response.message,
      toolCalls: response.toolCalls.map((tc) => ({
        name: tc.name,
        arguments: tc.arguments,
      })),
      buildResult,
    });
  } catch (error) {
    let message = error instanceof Error ? error.message : 'Internal server error';
    // Redact API key from error messages
    if (config?.apiKey && message.includes(config.apiKey)) {
      message = message.replace(config.apiKey, '[REDACTED]');
    }
    return Response.json(
      { error: message },
      { status: 500 },
    );
  }
}
