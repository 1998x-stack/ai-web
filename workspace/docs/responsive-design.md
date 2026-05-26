# Responsive Design Guide

An authoritative reference for AI agents generating websites in the ai-web platform. Every site you build must follow these patterns.

---

## Core Principle: Mobile-First

Write CSS for the smallest screen first. That means 320px minimum width. Then add progressively larger layouts with `min-width` media queries.

```css
/* Base: mobile-first styles (320px and up) */
.footer {
  padding: 2rem 1rem;
  font-size: 0.875rem;
}

/* Tablet: 768px and up */
@media (min-width: 768px) {
  .footer {
    padding: 3rem 2rem;
    font-size: 1rem;
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .footer {
    padding: 4rem 3rem;
  }
}
```

Never write a `max-width` media query for getting smaller. Always `min-width` for getting bigger. This keeps your CSS source-order clean and predictable.

```css
/* BAD: desktop-first, overriding base styles */
.footer {
  padding: 4rem;
}
@media (max-width: 767px) {
  .footer {
    padding: 1rem;
  }
}

/* GOOD: mobile-first, clean cascade */
.footer {
  padding: 1rem;
}
@media (min-width: 768px) {
  .footer {
    padding: 4rem;
  }
}
```

Never use fixed pixel widths on containers or layout elements. No `width: 1200px`. No `width: 300px` on anything that holds content. The only fixed widths that belong in your CSS are things like icon sizes, borders, and small UI elements.

```css
/* BAD */
.hero {
  width: 1200px;
  margin: 0 auto;
}

/* GOOD */
.hero {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
```

*Agent rule: Every layout you build must start from the 320px viewport and expand outward. If you wrote a max-width query, rewrite it as min-width. If you set a fixed width on anything that wraps text, remove it.*

---

## Breakpoints

Use these four breakpoints. No more, no less.

| Breakpoint | min-width | Target Device |
|---|---|---|
| sm | 640px | Large phones, landscape |
| md | 768px | Tablets |
| lg | 1024px | Small laptops, landscape tablets |
| xl | 1280px | Desktop monitors |

A 5-column grid at 1280px is fine. A 2-column grid at 640px is fine. What matters is where the layout breaks, not the device name.

```css
/* Base: 1 column (320px+) */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* sm: 2 columns */
@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* md: 3 columns */
@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* lg: 4 columns */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

You can skip breakpoints where the layout doesnt change. If 3 columns work at 640px all the way to 1280px, dont write a media query for lg.

Always test at 320px. Every layout must render without horizontal scroll at 320px. Open Chrome DevTools, set the viewport to 320px, and check:

- No horizontal scrollbar
- All text is readable (no overflow)
- All buttons and links are tappable
- Images arent cut off
- Navigation is usable (not crammed)

*Agent rule: 320px is your minimum viewport. If your layout breaks at 320px, you haven't done mobile-first. Fix the base styles before touching media queries.*

---

## Container Pattern

Every page needs a container to center content and cap its maximum width.

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

At 320px, a container with `padding: 0 1rem` leaves 288px of usable space. Thats enough for about 12 words per line at 16px font size. If the container is inside a `body` with default margin, also reset that:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100%;
  overflow-x: hidden;
}
```

For full-width sections that need constrained inner content, use the container inside a full-width wrapper:

```css
.section-full {
  width: 100%;
}

.section-full .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

This pattern lets you have background colors or images that stretch edge-to-edge while the content stays aligned.

```html
<section class="section-full" style="background: #1a1a2e;">
  <div class="container">
    <h2>Dark Section Title</h2>
    <p>Content stays within the container.</p>
  </div>
