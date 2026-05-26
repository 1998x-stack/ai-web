# Single-Page Sites for v1

ai-web v1 generates single-page Sites — one HTML file with inlined CSS/JS. "Full web application" in v1 means the Site has full app-like interactivity (forms, modals, data display, responsive layout) but stays within a single page. Multi-view applications with real navigation between pages are deferred to v2.

**Why**: Single-file output keeps the Build Pipeline simple (no multi-file routing, no asset management across pages). It mirrors ai-game's proven single-file approach. Adding multi-page support increases pipeline complexity ~3x — the packager would need to handle cross-page asset sharing, relative path resolution, and multi-file preview serving.

**Trade-off**: Some website types (dashboards with drill-down views, multi-step wizards, checkout flows) are impossible in v1. Users who need these will need to wait for v2 or use section-switching JavaScript within the single page.

**Considered alternative**: Allowing multiple HTML files with a simple router — rejected because it would require a development server for preview, losing the "zero-dependency, instantly viewable" property that makes ai-game's approach work.
