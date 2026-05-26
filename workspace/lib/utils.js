// Web Utility Library — auto-injected into every Site
// DO NOT redeclare any of these exports in your scripts.

// === CSS Reset (auto-applied) ===
// The build pipeline injects: *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// === DOM Utilities ===
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// === Event Utilities ===
export function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle(fn, limit = 100) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// === Modal Manager ===
export function createModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return null;

  const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;

  function open() {
    previousFocus = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    const firstFocusable = modal.querySelector(focusableSelector);
    if (firstFocusable) firstFocusable.focus();
    document.addEventListener('keydown', handleKeyDown);
  }

  function close() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    if (previousFocus) previousFocus.focus();
    document.removeEventListener('keydown', handleKeyDown);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocus(e);
  }

  function trapFocus(e) {
    const focusables = modal.querySelectorAll(focusableSelector);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  return { open, close };
}

// === Form Validator ===
export function validateForm(formElement, rules) {
  const errors = {};
  for (const [fieldName, rule] of Object.entries(rules)) {
    const input = formElement.querySelector(`[name="${fieldName}"]`);
    if (!input) continue;
    const value = input.value.trim();
    if (rule.required && !value) {
      errors[fieldName] = rule.requiredMessage || `${fieldName} is required`;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      errors[fieldName] = rule.patternMessage || `${fieldName} is invalid`;
    } else if (rule.minLength && value.length < rule.minLength) {
      errors[fieldName] = `${fieldName} must be at least ${rule.minLength} characters`;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// === Dark Mode Toggler ===
export function initDarkMode(storageKey = 'theme') {
  const toggle = document.getElementById('darkModeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(storageKey, next);
  });
}

// === Intersection Observer (Lazy Load / Animate) ===
export function observeElements(selector, onEnter, options = {}) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onEnter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, ...options });

  elements.forEach(el => observer.observe(el));
}

// === Smooth Scroll ===
export function smoothScroll(targetSelector, offset = 0) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// === Tabs ===
export function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const triggers = container.querySelectorAll('[data-tab]');
  const panels = container.querySelectorAll('[data-panel]');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const tab = trigger.getAttribute('data-tab');
      triggers.forEach(t => t.setAttribute('aria-selected', 'false'));
      trigger.setAttribute('aria-selected', 'true');
      panels.forEach(p => { p.hidden = p.getAttribute('data-panel') !== tab; });
    });
  });
}

// === Accordion ===
export function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = expanded;
    });
  });
}
