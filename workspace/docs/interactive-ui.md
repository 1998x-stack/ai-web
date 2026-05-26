# Interactive UI Patterns

A reference for building accessible, responsive interactive components. Every pattern follows progressive enhancement: start with HTML, add CSS for styling, then JavaScript for interactivity.

---

## Table of Contents

1. [Navigation](#navigation)
2. [Forms](#forms)
3. [Modals and Dialogs](#modals-and-dialogs)
4. [Tabs](#tabs)
5. [Accordions](#accordions)
6. [Dark Mode](#dark-mode)
7. [Animations and Motion](#animations-and-motion)
8. [Smooth Scrolling](#smooth-scrolling)
9. [Intersection Observer](#intersection-observer)
10. [Carousels](#carousels)
11. [Anti-Patterns](#anti-patterns)

---

## Navigation

Navigation patterns include sticky headers, hamburger menus, and breadcrumbs.

### Sticky Header

```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-6);
}

/* When scrolled, add shadow */
.header--scrolled {
  box-shadow: var(--shadow-sm);
}
```

```javascript
const header = document.querySelector(".header");
let lastScrollY = 0;

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("header--scrolled");
  } else {
    header.classList.remove("header--scrolled");
  }
}, { passive: true });
```

### Navigation Bar

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.nav__list {
  display: flex;
  gap: var(--space-6);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav__link {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  padding: var(--space-2) 0;
  border-bottom: 2px solid transparent;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.nav__link:hover,
.nav__link:focus-visible {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.nav__link[aria-current="page"] {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
```

### Hamburger Menu Toggle

```css
/* Mobile menu toggle - hidden on desktop */
.nav__toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
}

/* Hamburger icon bars */
.nav__toggle-bar {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.nav__toggle-bar + .nav__toggle-bar {
  margin-top: 6px;
}

/* When open, transform bars into X */
.nav__toggle[aria-expanded="true"] .nav__toggle-bar:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.nav__toggle[aria-expanded="true"] .nav__toggle-bar:nth-child(2) {
  opacity: 0;
}

.nav__toggle[aria-expanded="true"] .nav__toggle-bar:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

@media (max-width: 768px) {
  .nav__toggle {
    display: block;
  }

  .nav__list {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--color-bg);
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-md);
  }

  .nav__list--open {
    display: flex;
  }
}
```

```html
<nav class="nav" aria-label="Main navigation">
  <a href="/" class="nav__logo" aria-label="Home">
    <img src="logo.svg" alt="Site name" />
  </a>

  <button
    class="nav__toggle"
    aria-expanded="false"
    aria-controls="nav-list"
    aria-label="Toggle navigation menu"
  >
    <span class="nav__toggle-bar"></span>
    <span class="nav__toggle-bar"></span>
    <span class="nav__toggle-bar"></span>
  </button>

  <ul class="nav__list" id="nav-list" role="list">
    <li><a href="/" class="nav__link" aria-current="page">Home</a></li>
    <li><a href="/about" class="nav__link">About</a></li>
    <li><a href="/services" class="nav__link">Services</a></li>
    <li><a href="/contact" class="nav__link">Contact</a></li>
  </ul>
</nav>
```

```javascript
const toggle = document.querySelector(".nav__toggle");
const navList = document.querySelector(".nav__list");

toggle.addEventListener("click", () => {
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", !isExpanded);
  navList.classList.toggle("nav__list--open");
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navList.classList.contains("nav__list--open")) {
    toggle.setAttribute("aria-expanded", "false");
    navList.classList.remove("nav__list--open");
    toggle.focus();
  }
});

// Close on click outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav")) {
    toggle.setAttribute("aria-expanded", "false");
    navList.classList.remove("nav__list--open");
  }
});
```

### Breadcrumbs

```css
.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-4);
  font-size: var(--text-sm);
}

.breadcrumbs__item + .breadcrumbs__item::before {
  content: "/";
  margin-right: var(--space-2);
  color: var(--color-text-secondary);
}

.breadcrumbs__link {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.breadcrumbs__link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.breadcrumbs__current {
  color: var(--color-text);
  font-weight: 500;
}
```

```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumbs">
    <li class="breadcrumbs__item">
      <a href="/" class="breadcrumbs__link">Home</a>
    </li>
    <li class="breadcrumbs__item">
      <a href="/guides" class="breadcrumbs__link">Guides</a>
    </li>
    <li class="breadcrumbs__item">
      <span class="breadcrumbs__current" aria-current="page">
        CSS Layout
      </span>
    </li>
  </ol>
</nav>
```

---

## Forms

Forms must be accessible, validate correctly, and provide clear feedback.

### Form with Validation States

```css
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--color-heading);
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-bg);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* Valid state */
.form-input:valid:not(:placeholder-shown) {
  border-color: var(--color-success);
}

/* Invalid state */
.form-input:invalid:not(:placeholder-shown) {
  border-color: var(--color-error);
}

.form-input[aria-invalid="true"] {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-error {
  display: none;
  color: var(--color-error);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.form-input[aria-invalid="true"] ~ .form-error {
  display: block;
}

.form-success {
  display: none;
  color: var(--color-success);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

```html
<form class="form" novalidate>
  <div class="form-group">
    <label class="form-label" for="name">Full Name</label>
    <input
      class="form-input"
      type="text"
      id="name"
      name="name"
      required
      autocomplete="name"
      aria-describedby="name-hint"
    />
    <p class="form-hint" id="name-hint">Enter your first and last name.</p>
    <p class="form-error" id="name-error" role="alert">
      Please enter your name.
    </p>
  </div>

  <div class="form-group">
    <label class="form-label" for="email">Email Address</label>
    <input
      class="form-input"
      type="email"
      id="email"
      name="email"
      required
      autocomplete="email"
    />
    <p class="form-error" id="email-error" role="alert">
      Please enter a valid email address.
    </p>
  </div>

  <div class="form-group">
    <label class="form-label" for="message">Message</label>
    <textarea
      class="form-input"
      id="message"
      name="message"
      rows="4"
      required
    ></textarea>
    <p class="form-error" id="message-error" role="alert">
      Please enter a message.
    </p>
  </div>

  <button class="button button--primary" type="submit">Send Message</button>
</form>
```

```javascript
const form = document.querySelector(".form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputs = form.querySelectorAll("input, textarea, select");
  let isValid = true;

  inputs.forEach((input) => {
    const errorElement = input.parentElement.querySelector(".form-error");

    if (!input.checkValidity()) {
      input.setAttribute("aria-invalid", "true");
      if (errorElement) errorElement.style.display = "block";
      isValid = false;
    } else {
      input.setAttribute("aria-invalid", "false");
      if (errorElement) errorElement.style.display = "none";
    }
  });

  if (isValid) {
    // Show success feedback
    const success = document.createElement("div");
    success.className = "form-success";
    success.setAttribute("role", "status");
    success.textContent = "Form submitted successfully!";
    form.appendChild(success);
  }
});
```

### Agent Rule

> **Agent rule:** Form buttons must have explicit type attribute. Submit buttons: `type="submit"`. Other buttons: `type="button"`.

### Input Types Reference

| Type           | Mobile Keyboard | Validation       |
|----------------|-----------------|------------------|
| `text`         | Default         | None             |
| `email`        | @ keyboard      | Email format     |
| `tel`          | Numeric         | None (use pattern)|
| `url`          | URL keyboard    | URL format       |
| `number`       | Numeric         | Numeric only     |
| `password`     | Default (hidden)| None             |
| `search`       | Default         | None             |
| `date`         | Date picker     | Date format      |
| `time`         | Time picker     | Time format      |

---

## Modals and Dialogs

Modals require focus trapping, Escape to close, backdrop click to close, and proper ARIA attributes.

### Modal CSS

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.modal-overlay--open {
  opacity: 1;
  visibility: visible;
}

.modal {
  background: var(--color-bg);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding: var(--space-6);
  position: relative;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.modal__title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-heading);
}

.modal__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  color: var(--color-text-secondary);
  border-radius: 0.25rem;
  transition: color 0.15s ease;
}

.modal__close:hover {
  color: var(--color-text);
}

.modal__close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.modal__body {
  color: var(--color-text);
  line-height: 1.6;
}

.modal__footer {
  margin-top: var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* Prevent body scroll when modal is open */
body.modal-open {
  overflow: hidden;
}
```

### Modal HTML

```html
<div class="modal-overlay" id="my-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <div class="modal">
    <div class="modal__header">
      <h2 class="modal__title" id="modal-title">Confirm Action</h2>
      <button
        class="modal__close"
        aria-label="Close dialog"
        data-modal-close
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="modal__body">
      <p>Are you sure you want to delete this item? This action cannot be undone.</p>
    </div>
    <div class="modal__footer">
      <button class="button button--ghost" data-modal-close type="button">Cancel</button>
      <button class="button button--danger" type="button">Delete</button>
    </div>
  </div>
</div>

<button class="button button--primary" data-modal-trigger="my-modal" type="button">
  Open Modal
</button>
```

### Modal JavaScript

```javascript
class Modal {
  constructor(overlay) {
    this.overlay = overlay;
    this.modal = overlay.querySelector(".modal");
    this.closeButtons = overlay.querySelectorAll("[data-modal-close]");
    this.previouslyFocused = null;
    this.focusableElements = null;
    this.firstFocusable = null;
    this.lastFocusable = null;

    this.init();
  }

  init() {
    this.closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) this.close();
      if (e.key === "Tab" && this.isOpen()) this.trapFocus(e);
    });
  }

  open() {
    this.previouslyFocused = document.activeElement;
    this.overlay.hidden = false;
    this.overlay.classList.add("modal-overlay--open");
    document.body.classList.add("modal-open");

    this.focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    this.firstFocusable?.focus();
  }

  close() {
    this.overlay.classList.remove("modal-overlay--open");
    this.overlay.hidden = true;
    document.body.classList.remove("modal-open");
    this.previouslyFocused?.focus();
  }

  isOpen() {
    return !this.overlay.hidden;
  }

  trapFocus(e) {
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }
}

// Initialize modals
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  const modal = new Modal(overlay);
  const trigger = document.querySelector(
    `[data-modal-trigger="${overlay.id}"]`
  );
  trigger?.addEventListener("click", () => modal.open());
});
```

### Modal Requirements Checklist

- [ ] `role="dialog"` and `aria-modal="true"` on the overlay.
- [ ] `aria-labelledby` pointing to the modal title.
- [ ] Focus trapped inside the modal while open.
- [ ] Escape key closes the modal.
- [ ] Clicking backdrop closes the modal.
- [ ] Focus returns to the trigger element on close.
- [ ] Body scroll is disabled when modal is open.
- [ ] Close button has `aria-label` for screen readers.

---

## Tabs

Tabs organize content into switchable panels. They need proper ARIA roles for screen reader navigation.

### Tabs CSS

```css
.tab-list {
  display: flex;
  gap: var(--space-1);
  border-bottom: 2px solid var(--color-border);
  list-style: none;
  margin: 0;
  padding: 0;
}

.tab {
  background: none;
  border: none;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.tab:hover {
  color: var(--color-text);
}

.tab[aria-selected="true"] {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.tab-panel {
  padding: var(--space-6) 0;
}

.tab-panel[hidden] {
  display: none;
}
```

### Tabs HTML

```html
<div class="tabs">
  <div class="tab-list" role="tablist" aria-label="Product information">
    <button
      class="tab"
      role="tab"
      aria-selected="true"
      aria-controls="panel-description"
      id="tab-description"
      type="button"
    >
      Description
    </button>
    <button
      class="tab"
      role="tab"
      aria-selected="false"
      aria-controls="panel-specs"
      id="tab-specs"
      type="button"
    >
      Specifications
    </button>
    <button
      class="tab"
      role="tab"
      aria-selected="false"
      aria-controls="panel-reviews"
      id="tab-reviews"
      type="button"
    >
      Reviews
    </button>
  </div>

  <div
    class="tab-panel"
    role="tabpanel"
    id="panel-description"
    aria-labelledby="tab-description"
  >
    <p>Product description content...</p>
  </div>

  <div
    class="tab-panel"
    role="tabpanel"
    id="panel-specs"
    aria-labelledby="tab-specs"
    hidden
  >
    <p>Product specifications...</p>
  </div>

  <div
    class="tab-panel"
    role="tabpanel"
    id="panel-reviews"
    aria-labelledby="tab-reviews"
    hidden
  >
    <p>Customer reviews...</p>
  </div>
</div>
```

### Tabs JavaScript

```javascript
class Tabs {
  constructor(container) {
    this.tablist = container.querySelector("[role='tablist']");
    this.tabs = this.tablist.querySelectorAll("[role='tab']");
    this.panels = container.querySelectorAll("[role='tabpanel']");
    this.init();
  }

  init() {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.activateTab(tab));
    });

    this.tablist.addEventListener("keydown", (e) => {
      const currentIndex = Array.from(this.tabs).indexOf(
        this.tablist.querySelector('[aria-selected="true"]')
      );
      let newIndex;

      if (e.key === "ArrowRight") {
        newIndex = (currentIndex + 1) % this.tabs.length;
      } else if (e.key === "ArrowLeft") {
        newIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = this.tabs.length - 1;
      }

      if (newIndex !== undefined) {
        e.preventDefault();
        this.activateTab(this.tabs[newIndex]);
        this.tabs[newIndex].focus();
      }
    });
  }

  activateTab(tab) {
    this.tabs.forEach((t) => {
      t.setAttribute("aria-selected", "false");
    });
    tab.setAttribute("aria-selected", "true");

    this.panels.forEach((panel) => {
      panel.hidden = true;
    });
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (panel) panel.hidden = false;
  }
}

document.querySelectorAll(".tabs").forEach((container) => new Tabs(container));
```

---

## Accordions

Accordions expand and collapse sections of content. They use `aria-expanded` and `aria-controls` for accessibility.

### Accordion CSS

```css
.accordion {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.accordion__item + .accordion__item {
  border-top: 1px solid var(--color-border);
}

.accordion__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-4);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-heading);
  text-align: left;
  transition: background 0.15s ease;
}

