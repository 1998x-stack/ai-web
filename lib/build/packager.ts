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
/* === CSS Reset (auto-injected) === */
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


