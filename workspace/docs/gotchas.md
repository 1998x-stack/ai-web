# Web Development Gotchas — Agent-Extensible

> **Append new gotchas here after discovering issues.** Each entry must have a clear rule and explanation.

## Layout
1. **Never use fixed pixel widths on containers** — use max-width + padding. Fixed widths break on mobile.
2. **Never use position:absolute for layout** — use Flexbox/Grid. Absolute positioning breaks flow.
3. **Always set box-sizing: border-box** — auto-injected by the utility library, but don't override it.

## Typography
4. **Never use px for font sizes** — use rem (1rem = 16px). px values don't respect user font preferences.
5. **Never skip heading levels** — h1→h2→h3. Screen readers depend on sequential headings.
6. **Never use &lt;br&gt; for spacing** — use margin/padding in CSS. &lt;br&gt; is for line breaks in text content.

## Interactivity
7. **Never use onclick attributes** — use addEventListener in main.js. Inline handlers are harder to maintain.
8. **Never nest interactive elements** — no &lt;button&gt; inside &lt;a&gt;, no &lt;a&gt; inside &lt;button&gt;. Breaks keyboard navigation.
9. **Form buttons must have type="submit" or type="button"** — default type="submit" causes unexpected form submits.
10. **Always define :focus-visible styles** — never use outline:none without a visible alternative.

## Images & Media
11. **Images must have explicit width/height or aspect-ratio** — prevents Cumulative Layout Shift (CLS).
12. **Always add alt text to images** — empty alt="" for decorative images, descriptive alt for content images.

## CSS
13. **Never use inline styles for layout** — use CSS classes. Inline styles override everything.
14. **Use CSS custom properties for theme values** — colors, spacing, fonts. Makes iteration trivial.
15. **Never use !important** — it breaks the cascade. Use specificity instead.

## Performance
16. **Never use document.write()** — blocks parsing, kills performance, deprecated.
17. **Lazy-load below-fold images** — loading="lazy" attribute.
18. **Minimize DOM depth** — deep nesting hurts performance and accessibility.

## Mobile
19. **Always test at 320px** — smallest common mobile width.
20. **Touch targets minimum 44x44px** — Apple HIG and WCAG requirement.
21. **Never disable zoom** — user-scalable=no breaks accessibility.

---
*Last updated: 2026-05-26 | Agent-extensible: append new gotchas below*