.accordion__trigger:hover {
  background: var(--color-bg-alt);
}

.accordion__trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.accordion__icon {
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.accordion__trigger[aria-expanded="true"] .accordion__icon {
  transform: rotate(180deg);
}

.accordion__content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion__content-inner {
  padding: 0 var(--space-4) var(--space-4);
  color: var(--color-text);
  line-height: 1.6;
}

.accordion__content--open {
  max-height: 500px; /* Set to a value larger than content */
}
```

### Accordion HTML

```html
<div class="accordion">
  <div class="accordion__item">
    <h3>
      <button
        class="accordion__trigger"
        aria-expanded="false"
        aria-controls="accordion-panel-1"
        id="accordion-header-1"
        type="button"
      >
        <span>What is AI Web Studio?</span>
        <svg class="accordion__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      </button>
    </h3>
    <div
      class="accordion__content"
      id="accordion-panel-1"
      role="region"
      aria-labelledby="accordion-header-1"
    >
      <div class="accordion__content-inner">
        <p>AI Web Studio is a platform that generates single-file websites through AI chat conversations. Describe what you want, and the AI builds it.</p>
      </div>
    </div>
  </div>

  <div class="accordion__item">
    <h3>
      <button
        class="accordion__trigger"
        aria-expanded="false"
        aria-controls="accordion-panel-2"
        id="accordion-header-2"
        type="button"
      >
        <span>Do I need coding experience?</span>
        <svg class="accordion__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      </button>
    </h3>
    <div
      class="accordion__content"
      id="accordion-panel-2"
      role="region"
      aria-labelledby="accordion-header-2"
    >
      <div class="accordion__content-inner">
        <p>No. You describe what you want in natural language, and the AI generates the website for you. No coding required.</p>
      </div>
    </div>
  </div>
</div>
```

### Accordion JavaScript

```javascript
class Accordion {
  constructor(container) {
    this.items = container.querySelectorAll(".accordion__item");
    this.init();
  }

  init() {
    this.items.forEach((item) => {
      const trigger = item.querySelector(".accordion__trigger");
      const content = item.querySelector(".accordion__content");

      trigger?.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", !isOpen);
        content?.classList.toggle("accordion__content--open");
      });

      trigger?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  }
}

document.querySelectorAll(".accordion").forEach((container) => {
  new Accordion(container);
});
```

---

## Dark Mode

Support dark mode using the user's system preference with manual override via `localStorage`.

### CSS

```css
/* Default to system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-bg-alt: #1e293b;
    --color-text: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-text-inverse: #0f172a;
    --color-heading: #f8fafc;
    --color-border: #334155;
    --color-border-hover: #475569;
    --color-primary: #3b82f6;
    --color-primary-hover: #60a5fa;
  }
}

/* Manual override via data-theme attribute */
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-alt: #1e293b;
  --color-text: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-inverse: #0f172a;
  --color-heading: #f8fafc;
  --color-border: #334155;
  --color-border-hover: #475569;
  --color-primary: #3b82f6;
  --color-primary-hover: #60a5fa;
}

