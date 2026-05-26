# Design Patterns

A reference for creating visually consistent, well-structured Sites. These patterns build on each other. Start with the foundation (typography, color, spacing) then compose them into components (cards, heroes, buttons) using hierarchy and depth.

---

## Table of Contents

1. [Typography Scale](#typography-scale)
2. [Color System](#color-system)
3. [Spacing Scale](#spacing-scale)
4. [Visual Hierarchy](#visual-hierarchy)
5. [Card Pattern](#card-pattern)
6. [Hero Section](#hero-section)
7. [CTA Buttons](#cta-buttons)
8. [Shadow and Depth](#shadow-and-depth)
9. [Whitespace Principles](#whitespace-principles)
10. [Anti-Patterns](#anti-patterns)

---

## Typography Scale

Use a modular scale of **1.25** (major third) for all heading sizes. This creates a consistent rhythmic progression from headings to body text.

### The Scale

```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px - body text */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px - h3 */
  --text-3xl: 2rem;      /* 32px - h2 */
  --text-4xl: 2.5rem;    /* 40px - h1 */
  --text-5xl: 3.25rem;   /* 52px - display */
}
```

### Heading Sizes

| Element | Size  | Weight      | Line Height |
|---------|-------|-------------|-------------|
| h1      | 2.5rem | 700 or 800 | 1.1         |
| h2      | 2rem   | 700         | 1.2         |
| h3      | 1.5rem | 600 or 700  | 1.3         |
| h4      | 1.25rem| 600         | 1.4         |
| p       | 1rem   | 400         | 1.6         |
| small   | 0.875rem| 400        | 1.5         |

### Default Typography CSS

```css
:root {
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
  --font-mono: "SF Mono", "Fira Code", "Fira Mono",
    "Roboto Mono", monospace;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-top: 0;
}

h1 { font-size: var(--text-4xl); line-height: 1.1; }
h2 { font-size: var(--text-3xl); margin-bottom: 0.75em; }
h3 { font-size: var(--text-2xl); margin-bottom: 0.5em; }
p  { margin-top: 0; margin-bottom: 1em; }
```

### Line Length

**Target 60-75 characters per line** for body text. This is the optimal range for readability.

```css
.content {
  max-width: 65ch;
}
```

- Use `ch` units for text containers, not `px` or `rem`.
- Wider containers are acceptable for tables, code blocks, and UI panels.

---

## Color System

Define all colors as CSS custom properties on `:root`. Never use raw hex values in components.

### Required Palette

```css
:root {
  /* Core brand colors */
  --color-primary: #2563eb;        /* Blue-600 - main actions, links */
  --color-primary-hover: #1d4ed8;  /* Blue-700 */
  --color-primary-light: #dbeafe;  /* Blue-100 - subtle backgrounds */
  --color-accent: #7c3aed;         /* Violet-600 - highlights, badges */
  --color-accent-hover: #6d28d9;   /* Violet-700 */

  /* Backgrounds */
  --color-bg: #f8fafc;            /* Slate-50 - page background */
  --color-bg-alt: #f1f5f9;        /* Slate-100 - card/section bg */
  --color-bg-inverse: #0f172a;    /* Slate-900 - dark sections */

  /* Text */
  --color-text: #1e293b;          /* Slate-800 - body text */
  --color-text-secondary: #64748b; /* Slate-500 - muted text */
  --color-text-inverse: #f8fafc;  /* Text on dark bg */
  --color-heading: #0f172a;       /* Slate-900 - headings */

  /* Borders and dividers */
  --color-border: #e2e8f0;        /* Slate-200 */
  --color-border-hover: #cbd5e1;  /* Slate-300 */

  /* Semantic */
  --color-success: #16a34a;       /* Green-600 */
  --color-warning: #d97706;       /* Amber-600 */
  --color-error: #dc2626;         /* Red-600 */
  --color-info: #2563eb;          /* Blue-600 */
}
```

### Agent Rules for Color

> **Agent rule:** Use CSS custom properties for all colors. Never use pure black (#000) or pure white (#fff).

> **Agent rule:** Never reference raw hex values like `#2563eb` in component CSS. Always use the semantic variable name like `var(--color-primary)`.

> **Agent rule:** Define dark mode overrides in a separate `[data-theme="dark"]` block. Do not mix light/dark values in single variable definitions.

### Using Colors

```css
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.button-primary:hover {
  background-color: var(--color-primary-hover);
}

.card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
}

.text-muted {
  color: var(--color-text-secondary);
}
```

### Semantic Color Usage

| Variable         | Where to Use                                |
|------------------|---------------------------------------------|
| `--color-primary` | Primary buttons, links, active states       |
| `--color-accent`  | Badges, tags, highlight borders            |
| `--color-bg`      | Page background, main container            |
| `--color-bg-alt`  | Cards, sidebars, secondary sections        |
| `--color-text`    | Body paragraphs, general content           |
| `--color-text-secondary` | Captions, metadata, help text     |
| `--color-heading` | All headings h1-h6                         |

### Dark Mode

```css
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-alt: #1e293b;
  --color-bg-inverse: #f8fafc;
  --color-text: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-inverse: #0f172a;
  --color-heading: #f8fafc;
  --color-border: #334155;
  --color-border-hover: #475569;
  --color-primary: #3b82f6;       /* Slightly lighter in dark mode */
  --color-primary-hover: #60a5fa;
}
```

---

## Spacing Scale

Use a **4px base spacing scale** for margins, padding, and gaps. This creates visual rhythm and ensures layout consistency.

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### Spacing Usage Guidelines

| Token      | Common Use                              |
|------------|-----------------------------------------|
| `--space-1` | Tiny gaps between icons and text       |
| `--space-2` | Padding in small badges, tight buttons |
| `--space-3` | Gap between label and input            |
| `--space-4` | Standard padding in cards, buttons     |
| `--space-6` | Section padding, card padding          |
| `--space-8` | Between major sections                 |
| `--space-12`| Hero section padding                   |
| `--space-16`| Page section separation                |
| `--space-24`| Large hero or showcase spacing         |

```css
/* Good - using the scale */
.card {
  padding: var(--space-6);
  gap: var(--space-4);
}

.section {
  padding: var(--space-16) 0;
}

.hero {
  padding: var(--space-24) 0;
}
```

### Stack (Vertical Rhythm)

```css
.stack > * + * {
  margin-top: var(--space-4);
}

.stack--compact > * + * {
  margin-top: var(--space-2);
}

.stack--loose > * + * {
  margin-top: var(--space-8);
}
```

---

## Visual Hierarchy

Four levers control visual hierarchy: **size**, **color**, **spacing**, and **contrast**. Use them intentionally to guide the user's eye.

### 1. Size

Larger elements draw attention first. Use size to establish importance.

```css
/* Primary heading - most important */
.hero__title {
  font-size: var(--text-4xl);
  font-weight: 800;
}

/* Section heading */
.section__title {
  font-size: var(--text-3xl);
  font-weight: 700;
}

/* Subheading */
.section__subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
}
```

### 2. Color

Bright or high-saturation colors attract attention. Use your primary color for interactive elements and key information.

```css
.cta-button {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.secondary-info {
  color: var(--color-text-secondary);
}
```

### 3. Spacing

Generous whitespace around an element signals its importance. Cramped elements feel less significant.

```css
/* Important section gets more space */
.hero {
  padding: var(--space-16) 0;
}

/* Less important section */
.footer-links {
  padding: var(--space-4) 0;
}
```

### 4. Contrast

Higher contrast draws the eye. Use font weight and background opacity to create contrast layers.

```css
/* High contrast - primary content */
.primary-content {
  color: var(--color-heading);
  font-weight: 600;
}

/* Medium contrast - body */
body {
  color: var(--color-text);
  font-weight: 400;
}

/* Low contrast - secondary */
.metadata {
  color: var(--color-text-secondary);
  font-weight: 400;
}
```

### Hierarchy Checklist

- [ ] Is the page's purpose clear from the first screen without reading?
- [ ] Do interactive elements (buttons, links) look interactive?
- [ ] Is there a clear difference between headings and body text?
- [ ] Are secondary features visually de-emphasized?

---

## Card Pattern

Cards group related content into a contained unit. They are the primary UI pattern for content previews, features, and dashboards.

### Card CSS

```css
.card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card__title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: var(--space-2);
}

.card__body {
  color: var(--color-text);
  font-size: var(--text-base);
  line-height: 1.6;
}

.card__footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
```

### Card HTML

```html
<article class="card">
  <h3 class="card__title">Getting Started</h3>
  <p class="card__body">
    Learn the basics of creating your first Site with our platform.
    This guide covers everything from setup to deployment.
  </p>
  <div class="card__footer">
    <a href="#" class="button">Read More</a>
  </div>
</article>
```

### Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  padding: 0;
}
```

### Card Variants

```css
/* Elevated card - more emphasis */
.card--elevated {
  box-shadow: var(--shadow-md);
  border-color: transparent;
}

/* Bordered card */
.card--bordered {
  border: 2px solid var(--color-primary);
  box-shadow: none;
}

/* Flat card - minimal emphasis */
.card--flat {
  box-shadow: none;
  border-color: transparent;
  background-color: transparent;
}
```

**Agent rule:** Use `<article>` for standalone cards, `<section>` for grouped cards, and `<div>` for decorative/presentational cards only.

---

## Hero Section

The hero is the first thing users see. It communicates the Site's purpose and provides a clear entry point.

### Hero CSS

```css
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-16) var(--space-6);
  background-color: var(--color-bg);
  min-height: 60vh;
  justify-content: center;
}

.hero__title {
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--color-heading);
  line-height: 1.1;
  max-width: 12ch;
  margin-bottom: var(--space-4);
}

.hero__subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  max-width: 60ch;
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

/* Hero with background image */
.hero--bg {
  position: relative;
  background-size: cover;
  background-position: center;
  color: var(--color-text-inverse);
}

.hero--bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6),
    rgba(0, 0, 0, 0.4)
  );
}

.hero--bg > * {
  position: relative;
  z-index: 1;
}
```

### Hero HTML

```html
<section class="hero">
  <h1 class="hero__title">Build Beautiful Sites</h1>
  <p class="hero__subtitle">
    Create stunning single-file websites with the help of AI.
    No setup, no build tools, no hassle.
  </p>
  <div class="hero__actions">
    <a href="#" class="button button--primary">Get Started</a>
    <a href="#" class="button button--secondary">Learn More</a>
  </div>
</section>
```

### Hero with Background Image

```html
<section
  class="hero hero--bg"
  style="background-image: url('assets/hero-bg.webp')"
>
  <h1 class="hero__title">Our Services</h1>
  <p class="hero__subtitle">We deliver solutions that scale.</p>
  <div class="hero__actions">
    <a href="#" class="button button--primary">Explore</a>
  </div>
</section>
```

### Hero Guidelines

- Keep titles under 12 words (ideally 5-8).
- The subtitle should explain what happens next.
- Use exactly one CTA for primary actions, optionally a secondary CTA.
- Background images need a dark overlay for text readability.
- Hero should take 50-80% of viewport height.

**Agent rule:** Every page should have exactly one hero section. Do not stack multiple hero-like sections. Use `<section>` with an appropriate class.

---

## CTA Buttons

Buttons drive user action. Use consistent styles for primary and secondary actions.

### Button Base

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.625rem 1.25rem;
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Button Variants

```css
.button--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.button--primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.button--secondary {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.button--secondary:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.button--ghost {
  background-color: transparent;
  color: var(--color-text);
  border-color: transparent;
}

.button--ghost:hover {
  background-color: var(--color-bg-alt);
}

.button--danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
  border-color: var(--color-error);
}
```

### Button Sizes

```css
.button--sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-sm);
}

.button--lg {
  padding: 0.875rem 2rem;
  font-size: var(--text-lg);
}
```

### Button HTML

```html
<!-- Primary action -->
<button class="button button--primary">Submit</button>
<a href="#" class="button button--primary">Get Started</a>

<!-- Secondary action -->
<button class="button button--secondary">Cancel</button>

<!-- Ghost (minimal) -->
<button class="button button--ghost">Learn More</button>

<!-- Danger -->
<button class="button button--danger">Delete Account</button>

<!-- With icon -->
<button class="button button--primary">
  <svg><!-- icon --></svg>
  Download
</button>
```

**Agent rule:** Use `<a>` for navigation that changes the URL. Use `<button>` for in-page actions (forms, modals, toggles). Never use `<div>` or `<span>` as interactive elements.

---

## Shadow and Depth

Shadows create visual layers and imply elevation. Use consistent shadow tokens throughout.

### Shadow Scale

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
               0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
               0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),
               0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

### When to Use Each

| Shadow   | Elevation | Use Case                       |
|----------|-----------|--------------------------------|
| `--shadow-sm` | +1   | Cards, small UI elements       |
| `--shadow-md` | +2   | Dropdowns, hovered cards       |
| `--shadow-lg` | +3   | Modals, navigation menus       |
| `--shadow-xl` | +4   | Toast notifications, drawers   |

### Dark Mode Shadows

In dark mode, shadows should use lighter, colored shadows instead of pure black.

```css
[data-theme="dark"] {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4),
               0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4),
               0 4px 6px -4px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.5),
               0 8px 10px -6px rgb(0 0 0 / 0.4);
}
```

---

## Whitespace Principles

Whitespace is not wasted space. It is a design tool that improves readability, focus, and visual comfort.

### Core Principles

1. **Padding before borders.** Add padding inside containers before adding borders. A bordered box with 16px padding feels contained. A bordered box with 4px padding feels cramped.

```css
/* Good */
.card {
  padding: var(--space-6);
  border: 1px solid var(--color-border);
}