</section>
```

For narrower content like articles or blog posts, use a smaller max-width:

```css
.container-narrow {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

For full-bleed hero sections where the text needs to be extra wide:

```css
.container-wide {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

*Agent rule: Use .container for the main page layout. Use .container-narrow for reading content. Always include padding on both sides so text never touches the edge.*

---

## Flexbox Layout (1D)

Flexbox handles one-dimensional layouts: a row or a column. When you need items to wrap, align, or space themselves, reach for flexbox.

### Navigation Bar (mobile = column, desktop = row)

```css
.nav {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
  width: 100%;
}

@media (min-width: 768px) {
  .nav {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: auto;
  }
}
```

```html
<nav class="nav">
  <a href="/" class="nav-logo">Logo</a>
  <div class="nav-links">
    <a href="/about">About</a>
    <a href="/pricing">Pricing</a>
    <a href="/contact">Contact</a>
  </div>
</nav>
```

The logo stays at the top on mobile. On desktop it moves to the left with links on the right.

### Card Row (responsive wrapping)

```css
.card-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-row .card {
  flex: 1 1 auto;
}

@media (min-width: 640px) {
  .card-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .card-row .card {
    flex: 1 1 calc(50% - 0.5rem);
  }
}

@media (min-width: 1024px) {
  .card-row .card {
    flex: 1 1 calc(33.333% - 0.666rem);
  }
}
```

### Centering with Flexbox

```css
.center-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.center-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
```

### Holy Grail of Spacing: gap

Always use `gap` on flex containers instead of margins on children. Gap is supported in all modern browsers.

```css
/* BAD - margin on children */
.btn-group button {
  margin-right: 0.5rem;
}
.btn-group button:last-child {
  margin-right: 0;
}

/* GOOD - gap on parent */
.btn-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
```

*Agent rule: Default flex-direction to column on mobile, switch to row at md or lg breakpoint. Use gap for spacing between items. Never use margin hacks on flex children.*

---

## CSS Grid Layout (2D)

Grid handles two-dimensional layouts: rows and columns simultaneously. Use it for page sections where items need to align in both directions.

### Card Grid (1 col -> 2 col -> 3 col)

```css
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
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

### Auto-fill with minmax (fluid grid)

For truly fluid grids without media queries, use `auto-fill` and `minmax`:

```css
.fluid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
```

This creates as many columns as fit, each at least 280px wide. When the viewport shrinks past 560px (two columns), items drop to one column. No media query needed.

### Sidebar Layout

```css
.page-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .page-layout {
    grid-template-columns: 250px 1fr;
  }
}

@media (min-width: 1024px) {
  .page-layout {
    grid-template-columns: 300px 1fr;
  }
}
```

### Complex Grid Areas

```css
.dashboard {
  display: grid;
  grid-template-areas:
    "header"
    "nav"
    "main"
    "aside"
    "footer";
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .dashboard {
    grid-template-areas:
      "header header"
      "nav    main"
      "aside  main"
      "footer footer";
    grid-template-columns: 200px 1fr;
  }
}

@media (min-width: 1024px) {
  .dashboard {
    grid-template-areas:
      "header header header"
      "nav    main   aside"
      "footer footer footer";
    grid-template-columns: 200px 1fr 250px;
  }
}

.dashboard-header { grid-area: header; }
.dashboard-nav { grid-area: nav; }
.dashboard-main { grid-area: main; }
.dashboard-aside { grid-area: aside; }
.dashboard-footer { grid-area: footer; }
```

### Grid Gap Patterns

```css
.grid-tight {
  gap: 0.5rem;
}

.grid-normal {
  gap: 1rem;
}

.grid-loose {
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid-loose {
    gap: 2rem;
  }
}
```

*Agent rule: Use grid for 2D layouts where items need to align in rows AND columns. Use auto-fill with minmax for fluid cards that need zero media queries. Always set grid-template-columns to 1fr on mobile as the base value.*

---

## Responsive Images

Images are the most common source of layout breakage. Follow these rules to keep them contained.

### The Bare Minimum

```css
img {
  max-width: 100%;
  height: auto;
}
```

This makes every image scale down to fit its container while keeping its aspect ratio. Put this in your global reset so you never forget.

### Loading Attribute

```html
<img src="photo.jpg" alt="Description" loading="lazy">
```

Use `loading="lazy"` on all images below the fold. This defers loading until the user scrolls near them. Skip it on the first image above the fold for fastest initial paint.

### Aspect Ratio Boxes (CLS Prevention)

Cumulative Layout Shift happens when images load after text pushes them down. Fix this with `aspect-ratio`:

```css
.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

```html
<div class="image-wrapper">
  <img src="hero.jpg" alt="Hero image" loading="lazy">
</div>
```

Common aspect ratios:

- 16 / 9: Widescreen video, hero banners
- 4 / 3: Photography, product shots
- 1 / 1: Square avatars, thumbnails
- 3 / 2: Landscape photography
- 9 / 16: Mobile portrait, stories

### Responsive Image Sources

```html
<picture>
  <source srcset="hero-large.webp" media="(min-width: 1024px)" type="image/webp">
  <source srcset="hero-medium.webp" media="(min-width: 640px)" type="image/webp">
  <source srcset="hero-small.webp" type="image/webp">
  <img src="hero-fallback.jpg" alt="Hero" loading="lazy">
</picture>
```

Serve WebP first with JPEG fallback. Use `srcset` and `sizes` for resolution switching:

```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Gallery photo"
  loading="lazy"
>
```

### Background Images

```css
.hero {
  background-image: url('hero-mobile.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 300px;
}

@media (min-width: 640px) {
  .hero {
    background-image: url('hero-tablet.jpg');
    min-height: 400px;
  }
}

@media (min-width: 1024px) {
  .hero {
    background-image: url('hero-desktop.jpg');
    min-height: 600px;
  }
}
```

*Agent rule: Every image tag needs max-width: 100% and height: auto. Every image above 200px height needs aspect-ratio set. Use loading=lazy on images below the fold. If you skip any of these, you cause layout shift.*

---

## Typography Responsiveness

Use `clamp()` for fluid typography that scales between viewport sizes without media queries.

### Fluid Headings

```css
h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
  font-weight: 700;
}

h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
  font-weight: 600;
}