[data-theme="light"] {
  --color-bg: #f8fafc;
  --color-bg-alt: #f1f5f9;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-inverse: #f8fafc;
  --color-heading: #0f172a;
  --color-border: #e2e8f0;
  --color-border-hover: #cbd5e1;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
}
```

### JavaScript

```javascript
const themeToggle = document.querySelector("[data-theme-toggle]");
const storedTheme = localStorage.getItem("theme");

// Apply stored preference (overrides system)
if (storedTheme) {
  document.documentElement.setAttribute("data-theme", storedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.setAttribute("data-theme", "dark");
}

themeToggle?.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Listen for system preference changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
    }
  });
```

### Theme Toggle Button

```html
<button
  class="button button--ghost"
  data-theme-toggle
  type="button"
  aria-label="Toggle dark mode"
>
  <span aria-hidden="true" data-theme-icon>🌙</span>
</button>
```

---

## Animations and Motion

Animations should enhance the experience without causing distraction or discomfort.

### Agent Rule

> **Agent rule:** Use CSS for animations. JS only for complex sequences. Always respect prefers-reduced-motion.

### CSS Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animation utility classes */
@media (prefers-reduced-motion: no-preference) {
  .animate-fade-in {
    animation: fadeIn 0.5s ease forwards;
  }

  .animate-slide-up {
    animation: slideUp 0.4s ease forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.3s ease forwards;
  }
}
```