/* Bad - too tight */
.card {
  padding: var(--space-2);
  border: 1px solid var(--color-border);
}
```

2. **Generous whitespace between sections.** Always use `--space-12` or `--space-16` between major sections of a page.

```css
.section + .section {
  margin-top: var(--space-16);
}
```

3. **Tighten internal spacing.** Use smaller spacing inside components (between a heading and its body text, between form labels and inputs).

```css
.card__title + .card__body {
  margin-top: var(--space-2);
}
```

4. **Line height is whitespace.** The `1.6` line height on body text distributes whitespace within paragraphs.

### The Inset Pattern

```css
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```

This keeps content from touching the viewport edges while maintaining a centered layout.

### Section Spacing Template

```css
.section {
  padding: var(--space-16) 0;
}

.section--sm {
  padding: var(--space-8) 0;
}

.section--lg {
  padding: var(--space-24) 0;
}

.section--hero {
  padding: var(--space-16) 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
}
```

**Agent rule:** Do not stack two sections with the same background color directly against each other. Alternate `--color-bg` and `--color-bg-alt` to create visual separation.

---

## Anti-Patterns

### 1. Inconsistent Typography

```css
/* BAD: arbitrary sizes without scale */
.title { font-size: 36px; }
.subtitle { font-size: 22px; }
.body { font-size: 15px; }