h3 {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  line-height: 1.3;
  font-weight: 600;
}

p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
}
```

The `clamp()` function takes three values: minimum, preferred, maximum.

```
clamp(MIN, PREFERRED, MAX)
```

- MIN: the smallest size (never goes below this)
- PREFERRED: the fluid value (usually a viewport unit)
- MAX: the largest size (never goes above this)

### Why clamp() beats media queries

```css
/* BAD: three separate media queries to do what clamp does in one line */
h2 {
  font-size: 1.5rem;
}
@media (min-width: 640px) {
  h2 { font-size: 2rem; }
}
@media (min-width: 1024px) {
  h2 { font-size: 2.5rem; }
}

/* GOOD: one line, smooth scaling between every pixel */
h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}
```

### Line Length

Keep lines between 60 and 75 characters for readability. Use `ch` units for this:

```css
article p, article li {
  max-width: 65ch;
}

article {
  max-width: 75ch;
  margin: 0 auto;
}
```

### Spacing Scale

```css
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
}

h1 {
  margin-bottom: var(--space-lg);
}

h2 {
  margin-bottom: var(--space-md);
}

p {
  margin-bottom: var(--space-md);
}

section {
  padding: var(--space-2xl) 0;
}

@media (min-width: 768px) {
  section {
    padding: var(--space-3xl) 0;
  }
}
```

### Responsive Font Weights

On mobile, use regular weight (400) for body text. On large screens you can go lighter:

```css
body {
  font-weight: 400;
}

@media (min-width: 1024px) {
  body {
    font-weight: 350;
  }
}
```

*Agent rule: Use clamp() for all heading sizes. Never write a media query just to change font size use clamp() instead. Set max-width on paragraphs with ch units. Keep h1 at clamp(2rem, 5vw, 3.5rem) unless the design demands otherwise.*

---

## CSS Custom Properties

Custom properties let you centralize repeated values and swap them per breakpoint without rewriting selectors.

### Layout Properties

```css
:root {
  --container-padding: 1rem;
  --section-spacing: 2rem;
  --grid-columns: 1;
  --gap: 1rem;
  --content-max-width: 1200px;
}

@media (min-width: 640px) {
  :root {
    --grid-columns: 2;
    --gap: 1.25rem;
  }
}

@media (min-width: 768px) {
  :root {
    --container-padding: 2rem;
    --section-spacing: 3rem;
  }
}

@media (min-width: 1024px) {
  :root {
    --grid-columns: 3;
    --gap: 1.5rem;
    --section-spacing: 4rem;
  }
}
```

### Using Layout Properties

```css
.section {
  padding: var(--section-spacing) 0;
}

.container {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--gap);
}
```

### Color Properties

```css
:root {
  --color-text: #111;
  --color-text-secondary: #555;
  --color-bg: #fff;
  --color-bg-alt: #f5f5f5;
  --color-primary: #3b82f6;
  --color-border: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f0f0f0;
    --color-text-secondary: #aaa;
    --color-bg: #111;
    --color-bg-alt: #1a1a2e;
    --color-primary: #60a5fa;
    --color-border: #333;
  }
}
```

### Typography Custom Properties

```css
:root {
  --font-body: system-ui, -apple-system, sans-serif;
  --font-heading: system-ui, -apple-system, sans-serif;
  --font-mono: "SF Mono", "Fira Code", monospace;
  --text-sm: clamp(0.8rem, 1.5vw, 0.875rem);
  --text-base: clamp(1rem, 2vw, 1.125rem);
  --text-lg: clamp(1.125rem, 2.5vw, 1.25rem);
  --text-xl: clamp(1.25rem, 3vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 4vw, 2rem);
  --text-3xl: clamp(2rem, 5vw, 3rem);
}
```

### Override Pattern

You can also scope custom properties to specific sections for localized overrides:

```css
.hero-section {
  --section-spacing: 4rem;
  --color-bg: #1a1a2e;
  --color-text: #fff;
}