### Animation Delays (Stagger)

```css
@media (prefers-reduced-motion: no-preference) {
  .stagger-children > *:nth-child(1) { animation-delay: 0ms; }
  .stagger-children > *:nth-child(2) { animation-delay: 100ms; }
  .stagger-children > *:nth-child(3) { animation-delay: 200ms; }
  .stagger-children > *:nth-child(4) { animation-delay: 300ms; }
  .stagger-children > *:nth-child(5) { animation-delay: 400ms; }
}
```

### Transition Patterns

```css
/* Hover lift effect */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* Underline animation on links */
.nav__link::after {
  content: "";
  display: block;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.nav__link:hover::after {
  width: 100%;
}
```

### Animation Guidelines

- Duration: 200-500ms for UI animations, 500-1000ms for emphasis.
- Easing: use `ease-out` for entrances, `ease-in-out` for transitions.
- Avoid animating `width`, `height`, `top`, `left` (triggers layout). Prefer `transform` and `opacity`.
- Never animate elements that are not visible yet (use Intersection Observer).

---

## Smooth Scrolling

Enable smooth scrolling for anchor links and scroll-triggered actions.

### CSS

```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

### Scroll to Section

```javascript
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Usage
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const id = anchor.getAttribute("href").slice(1);
    scrollToSection(id);
  });
});
```

### Scroll Margin for Sticky Headers

When scrolling to an anchor, the sticky header can cover the target. Use `scroll-margin-top`:

```css
section[id] {
  scroll-margin-top: 80px; /* Height of sticky header */
}
```

---

## Intersection Observer

Use Intersection Observer for scroll-triggered animations and infinite scroll. The utility library `observeElements` wraps this.

### Using observeElements (Recommended)

```javascript
// Observe elements for entrance animations
observeElements(".animate-on-scroll", (entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add("visible");
  }
});

