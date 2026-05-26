# Packager Owns the Document Shell

The Build Pipeline (packager) owns the HTML document shell — DOCTYPE, `<html>`, `<head>`, viewport meta, skip-to-content link, error handler, asset map, and module script wrappers. The Agent writes only body content (`<header>`, `<main>`, `<footer>`) in `scripts/index.html`, CSS in `styles.css`, and JS in `main.js`.

**Why**: Ensures structural invariants are always correct — the Agent can't forget the viewport meta, skip a11y features, or mess up script loading order. Matches ai-game's pattern where the packager owns canvas + error handler + asset map and the Agent only writes game logic.

**Trade-off**: Less flexibility for the Agent (can't customize `<head>` beyond what the packager injects). This is acceptable for v1 since the packager injects all common meta tags (charset, viewport, title, description, OG tags) based on extraction from the Agent's body content.

**Considered alternative**: Letting the Agent write complete HTML — rejected because it creates too many failure modes (forgotten viewport meta, missing skip-link, broken script ordering).