.features-section {
  --grid-columns: 1;
}

@media (min-width: 640px) {
  .features-section {
    --grid-columns: 2;
  }
}

@media (min-width: 1024px) {
  .features-section {
    --grid-columns: 3;
  }
}
```

*Agent rule: Define layout custom properties in :root and override them at breakpoints. Never write a media query that targets a specific element directly if you can achieve the same thing by overriding a custom property.*

---

## Navigation Patterns

Navigation is the hardest responsive component. Here are proven patterns.

### Hamburger Menu (mobile) + Horizontal Nav (desktop)

```css
.nav-toggle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text, #111);
  transition: transform 0.2s, opacity 0.2s;
}

.nav-toggle.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-toggle.active span:nth-child(2) {
  opacity: 0;
}

.nav-toggle.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.nav-menu {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 0;
}

.nav-menu.open {
  display: flex;
}

@media (min-width: 768px) {
  .nav-toggle {
    display: none;
  }

  .nav-menu {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
    width: auto;
    padding: 0;
  }
}
```

```html
<nav class="nav">
  <a href="/" class="nav-logo">Site Name</a>
  <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>
  <div class="nav-menu" id="nav-menu">
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/portfolio">Portfolio</a>
    <a href="/contact">Contact</a>
  </div>
</nav>
```

```css
.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 1rem var(--container-padding, 1rem);
  position: relative;
}