/* GOOD: using the modular scale */
.title { font-size: var(--text-4xl); }
.subtitle { font-size: var(--text-xl); }
.body { font-size: var(--text-base); }
```

### 2. Raw Color Values

```css
/* BAD: scattered raw colors */
.button { background: #2563eb; }
.link { color: #2563eb; }
.badge { background: #dbeafe; }

/* GOOD: centralized variables */
.button { background: var(--color-primary); }
.link { color: var(--color-primary); }
.badge { background: var(--color-primary-light); }
```

### 3. Cramped Layout

```css
/* BAD: no breathing room */
.section {
  padding: 8px;
}

.card {
  padding: 8px;
  gap: 4px;
}

/* GOOD: generous, intentional spacing */
.section {
  padding: var(--space-16) 0;
}

.card {
  padding: var(--space-6);
  gap: var(--space-4);
}
```

### 4. Flat Interactive Elements

```css
/* BAD: no visual feedback */
.button {
  background: blue;
  color: white;
}
/* hover state missing */

/* GOOD: hover and focus states */
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  transition: background 0.15s ease;
}
.button:hover {
  background: var(--color-primary-hover);
}
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 5. Too Many Font Sizes

```css
/* BAD: too many sizes breaks rhythm */
.card h2 { font-size: 1.75rem; }
.card h3 { font-size: 1.35rem; }
.sidebar h2 { font-size: 1.65rem; }

/* GOOD: stick to the scale */
.card h2, .sidebar h2 { font-size: var(--text-3xl); }
.card h3 { font-size: var(--text-2xl); }
```

### 6. Pure Black on Pure White

```css
/* BAD: harsh contrast */
body {
  color: #000;
  background: #fff;
}

/* GOOD: softened contrast */
body {
  color: var(--color-text);
  background: var(--color-bg);
}
```

### 7. Inconsistent Border Radius

```css
/* BAD: varied radii without reason */
.card { border-radius: 8px; }
.button { border-radius: 4px; }
.input { border-radius: 6px; }
.modal { border-radius: 12px; }

/* GOOD: consistent radii
   Use a small set: none, 0.375rem, 0.5rem, 0.75rem, 9999px */
:root {
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}
```

### 8. Ignoring Mobile Spacing

```css
/* BAD: same spacing on mobile */
.section {
  padding: var(--space-16) 0;
}

/* GOOD: reduced spacing on mobile */
.section {
  padding: var(--space-8) 0;
}

@media (min-width: 768px) {
  .section {
    padding: var(--space-16) 0;
  }
}
```

### 9. Overusing Shadows on Everything

```css
/* BAD: every element floats */
.card { box-shadow: var(--shadow-md); }
.button { box-shadow: var(--shadow-md); }
.header { box-shadow: var(--shadow-md); }
.footer { box-shadow: var(--shadow-md); }

/* GOOD: selective depth */
.card { box-shadow: var(--shadow-sm); }
.card:hover { box-shadow: var(--shadow-md); }
.header { box-shadow: var(--shadow-sm); }
```

### 10. No Visual Breathing Room Around CTAs

```css
/* BAD: CTA cramped against content */
.hero__actions {
  margin-top: 0;
}

/* GOOD: breathing room before action */
.hero__actions {
  margin-top: var(--space-8);
}
```

---

## Quick Reference

```
Typography: modular scale 1.25 (base 1rem)
Color:      CSS custom properties, never raw values
Spacing:    4px base scale, use tokens
Hierarchy:  size > color > spacing > contrast
Cards:      bg + border + shadow + padding
Hero:       title + subtitle + actions + bg
Buttons:    primary solid / secondary outline / ghost
Shadows:    sm / md / lg / xl
Whitespace: padding before borders, generous sections
```
