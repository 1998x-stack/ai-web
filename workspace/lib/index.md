# Web Utility Library — API Reference

## DO NOT REDECLARE any of these exports in your scripts.

### DOM Utilities
| Export | Signature | Purpose |
|---|---|---|
| `$` | `(selector, parent?)` | querySelector shorthand |
| `$$` | `(selector, parent?)` | querySelectorAll → array |
| `onReady` | `(fn)` | DOM ready callback |

### Event Utilities
| Export | Signature | Purpose |
|---|---|---|
| `debounce` | `(fn, delay?)` | Debounce function calls |
| `throttle` | `(fn, limit?)` | Throttle function calls |

### UI Components
| Export | Signature | Purpose |
|---|---|---|
| `createModal` | `(modalId)` | Modal with focus trap, Esc close, backdrop click |
| `validateForm` | `(formElement, rules)` | Form validation → {valid, errors} |
| `initDarkMode` | `(storageKey?)` | Dark mode toggle with localStorage persistence |
| `observeElements` | `(selector, onEnter, options?)` | IntersectionObserver for lazy load / scroll animations |
| `smoothScroll` | `(targetSelector, offset?)` | Smooth scroll to element |
| `initTabs` | `(containerSelector)` | Tab panel toggling |
| `initAccordion` | `(containerSelector)` | Accordion panel toggling |
