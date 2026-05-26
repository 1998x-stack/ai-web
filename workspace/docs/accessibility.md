# Accessibility

Accessibility is not optional. Every generated Site must be usable by people with disabilities including visual, auditory, motor, and cognitive impairments. Accessible Sites also rank better in search engines, perform better on mobile, and reach a wider audience.

---

## Table of Contents

1. [Semantic HTML Landmarks](#semantic-html-landmarks)
2. [Heading Hierarchy](#heading-hierarchy)
3. [ARIA Roles and Labels](#aria-roles-and-labels)
4. [Color Contrast](#color-contrast)
5. [Keyboard Navigation](#keyboard-navigation)
6. [Skip to Content](#skip-to-content)
7. [Forms and Labels](#forms-and-labels)
8. [Images and Alt Text](#images-and-alt-text)
9. [Reduced Motion](#reduced-motion)
10. [Screen Reader Only Content](#screen-reader-only-content)
11. [Anti-Patterns](#anti-patterns)

---

## Semantic HTML Landmarks

Use semantic HTML elements to define the structure of every page. These elements create implicit landmarks that screen readers use for navigation.

### Required Landmarks

```html
<body>
  <header>
    <!-- Site header, logo, primary navigation -->
  </header>

  <nav aria-label="Main navigation">
    <!-- Primary navigation links -->
  </nav>

  <main id="main-content">
    <!-- Page-specific content goes here -->
  </main>

  <aside>
    <!-- Sidebar, related content, supplementary info -->
  </aside>

  <footer>
    <!-- Copyright, footer links, secondary info -->
  </footer>
</body>
```

### Agent Rule

> **Agent rule:** Use semantic elements. Every page must have exactly one `main#main-content`.

### Landmark Mapping

| Element    | Implicit Role  | When to Use                              |
|------------|----------------|------------------------------------------|
| `<header>` | banner         | Top of page, site header                 |
| `<nav>`    | navigation     | Any navigation block                     |
| `<main>`   | main           | Primary page content (exactly one)       |
| `<article>`| article        | Self-contained content, blog posts, cards|
| `<section>`| region         | Themed grouping of content               |
| `<aside>`  | complementary  | Sidebar, related links                   |
| `<footer>` | contentinfo    | Bottom of page, copyright                |
| `<form>`   | form           | Any form element                         |

### Sectioning with aria-label

When you have multiple `<nav>` or `<section>` elements, distinguish them with `aria-label`.

```html
<nav aria-label="Main navigation">
  <!-- primary links -->
</nav>

<nav aria-label="Breadcrumb">
  <!-- breadcrumb links -->
</nav>
```

### Landmarks Must Be Presentational

```html
<!-- BAD: div soup -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="content">...</div>
<div class="footer">...</div>

<!-- GOOD: semantic landmarks -->
<header>...</header>
<nav aria-label="Main">...</nav>
<main id="main-content">...</main>
<footer>...</footer>
```

---

## Heading Hierarchy

Headings create a document outline that screen reader users navigate. A proper hierarchy is essential.

### The Rules

> **Agent rule:** Heading hierarchy must be sequential. Never skip levels (h1 to h3, h2 to h4).

- Use exactly one `<h1>` per page.
- Nest headings in order: h1, h2, h3, h4.
- You can have multiple h2s, multiple h3s, etc.
- Never use a heading for its visual style alone.
- Never skip a level when drilling down.

### Correct Hierarchy

```html
<h1>Page Title</h1>

<h2>Section One</h2>
<p>Section content...</p>

<h3>Subsection</h3>
<p>Subsection content...</p>

<h3>Another Subsection</h3>
<p>More content...</p>

<h2>Section Two</h2>
<p>Section content...</p>
```

### Incorrect Hierarchy

```html
<!-- BAD: skipping levels -->
<h1>Page Title</h1>
<h3>Subsection</h3>  <!-- skipped h2 -->

<!-- BAD: multiple h1s -->
<h1>Section One</h1>
<h1>Section Two</h1>

<!-- BAD: using h* for visual style -->
<div class="big-text">Section Title</div>  <!-- should be h2 -->
```

### Screen Reader Navigation

Screen reader users navigate by heading level. They can:
- Jump between all headings (key: H)
- Jump through specific heading levels (key: 1, 2, 3)
- Get a full outline of the page

A broken hierarchy means parts of the page become invisible to these users.

---

## ARIA Roles and Labels

ARIA (Accessible Rich Internet Applications) supplements HTML semantics when native elements are insufficient.

### First Rule of ARIA

> **Agent rule:** Don't use ARIA if you can use a native HTML element. `<button>` is better than `<div role="button">`.

### When to Use ARIA

1. **Live regions** for dynamic content updates.
2. **Labels** when visible text is absent.
3. **Describedby** for additional instructions.
4. **Roles** for custom interactive widgets.

### Labels

Every interactive element needs an accessible name.

```html
<!-- Via aria-label -->
<button aria-label="Close dialog">
  <svg><!-- X icon --></svg>
</button>

<!-- Via aria-labelledby -->
<div id="dialog-title">Confirm Delete</div>
<div role="dialog" aria-labelledby="dialog-title">
  <!-- dialog content -->
</div>

<!-- Via descriptive text (preferred) -->
<button>
  Close
  <span class="sr-only">dialog</span>
</button>
```

### Descriptions

```html
<input
  type="password"
  id="password"
  aria-describedby="password-hint"
/>
<p id="password-hint">Must be at least 8 characters.</p>
```

### Live Regions

```html
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic content updates announced by screen readers -->
</div>

<div role="status" aria-live="polite">
  <!-- Status messages, form errors -->
</div>

<div role="alert">
  <!-- Critical errors that demand immediate attention -->
</div>
```

### ARIA Roles for Common Patterns

```html
<!-- Tab interface -->
<div role="tablist" aria-label="Product tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    Description
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Reviews
  </button>
</div>
<div role="tabpanel" id="panel-1">...</div>

<!-- Modal dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm</h2>
</div>
```

---

## Color Contrast

Text and interactive elements must meet minimum contrast ratios against their background.

### WCAG Requirements

| Text Type     | Minimum Ratio | Enhanced Ratio |
|---------------|--------------|----------------|
| Normal text   | 4.5:1        | 7:1            |
| Large text (18px+ bold or 24px+) | 3:1 | 4.5:1  |
| UI components (borders, icons) | 3:1 | -     |

### Calculating Contrast

Contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L is relative luminance.

```css
/* Good contrast: #1e293b on #f8fafc = ~10.5:1 OK */
:root {
  --color-text: #1e293b;
  --color-bg: #f8fafc;
}

/* Good contrast: white text on blue bg */
.button {
  color: #ffffff;    /* on #2563eb = ~4.6:1 OK for normal text */
  background: #2563eb;
}

/* Insufficient contrast: gray on light gray */
.muted-text {
  color: #94a3b8;    /* on #f8fafc = ~3.2:1 FAIL */
}
```

### Quick Reference for Common Combinations

| Background | Text Color     | Ratio | Passes?             |
|------------|----------------|-------|---------------------|
| #ffffff    | #1e293b        | 13.2:1| All text            |
| #f8fafc    | #1e293b        | 10.5:1| All text            |
| #f8fafc    | #64748b        | 4.7:1 | Normal + large text |
| #f8fafc    | #94a3b8        | 3.2:1 | Large text only     |
| #2563eb    | #ffffff        | 4.6:1 | Normal + large text |
| #1e293b    | #f8fafc        | 10.5:1| All text            |

### Testing Contrast

- Use browser DevTools (Elements > Styles > Color picker shows ratio).
- Validate with tools like WebAIM Contrast Checker.
- Do not rely on visual judgment alone.

### Agent Rule

> **Agent rule:** Always test contrast ratios. Never use colors with a ratio below 3:1 for any meaningful content. Text under 18px must meet 4.5:1.

---

## Keyboard Navigation

All interactive elements must be reachable and operable via keyboard.

### Tab Order

```html
<!-- BAD: manual tabindex disrupts flow -->
<button tabindex="3">Save</button>
<button tabindex="1">Cancel</button>
<button tabindex="2">Delete</button>

<!-- GOOD: natural DOM order -->
<div class="actions">
  <button>Cancel</button>
  <button>Delete</button>
  <button>Save</button>
</div>
```

### Tabindex Rules

| Value   | Behavior                           |
|---------|------------------------------------|
| `0`     | Element is focusable in DOM order  |
| `-1`    | Element is programmatically focusable but not in tab order |
| `> 0`   | Avoid. Disrupts natural tab flow  |

### Focus Visible

> **Agent rule:** Never use `outline:none` without a visible alternative.

```css
/* BAD: removes focus indicator */
.button:focus {
  outline: none;
}

/* GOOD: custom focus style */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* BAD: removing default without replacement */
*:focus {
  outline: none;
}

/* GOOD: replacing with visible alternative */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Focus-visible vs Focus

Use `:focus-visible` for keyboard focus and `:focus` as a fallback for older browsers.

```css
/* Modern approach */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Mouse clicks do not show focus ring */
```

### Keyboard Event Handling

```javascript
// BAD: mouse-only interaction
element.addEventListener("click", () => {
  toggleMenu();
});

// GOOD: keyboard accessible
element.addEventListener("click", () => {
  toggleMenu();
});
element.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleMenu();
  }
});
```

Better: use `<button>` which handles Enter and Space natively.

### Keyboard Navigation Checklist

- [ ] Can all interactive elements be reached with Tab?
- [ ] Can all interactive elements be activated with Enter or Space?
- [ ] Is a visible focus indicator shown on all interactive elements?
- [ ] Does tab order match visual order?
- [ ] Are dropdown menus and modals keyboard accessible?
- [ ] Does Escape close modals, dropdowns, and dialogs?

### Common Interactive Patterns

| Pattern      | Expected Keys                              |
|-------------|--------------------------------------------|
| Links       | Tab to focus, Enter to activate            |
| Buttons     | Tab to focus, Enter/Space to activate      |
| Radio group | Arrow keys to change selection             |
| Checkboxes  | Tab to focus, Space to toggle              |
| Select      | Tab to focus, Arrow keys to change         |
| Slider      | Arrow keys to adjust, Home/End for extremes|
| Tab panel   | Tab to enter, Arrow keys to switch tabs    |
| Modal       | Tab cycles within, Escape closes           |

---

## Skip to Content

A skip link lets keyboard users bypass repetitive navigation and jump to the main content.

### The Pattern

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 10000;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  text-decoration: none;
  font-weight: 600;
}

.skip-link:focus {
  top: 0;
}
```

```html
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <header>...</header>
  <main id="main-content">...</main>
</body>
```

How it works: the link is visually hidden off-screen. When focused, it slides into view. Activating it moves focus to `#main-content`.

### What the Packager Does

The Build Pipeline auto-injects a skip-to-content link in every Site. However, you must ensure:
- `<main>` has `id="main-content"`.
- The skip link is the first focusable element on the page.

---

## Forms and Labels

Forms are one of the most common interaction patterns. Every form element needs an accessible label.

### Agent Rule

> **Agent rule:** Every input must have an associated label.

### Correct Labeling

```html
<!-- Explicit label (preferred) -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" required />

<!-- Wrapping label -->
<label>
  Full name
  <input type="text" name="name" required />
</label>

<!-- aria-label (no visible label) -->
<input
  type="search"
  aria-label="Search articles"
  placeholder="Search..."
/>

<!-- aria-labelledby -->
<input
  type="text"
  aria-labelledby="user-location"
/>
<span id="user-location" hidden>Your current city</span>
```

### Required Fields

```css
.required::after {
  content: " *";
  color: var(--color-error);
}
```

```html
<label for="email">
  Email address
  <span class="required" aria-hidden="true">*</span>
</label>
<!-- Screen readers get the info via the required attribute -->
<input
  type="email"
  id="email"
  name="email"
  required
  aria-required="true"
/>
```

### Error Messages

Associate errors with their inputs using `aria-describedby` or `aria-invalid`.

```html
<div class="form-field">
  <label for="password">Password</label>
  <input
    type="password"
    id="password"
    name="password"
    aria-invalid="true"
    aria-describedby="password-error"
    required
  />
  <p id="password-error" class="error" role="alert">
    Password must be at least 8 characters.
  </p>
</div>
```

### Form Field CSS

```css
.form-field {
  margin-bottom: var(--space-4);
}

.form-field label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--color-heading);
}

.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-bg);
  transition: border-color 0.15s ease;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-field input[aria-invalid="true"] {
  border-color: var(--color-error);
}

.form-field .error {
  color: var(--color-error);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

### Validation States

```html
<!-- Valid -->
<div class="form-field">
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    aria-invalid="false"
    aria-describedby="email-success"
  />
  <p id="email-success" class="success">Looks good!</p>
</div>

<!-- Invalid -->
<div class="form-field">
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" class="error" role="alert">
    Please enter a valid email address.
  </p>
</div>
```

---

## Images and Alt Text

Every image must have alt text. The content of the alt text depends on the image's purpose.

### Agent Rule

> **Agent rule:** Every img must have alt text. Decorative images: `alt=""`.

### Alt Text by Image Type

```html
<!-- Informative image -->
<img
  src="chart-revenue.png"
  alt="Revenue grew 40% from Q1 to Q4, reaching $2.4M"
/>

<!-- Decorative image - must have empty alt -->
<img
  src="decorative-border.svg"
  alt=""
  role="presentation"
/>

<!-- Functional image (in a link or button) -->
<a href="/download">
  <img
    src="icon-download.svg"
    alt="Download report"
  />
</a>

<!-- Image with text -->
<img
  src="hero-banner.jpg"
  alt="Hero banner image"
/>
<!-- Do not repeat text from nearby context -->

<!-- Complex image (chart, diagram) -->
<img
  src="architecture-diagram.png"
  alt="System architecture showing three layers: frontend, API, database"
/>
<!-- Also provide a text description nearby or via aria-details -->
```

### Decorative Background Images

Background images in CSS do not need alt text, but the container must be identifiable.

```css
.hero {
  background-image: url("bg-pattern.svg");
  /* No alt text needed - purely decorative */
}
```

---

## Reduced Motion

Some users have vestibular disorders. Animations can cause nausea, dizziness, or pain. Respect their preferences.

### The CSS

```css
/* Default: animations enabled */
@media (prefers-reduced-motion: no-preference) {
  .fade-in {
    animation: fadeIn 0.5s ease forwards;
  }
}

/* Reduced motion: disable or simplify */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Progressive Enhancement

```css
/* Every animation must start from a safe static state */
.element {
  opacity: 1; /* visible without animation */
  transform: none;
}

@media (prefers-reduced-motion: no-preference) {
  .element {
    animation: slideUp 0.4s ease forwards;
  }
}
```

### JavaScript

```javascript
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  // Enable animations
  element.classList.add("animate");
}
```

**Agent rule:** Use CSS for animations. JS only for complex sequences. Always respect `prefers-reduced-motion`.

---

## Screen Reader Only Content

Use the `.sr-only` pattern to provide content that is available to screen readers but visually hidden.

### The Pattern

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### When to Use

```html
<!-- Additional context for screen readers -->
<button>
  <svg><!-- icon --></svg>
  <span class="sr-only">Search</span>
</button>

<!-- Section landmark label -->
<section aria-labelledby="section-title">
  <h2 id="section-title" class="sr-only">Related Articles</h2>
  <!-- content -->
</section>

<!-- Reading order hint -->
<p>
  Read more
  <span class="sr-only">about our accessibility features</span>
</p>

<!-- Status updates -->
<div role="status" class="sr-only">
  <!-- Live region that gets announced -->
</div>
```

### When NOT to Use

```html
<!-- BAD: hiding real content from sighted users -->
Price: <span class="sr-only">$</span>19.99

<!-- BAD: duplicating visible text without reason -->
<button>
  Save <span class="sr-only">Save</span>
</button>
```

---

## Anti-Patterns

### 1. Div Soup

```html
<!-- BAD: no landmarks -->
<div class="wrapper">
  <div class="top-bar">...</div>
  <div class="content-area">...</div>
  <div class="bottom">...</div>
</div>

<!-- GOOD: semantic landmarks -->
<header>...</header>
<main>...</main>
<footer>...</footer>
```

### 2. Broken Heading Hierarchy

```html
<!-- BAD: skipped levels -->
<h1>Page</h1>
<h3>Subsection</h3>
<h5>Detail</h5>

<!-- GOOD: sequential -->
<h1>Page</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### 3. Invisible Focus Indicators

```css
/* BAD: removes focus for all users */
*:focus {
  outline: none;
}

/* BAD: too subtle */
*:focus {
  outline: 1px solid #eee;
}

/* GOOD: visible, distinct */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 4. Missing Form Labels

```html
<!-- BAD: no label -->
<input type="text" placeholder="Your name" />

<!-- BAD: placeholder as label (disappears on input) -->
<input type="email" placeholder="Email address" />

<!-- GOOD: visible, persistent label -->
<label for="email">Email address</label>
<input type="email" id="email" />
```

### 5. Missing or Wrong Alt Text

```html
<!-- BAD: no alt attribute -->
<img src="photo.jpg" />

<!-- BAD: unhelpful alt -->
<img src="chart.png" alt="chart" />

<!-- BAD: redundant alt (says what img already shows) -->
<img src="icon-phone.png" alt="phone icon" />

<!-- GOOD: descriptive -->
<img src="chart.png" alt="Sales increased 25% in Q2" />

<!-- GOOD: decorative -->
<img src="divider.svg" alt="" />
```

### 6. Non-Semantic Buttons

```html
<!-- BAD: div as button -->
<div class="button" onclick="submit()">Submit</div>

<!-- BAD: bare icon -->
<span class="close-icon" onclick="close()">✕</span>

<!-- GOOD: actual button -->
<button type="submit">Submit</button>
<button aria-label="Close">
  <span aria-hidden="true">✕</span>
</button>
```

### 7. Color-Only Cues

```css
/* BAD: relies solely on color */
.error-field {
  border-color: red;
}

/* GOOD: icon + text + color */
.error-field {
  border-color: var(--color-error);
}
```

```html
<!-- BAD: color-only status -->
<span style="color: green">Active</span>

<!-- GOOD: text + color -->
<span style="color: green" role="status">
  <span aria-hidden="true">●</span>
  Active
</span>
```

### 8. No Autocomplete on Forms

```html
<!-- BAD: missing autocomplete -->
<input type="text" name="address" />

<!-- GOOD: autocomplete for user convenience -->
<input
  type="text"
  name="address"
  autocomplete="street-address"
/>
```

### 9. Disabling Zoom

```html
<!-- BAD: prevents zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

<!-- GOOD: allows zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### 10. Focus Traps Without Escape

```javascript
// BAD: modal traps focus but offers no escape
function openModal() {
  focusTrap(modal);
}

// GOOD: provide Escape handler
function openModal() {
  focusTrap(modal);
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}
```

---

## Quick Reference

```
Landmarks:  header, nav, main#main-content, aside, footer
Headings:   h1 (x1) > h2 > h3 > h4 (never skip)
ARIA:       only when native HTML is insufficient
Contrast:   4.5:1 normal, 3:1 large, 3:1 UI
Keyboard:   visible focus, natural tab order, Escape for modals
Skip link:  always the first focusable element
Forms:      every input needs a label (for, wrap, aria-label)
Images:     every img needs alt (descriptive or empty)
Motion:     always respect prefers-reduced-motion
Sr-only:    visually hidden, screen reader accessible
```