// Observe elements only once
observeElements(".animate-once", (entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add("visible");
    return true; // Unobserve after first intersection
  }
});

// Observe with custom threshold
observeElements(".lazy-section", (entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add("loaded");
    return true;
  }
}, { threshold: 0.2 });
```

### Fallback Implementation

```javascript
function observeElements(selector, callback, options = {}) {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

  // No IntersectionObserver support: just show everything
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => {
      callback({ isIntersecting: true, target: el });
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const shouldUnobserve = callback(entry);
      if (shouldUnobserve) {
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: options.threshold || 0.1,
    rootMargin: options.rootMargin || "0px 0px -50px 0px",
  });

  elements.forEach((el) => observer.observe(el));
}
```

### HTML + CSS for Scroll Animations

```html
<div class="feature-card animate-on-scroll">
  <h3>Feature Title</h3>
  <p>Feature description...</p>
</div>
```

```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
  }
}
```

---

## Carousels

For most cases, use CSS scroll-snap instead of JavaScript carousels. It is simpler, more performant, and accessible.

### CSS Scroll-Snap Carousel

```css
.carousel {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  padding-bottom: var(--space-4);
}

.carousel__slide {
  flex: 0 0 300px;
  scroll-snap-align: start;
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
}

/* Hide scrollbar on container (optional) */
.carousel::-webkit-scrollbar {
  height: 6px;
}