.nav-logo {
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
  color: var(--color-text, #111);
}

.nav-menu a {
  text-decoration: none;
  padding: 0.5rem 0;
  color: var(--color-text-secondary, #555);
  transition: color 0.15s;
}

.nav-menu a:hover {
  color: var(--color-primary, #3b82f6);
}

@media (min-width: 768px) {
  .nav-menu a {
    padding: 0.25rem 0;
  }
}
```

### JavaScript for Toggle

```javascript
// Minimal hamburger toggle — include in your site
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}
```

### Sticky Nav (mobile-friendly)

```css
.nav-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg, #fff);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* On mobile, the menu needs room below the sticky nav */
@media (max-width: 767px) {
  .nav-menu.open {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-bg, #fff);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 99;
  }

  .nav {
    position: relative;
  }
}
```

### Breadcrumb Navigation

```css
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  font-size: 0.875rem;
  list-style: none;
  padding: 0.5rem 0;
}

.breadcrumb li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb li + li::before {
  content: "/";
  color: var(--color-text-secondary, #555);
}

.breadcrumb a {
  color: var(--color-primary, #3b82f6);
  text-decoration: none;
}
```

### Pagination

```css
.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.25rem;
}

.pagination a,
.pagination span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.875rem;
  color: var(--color-text, #111);
}

.pagination a:hover {
  background: var(--color-bg-alt, #f5f5f5);
}

.pagination .active {
  background: var(--color-primary, #3b82f6);
  color: white;
  border-color: var(--color-primary, #3b82f6);
}
```

*Agent rule: Always include a hamburger menu for mobile navigation. Hide the toggle button at md breakpoint and show horizontal links. Include the JavaScript toggle in every site that has navigation. Make sure touch targets are 44x44px on mobile.*

---

## Anti-Patterns

Avoid these mistakes. They cause the most layout issues in generated sites.

### 1. Fixed Width Containers

```css
/* BAD */
.wrapper {
  width: 1200px;
}

/* GOOD */
.wrapper {
  width: 100%;
  max-width: 1200px;
}
```

Fixed width containers overflow on smaller viewports and waste space on larger ones.

### 2. px Font Sizes in Headings

```css
/* BAD */
h1 {
  font-size: 48px;
}

/* GOOD */
h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
}
```

PX font sizes dont scale with the viewport. On a 320px phone, a 48px heading takes up 15% of the screen height.

### 3. Media Queries Going Smaller-First

```css
/* BAD */
@media (max-width: 1023px) { ... }
@media (max-width: 767px) { ... }
@media (max-width: 639px) { ... }

/* GOOD */
@media (min-width: 640px) { ... }
@media (min-width: 768px) { ... }
@media (min-width: 1024px) { ... }
```

Max-width queries are harder to reason about. They override the cascade going downward. Min-width queries match reading order.

### 4. Missing Viewport Meta Tag

```html
<!-- BAD: missing or wrong -->
<meta name="viewport" content="width=1200">

<!-- GOOD -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Without the viewport meta tag, mobile browsers render your page at a simulated desktop width and zoom out. Everything becomes tiny.

### 5. overflow: hidden on body

```css
/* BAD */
body {
  overflow: hidden;
}

/* BETTER: contain it to the offending element */
.offending-element {
  overflow-x: auto;
}

/* BEST: find and fix the root cause */
```

Setting `overflow: hidden` on body breaks sticky positioning, scroll-based animations, and can hide content from keyboard navigation.

### 6. Fixed Heights on Text Containers

```css
/* BAD */
.hero-text {
  height: 400px;
  overflow: hidden;
}

/* GOOD */
.hero-text {
  min-height: 300px;
  padding: 2rem 0;
}
```

Fixed heights cause overflow when text wraps differently on mobile. Always use min-height.

### 7. Using rem or em in Media Queries

```css
/* BAD - user changed their font size, now your layout breaks */
@media (min-width: 48rem) { ... }

/* GOOD - pixels are the only reliable unit for media queries */
@media (min-width: 768px) { ... }
```

Media queries in `rem` or `em` respond to the user's font size setting. If a user sets their browser to 24px default font, `48rem` becomes 1152px instead of 768px. Always use px.

### 8. Hardcoding Breakpoints in JS

```javascript
// BAD
if (window.innerWidth < 768) { ... }

// GOOD
if (window.matchMedia('(max-width: 767px)').matches) { ... }
```

The `matchMedia` API is more reliable and can be listened to with `addEventListener('change', ...)`.

### 9. Floating Layouts

```css
/* BAD */
.sidebar { float: left; width: 250px; }
.main { float: left; width: calc(100% - 250px); }

/* GOOD */
.page { display: grid; grid-template-columns: 250px 1fr; gap: 2rem; }
```

Floats for layout are legacy. Use flexbox or grid.

### 10. No Touch Target Sizing

```css
/* BAD */
.nav a {
  font-size: 0.75rem;
  padding: 2px;
}

/* GOOD */
.nav a {
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  min-width: 44px;
  min-height: 44px;
}
```

The WCAG minimum touch target is 44x44px. Smaller targets are frustrating on mobile.

*Agent rule: Never use fixed widths, max-width queries, overflow hidden on body, or px-only font sizes. Include the viewport meta tag in every page. Test every layout at 320px before calling it done.*

---

## Testing Checklist

Before you ship any site, verify each item on this list.

### Mobile (320px - 480px)

- [ ] Page renders without horizontal scroll
- [ ] All text is readable without zooming
- [ ] Navigation is usable (hamburger works)
- [ ] Touch targets are at least 44x44px
- [ ] Images dont overflow their containers
- [ ] Forms are fully usable (inputs, buttons)
- [ ] No overlapping elements
- [ ] Content is not cut off on the right edge
- [ ] Buttons have enough padding (not touching edges)
- [ ] Links are easily tappable (not too close together)
- [ ] The page score exceeds 80 on Lighthouse Mobile

### Tablet (768px)

- [ ] Layout uses 2-column grid where appropriate
- [ ] Navigation switches to horizontal
- [ ] No weird gaps or spacing issues
- [ ] Images fill their containers correctly
- [ ] Sidebar is visible and properly positioned
- [ ] The page score exceeds 90 on Lighthouse Mobile

### Desktop (1024px+)

- [ ] Layout uses 3+ column grid where appropriate
- [ ] Max-width container prevents line-length issues
- [ ] No elements stretch unnaturally wide
- [ ] Hover states work on all interactive elements
- [ ] Navigation is fully horizontal
- [ ] The page score exceeds 95 on Lighthouse Desktop

### Cross-Breakpoint

- [ ] No content jumps or layout shifts during resize
- [ ] Font sizes scale smoothly (no sudden jumps)
- [ ] Gap sizes are consistent across breakpoints
- [ ] Animations dont break at any width
- [ ] Tables scroll horizontally on mobile (wrapper pattern)
- [ ] Video embeds are responsive

### Table Wrapper Pattern

```html
<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
  <table>
    <!-- table content -->
  </table>
</div>
```

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1rem 0;
}

.table-wrapper table {
  width: 100%;
  min-width: 480px; /* forces scroll on small screens */
  border-collapse: collapse;
}
```

### Final Sanity Check

Open your site in Chrome DevTools at 320px, 640px, 768px, 1024px, and 1280px. At each width:

1. Check for horizontal scroll
2. Read every line of text
3. Click every button
4. Tap every link
5. Fill out every form field
6. Scroll to the bottom

If anything breaks at any width, fix it before shipping.

*Agent rule: Run the full testing checklist before considering a site complete. You are responsible for checking every breakpoint. A site that breaks at 320px is not done.*

---

## Putting It All Together

Here is a minimal responsive page template that uses everything from this guide:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Page</title>
  <style>
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --container-padding: 1rem;
      --section-spacing: 2rem;
      --grid-columns: 1;
      --gap: 1rem;
      --color-text: #111;
      --color-text-secondary: #555;
      --color-bg: #fff;
      --color-bg-alt: #f5f5f5;
      --color-primary: #3b82f6;
      --color-border: #e5e7eb;
      --font-body: system-ui, -apple-system, sans-serif;
      --content-max-width: 1200px;
    }

    @media (min-width: 640px) {
      :root { --grid-columns: 2; }
    }

    @media (min-width: 768px) {
      :root {
        --container-padding: 2rem;
        --section-spacing: 3rem;
      }
    }

    @media (min-width: 1024px) {
      :root {
        --grid-columns: 3;
        --section-spacing: 4rem;
      }
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --color-text: #f0f0f0;
        --color-text-secondary: #aaa;
        --color-bg: #111;
        --color-bg-alt: #1a1a2e;
        --color-primary: #60a5fa;
        --color-border: #333;
      }
    }

    body {
      font-family: var(--font-body);
      color: var(--color-text);
      background: var(--color-bg);
      line-height: 1.6;
      overflow-x: hidden;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    .container {
      width: 100%;
      max-width: var(--content-max-width);
      margin: 0 auto;
      padding: 0 var(--container-padding);
    }

    .section {
      padding: var(--section-spacing) 0;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(var(--grid-columns), 1fr);
      gap: var(--gap);
    }

    h1 { font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; }
    h2 { font-size: clamp(1.5rem, 4vw, 2.5rem); line-height: 1.2; }
    h3 { font-size: clamp(1.25rem, 3vw, 1.75rem); line-height: 1.3; }
    p { font-size: clamp(1rem, 2vw, 1.125rem); line-height: 1.6; max-width: 65ch; }
  </style>
</head>
<body>
  <div class="container">
    <section class="section">
      <h1>Page Title</h1>
      <p>This template covers all responsive patterns.</p>
    </section>
  </div>
</body>
</html>
```

*Agent rule: Start every site from this template. Customize the custom properties for each project. Never remove the viewport meta tag, the img reset, or the container pattern.*

---

## Quick Reference

### Snippet: Container

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Snippet: Mobile-First Media Queries

```css
/* Base */
.element { }

/* sm: 640px+ */
@media (min-width: 640px) { }

/* md: 768px+ */
@media (min-width: 768px) { }

/* lg: 1024px+ */
@media (min-width: 1024px) { }

/* xl: 1280px+ */
@media (min-width: 1280px) { }
```

### Snippet: Fluid Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
```

### Snippet: Fluid Typography

```css
h1 { font-size: clamp(2rem, 5vw, 3.5rem); }
h2 { font-size: clamp(1.5rem, 4vw, 2.5rem); }
h3 { font-size: clamp(1.25rem, 3vw, 1.75rem); }
p  { font-size: clamp(1rem, 2vw, 1.125rem); }
```

### Snippet: Responsive Image

```css
img {
  max-width: 100%;
  height: auto;
}

.image-wrapper {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
```

### Snippet: Nav Toggle

```css
.nav-toggle { display: flex; }
.nav-menu { display: none; }
.nav-menu.open { display: flex; }

@media (min-width: 768px) {
  .nav-toggle { display: none; }
  .nav-menu { display: flex; }
}
```

### Snippet: Table Wrapper

```css
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

*Agent rule: Bookmark these snippets. Use them as a starting point for every responsive component. Nine out of ten responsive bugs come from violating one of these patterns.*

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-05-26 | AI Web Agent | Initial guide |