.carousel::-webkit-scrollbar-track {
  background: var(--color-bg-alt);
  border-radius: 3px;
}

.carousel::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}
```

### Carousel HTML

```html
<div class="carousel" role="list" aria-label="Featured items">
  <article class="carousel__slide" role="listitem">
    <h3>Item 1</h3>
    <p>Description of item 1.</p>
  </article>
  <article class="carousel__slide" role="listitem">
    <h3>Item 2</h3>
    <p>Description of item 2.</p>
  </article>
  <article class="carousel__slide" role="listitem">
    <h3>Item 3</h3>
    <p>Description of item 3.</p>
  </article>
  <article class="carousel__slide" role="listitem">
    <h3>Item 4</h3>
    <p>Description of item 4.</p>
  </article>
</div>
```

### JavaScript Carousel (for auto-play or controls)

```javascript
class Carousel {
  constructor(container) {
    this.container = container;
    this.slides = container.querySelectorAll(".carousel__slide");
    this.currentIndex = 0;
    this.initControls();
  }

  initControls() {
    const prevBtn = this.container
      .closest(".carousel-wrapper")
      ?.querySelector("[data-carousel-prev]");
    const nextBtn = this.container
      .closest(".carousel-wrapper")
      ?.querySelector("[data-carousel-next]");

    prevBtn?.addEventListener("click", () => this.prev());
    nextBtn?.addEventListener("click", () => this.next());
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.slides.length - 1;
    }
    this.slides[this.currentIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.slides[this.currentIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
}
```

---

## Anti-Patterns

### 1. Missing Button Types

```html
<!-- BAD: defaults to type="submit" inside a form -->
<button>Click me</button>

<!-- GOOD: explicit type -->
<button type="button">Click me</button>
<button type="submit">Submit</button>
```

### 2. Non-Accessible Modals

```html
<!-- BAD: no ARIA, no focus trap -->
<div class="modal" id="modal">
  <p>Content</p>
</div>

<!-- GOOD: proper dialog pattern -->
<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal">
    <h2 id="modal-title">Title</h2>
    <p>Content</p>
    <button type="button" data-modal-close>Close</button>
  </div>
</div>
```

### 3. Mouse-Only Interactions

```javascript
// BAD: only responds to click
element.addEventListener("click", toggle);

// GOOD: keyboard accessible
element.addEventListener("click", toggle);
element.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggle();
  }
});
```

### 4. Animating Layout Properties

```css
/* BAD: triggers layout on every frame */
.element {
  transition: width 0.3s ease, height 0.3s ease, left 0.3s ease;
}

/* GOOD: only composite */
.element {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

### 5. Motion Without Consent

```css
/* BAD: no reduced motion check */
.element {
  animation: spin 2s linear infinite;
}

/* GOOD: respects user preference */
@media (prefers-reduced-motion: no-preference) {
  .element {
    animation: spin 2s linear infinite;
  }
}
```

### 6. Broken Focus Management

```javascript
// BAD: focus is lost after modal closes
function closeModal() {
  modal.hidden = true;
  // focus not restored
}

// GOOD: restore focus to trigger
function closeModal() {
  modal.hidden = true;
  trigger.focus();
}
```

### 7. No Loading States

```html
<!-- BAD: no feedback during form submission -->
<button type="submit">Submit</button>

<!-- GOOD: loading state -->
<button type="submit" data-loading>
  <span class="button__text">Submit</span>
  <span class="button__spinner" hidden>
    <span class="sr-only">Submitting...</span>
  </span>
</button>
```

```css
.button[data-loading="true"] .button__text { display: none; }
.button[data-loading="true"] .button__spinner { display: inline-block; }
```

### 8. Accordions Without ARIA

```html
<!-- BAD: no ARIA attributes -->
<div class="accordion-item">
  <div class="accordion-header" onclick="toggle()">Title</div>
  <div class="accordion-body">Content</div>
</div>

<!-- GOOD: proper ARIA -->
<h3>
  <button
    aria-expanded="false"
    aria-controls="panel-1"
    type="button"
  >
    Title
  </button>
</h3>
<div id="panel-1" role="region" aria-labelledby="header-1">
  Content
</div>
```

### 9. Tabs Without Keyboard Support

```javascript
// BAD: only supports click
tabs.forEach(tab => {
  tab.addEventListener("click", activate);
});

// GOOD: Arrow keys for navigation
tablist.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    // switch tabs
  }
});
```

### 10. Carousels Without Scroll-Snap

```css
/* BAD: free scrolling, no snap */
.carousel {
  overflow-x: auto;
}

/* GOOD: snap to slides */
.carousel {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.carousel__slide {
  scroll-snap-align: start;
}
```

---

## Quick Reference

```
Navigation: sticky header + hamburger + breadcrumbs
Forms:      explicit labels, validation states, error messages
Modals:     focus trap, Escape, backdrop click, aria-modal
Tabs:       aria-selected, arrow keys, hidden panels
Accordions: aria-expanded, aria-controls, smooth transitions
Dark mode:  prefers-color-scheme + localStorage + data-theme
Animations: CSS only, transform/opacity, respect reduced motion
Scroll:     scroll-behavior: smooth, scroll-margin-top
Observer:   observeElements utility for scroll animations
Carousels:  CSS scroll-snap preferred over JS
```
