# SEO and Performance

Every generated Site must be optimized for search engines and load fast. SEO and performance are intertwined: fast Sites rank better, and semantic markup helps search engines understand content.

---

## Table of Contents

1. [Meta Tags](#meta-tags)
2. [Heading Structure](#heading-structure)
3. [Semantic Structure for Search Engines](#semantic-structure-for-search-engines)
4. [Structured Data (JSON-LD)](#structured-data-json-ld)
5. [Canonical URLs](#canonical-urls)
6. [Lazy Loading](#lazy-loading)
7. [Font Optimization](#font-optimization)
8. [Resource Hints](#resource-hints)
9. [Viewport Meta](#viewport-meta)
10. [Performance Best Practices](#performance-best-practices)
11. [Anti-Patterns](#anti-patterns)

---

## Meta Tags

Meta tags tell search engines what the page is about. They influence how your page appears in search results.

### Required Meta Tags

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Title - most important SEO element -->
  <title>Page Title | Site Name</title>

  <!-- Description - appears in search results -->
  <meta
    name="description"
    content="Learn how to build beautiful single-file websites with AI. No setup, no build tools, no hassle."
  />

  <!-- Open Graph - controls how links appear on social platforms -->
  <meta property="og:title" content="Page Title | Site Name" />
  <meta
    property="og:description"
    content="Learn how to build beautiful single-file websites with AI."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://example.com/page" />
  <meta property="og:image" content="https://example.com/og-image.jpg" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

### Title Tag Rules

```html
<!-- GOOD: descriptive, includes brand -->
<title>Build Beautiful Sites | AI Web Studio</title>

<!-- BAD: too generic -->
<title>Home</title>

<!-- BAD: keyword stuffing -->
<title>best website builder, create website, AI website generator</title>

<!-- BAD: too long (over 60 chars gets truncated) -->
<title>This is a very long title that will get truncated in search results definitely</title>
```

### What the Packager Auto-Injects

The Build Pipeline automatically generates and injects:

| Meta Tag           | Source                                 |
|-------------------|----------------------------------------|
| `<title>`         | Extracted from the page's first `<h1>` |
| `<meta name="description">` | Extracted from the first `<p>` after `<h1>` |
| `<meta property="og:title">` | Same as `<title>`               |
| `<meta property="og:description">` | Same as `description`    |
| `<meta property="og:type">` | Always `website`               |
| `<meta charset>`  | Always `UTF-8`                        |
| `<meta name="viewport">` | Always responsive configuration |

You don't need to write these manually. But the page **must** have:
- Exactly one `<h1>` near the top of `<main>`.
- A `<p>` element immediately after the `<h1>` for the description.

### Agent Rule

> **Agent rule:** Use exactly one h1 per page. Heading hierarchy must be sequential.

### Customizing Auto-Injected Meta

If you need custom meta tags that differ from the auto-generated ones, place them in the `<head>` directly. The packager will not overwrite manually specified tags.

```html
<head>
  <!-- Custom title will be preserved -->
  <title>My Custom Title | Brand</title>
  <meta name="description" content="Custom description." />
</head>
```

---

## Heading Structure

Search engines use headings to understand page structure and content hierarchy.

### Correct Heading Hierarchy

```html
<main id="main-content">
  <h1>Complete Guide to Web Development</h1>

  <h2>Getting Started</h2>
  <p>Begin your journey here...</p>

  <h3>Prerequisites</h3>
  <p>What you need to know first...</p>

  <h3>Setting Up</h3>
  <p>Environment setup steps...</p>

  <h2>Intermediate Topics</h2>
  <p>Dive deeper into...</p>

  <h3>CSS Layouts</h3>
  <p>Flexbox and Grid...</p>

  <h3>JavaScript Basics</h3>
  <p>Variables and functions...</p>
</main>
```

### Why Search Engines Care

- Google uses headings to generate page sections in search results.
- Headings create a document outline that affects content understanding.
- Proper hierarchy signals topic relevance and content depth.

### Heading Length

```html
<!-- GOOD: descriptive but concise -->
<h2>Getting Started with CSS Grid</h2>

<!-- BAD: too short, no information -->
<h2>Intro</h2>

<!-- BAD: too long, keyword stuffing -->
<h2>Best CSS Grid Tutorial for Beginners Learn CSS Grid Layout in 2024 Complete Guide</h2>
```

**Agent rule:** Keep headings under 70 characters. Make each heading descriptive enough that a reader scanning from h2 to h2 understands the page structure.

---

## Semantic Structure for Search Engines

Search engines parse HTML structure. Semantic elements help them identify the page's parts.

### The Full Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Product Name | Brand</title>
  <meta name="description" content="Product description." />
</head>
<body>
  <header>
    <a href="/" aria-label="Home">
      <img src="logo.svg" alt="Brand Name" />
    </a>
    <nav aria-label="Main">
      <ul>
        <li><a href="/features">Features</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <h1>Product Name</h1>
    <p>Short description of the product.</p>

    <section aria-labelledby="features-heading">
      <h2 id="features-heading">Features</h2>
      <!-- feature cards -->
    </section>

    <section aria-labelledby="pricing-heading">
      <h2 id="pricing-heading">Pricing</h2>
      <!-- pricing table -->
    </section>
  </main>

  <aside>
    <h2>Related Resources</h2>
    <!-- sidebar content -->
  </aside>

  <footer>
    <p>&copy; 2024 Brand Name. All rights reserved.</p>
  </footer>
</body>
</html>
```

### Search Engine Benefits

| Element     | SEO Benefit                                 |
|-------------|--------------------------------------------|
| `<header>`  | Identifies site identity, navigation       |
| `<nav>`     | Distinguishes navigation from content      |
| `<main>`    | Marks primary content for ranking          |
| `<section>` | Groups related content by topic            |
| `<article>` | Identifies self-contained content          |
| `<aside>`   | Separates supplementary from primary       |
| `<footer>`  | Site info, copyright, secondary links      |

### Linking Best Practices

```html
<!-- GOOD: descriptive link text -->
<a href="/guides/css-layout">CSS Layout Guide</a>

<!-- BAD: generic link text -->
<a href="/guides/css-layout">Click here</a>
<a href="/guides/css-layout">Read more</a>

<!-- GOOD: contextual links -->
<p>
  Learn how to create responsive layouts in our
  <a href="/guides/css-layout">CSS Layout Guide</a>.
</p>

<!-- GOOD: internal links use relative paths -->
<a href="/features">Features</a>
<a href="/pricing">Pricing</a>

<!-- External links should use full URLs -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Example</a>
```

---

## Structured Data (JSON-LD)

Structured data helps search engines understand your content and enables rich search results (rich snippets, knowledge panels).

### Article

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Getting Started with CSS Grid",
  "description": "A beginner's guide to CSS Grid layout.",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-03-20",
  "image": "https://example.com/images/css-grid-guide.jpg"
}
</script>
```

### Product

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "AI Web Studio Pro",
  "description": "Professional AI-powered website builder.",
  "brand": {
    "@type": "Brand",
    "name": "AI Web Studio"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "124"
  }
}
</script>
```

### Organization

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Web Studio",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/aiwebstudio",
    "https://github.com/aiwebstudio"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-123-4567",
    "contactType": "customer service"
  }
}
</script>
```

### BreadcrumbList

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Guides",
      "item": "https://example.com/guides"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "CSS Layout",
      "item": "https://example.com/guides/css-layout"
    }
  ]
}
</script>
```

### FAQPage

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AI Web Studio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI Web Studio is a platform that generates single-file websites through AI chat."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need coding experience?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Describe what you want and the AI builds it."
      }
    }
  ]
}
</script>
```

### When to Use Each Type

| Page Type             | Schema Type         | Rich Result                         |
|----------------------|---------------------|--------------------------------------|
| Blog post / guide    | `Article`           | Top story, headline                  |
| Product page         | `Product`           | Price, rating, availability          |
| About page           | `Organization`      | Knowledge panel                      |
| Documentation        | `TechArticle`       | Developer snippet                    |
| FAQ page             | `FAQPage`           | Expandable FAQ in search             |
| Recipe               | `Recipe`            | Image, time, rating                  |
| Event                | `Event`             | Date, location in search             |
| Breadcrumbs          | `BreadcrumbList`    | Breadcrumb path in search            |

**Agent rule:** Include at least one JSON-LD structured data block on every page. Match the schema type to the page's primary content.

---

## Canonical URLs

Canonical URLs tell search engines which version of a page is the authoritative one. This prevents duplicate content issues.

### What the Packager Does

The Build Pipeline auto-injects a canonical URL based on the Site's filename.

```html
<link rel="canonical" href="https://example.com/my-page" />
```

### When to Override

If the same content appears at multiple URLs, set a custom canonical:

```html
<head>
  <link rel="canonical" href="https://example.com/primary-url" />
</head>
```

### Canonical Rules

- Every page should have a canonical URL.
- Self-referencing canonicals are fine (page pointing to itself).
- Use absolute URLs, not relative.
- Use lowercase URLs consistently.
- Avoid chaining canonicals (page A -> page B -> page C).

---

## Lazy Loading

Defer loading of non-critical resources until they are needed. This reduces initial page weight and speeds up first paint.

### Images

```html
<!-- Above the fold: load immediately -->
<img
  src="hero.jpg"
  alt="Hero image"
  fetchpriority="high"
/>

<!-- Below the fold: lazy load -->
<img
  src="gallery-photo-1.jpg"
  alt="Gallery photo description"
  loading="lazy"
  decoding="async"
/>

<!-- Using srcset for responsive images -->
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="Responsive image example"
  loading="lazy"
  decoding="async"
/>
```

### Lazy Loading Rules

| Attribute       | Usage                                  |
|-----------------|----------------------------------------|
| `loading="lazy"`| Images below the fold                  |
| `loading="eager"`| Above the fold, critical images      |
| `fetchpriority="high"`| Hero image, LCP element       |
| `decoding="async"`| Offload decoding (all images)       |

### iframes

```html
<iframe
  src="https://example.com/embed"
  title="Embedded content"
  loading="lazy"
  allowfullscreen
></iframe>
```

**Agent rule:** Use `loading="lazy"` for any image or iframe that is not in the initial viewport. Hero images should not be lazy loaded.

---

## Font Optimization

Custom fonts can significantly impact page load time. Optimize them aggressively.

### Font Display

```css
@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Show fallback text immediately */
}

@font-face {
  font-family: "Inter";
  src: url("fonts/Inter-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### System Font Fallback

```css
body {
  /* System fonts load instantly - zero network cost */
  font-family: "Inter", system-ui, -apple-system, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

### Preload Critical Fonts

```html
<link
  rel="preload"
  href="fonts/Inter-Regular.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### Font Optimization Checklist

- [ ] Use `font-display: swap` on all `@font-face` declarations.
- [ ] Prefer WOFF2 format (smallest file size).
- [ ] Preload only above-the-fold fonts.
- [ ] Subset fonts to include only needed characters.
- [ ] Use system fonts as fallback in the font stack.
- [ ] Limit to 2-3 font families per page.

**Agent rule:** Always include system UI fonts as fallback in the `font-family` declaration. Never load more than three font families.

---

## Resource Hints

Resource hints tell the browser about resources it should connect to or fetch early.

### Preconnect

Opens a connection to an origin before the browser discovers the resource.

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Analytics -->
<link rel="preconnect" href="https://analytics.example.com" />
```

### Prefetch

Fetches a resource for a likely future navigation.

```html
<link rel="prefetch" href="/next-page" as="document" />
```

### Preload

Fetches a critical resource for the current page urgently.

```html
<link rel="preload" href="hero.webp" as="image" />
<link rel="preload" href="critical.css" as="style" />
<link rel="preload" href="Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

### DNS-Prefetch

For older browser support, resolves domain names early.

```html
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

### When to Use Each

| Hint        | When                                    |
|-------------|-----------------------------------------|
| `preconnect`| Third-party origins (fonts, APIs)       |
| `prefetch`  | Next-page resources (user likely to click) |
| `preload`   | Critical above-the-fold resources       |
| `dns-prefetch`| Fallback for preconnect on old browsers|

---

## Viewport Meta

The viewport meta tag ensures proper rendering on mobile devices.

### What the Packager Does

The Build Pipeline auto-injects this tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Do Not Override

```html
<!-- BAD: prevents zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

<!-- GOOD: allows user zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Why It Matters

- Without this tag, mobile browsers render the page at desktop width and then scale it down.
- This causes small text and requires users to double-tap to zoom.
- It is a requirement for Google's mobile-first indexing.

---

## Performance Best Practices

### Minimize DOM Depth

Deeply nested HTML creates heavy render trees and slows down the browser.

```html
<!-- BAD: deep nesting -->
<div class="wrapper">
  <div class="container">
    <div class="inner">
      <div class="content">
        <p>Text</p>
      </div>
    </div>
  </div>
</div>

<!-- GOOD: flat structure -->
<div class="content">
  <p>Text</p>
</div>
```

```css
/* BAD: requires deep DOM for styling */
.wrapper > .container > .inner > .content p { ... }

/* GOOD: minimal selectors */
.content p { ... }
```

### Avoid Layout Thrashing

Layout thrashing happens when JavaScript reads layout properties and then writes them, forcing repeated layouts.

```javascript
// BAD: layout thrashing (read-write-read-write cycle)
const width = element.clientWidth;  // read
element.style.width = width + "px"; // write
const height = element.clientHeight; // read
element.style.height = height + "px"; // write

// GOOD: batch reads, then batch writes
const width = element.clientWidth;
const height = element.clientHeight;
element.style.width = width + "px";
element.style.height = height + "px";
```

### Batch DOM Operations

```javascript
// BAD: multiple individual operations
for (const item of items) {
  document.body.appendChild(item); // triggers layout each time
}

// GOOD: use DocumentFragment
const fragment = document.createDocumentFragment();
for (const item of items) {
  fragment.appendChild(item);
}
document.body.appendChild(fragment); // single layout
```

### Avoid Render-Blocking Resources

```html
<!-- BAD: CSS loads synchronously before content -->
<link rel="stylesheet" href="styles.css" />

<!-- GOOD: inline critical CSS, defer non-critical -->
<style>
  /* Critical above-the-fold styles */
  .hero { ... }
  .header { ... }
</style>
<link
  rel="stylesheet"
  href="non-critical.css"
  media="print"
  onload="this.media='all'"
/>
```

### Image Optimization

```css
/* Prevent layout shift */
img, video, iframe {
  max-width: 100%;
  height: auto;
}

/* Set explicit dimensions for CLS prevention */
img {
  width: 800px;
  height: 600px;
}
```

### Content Visibility

```css
/* Defer rendering of off-screen content */
.section-below-fold {
  content-visibility: auto;
  contain-intrinsic-size: 500px; /* placeholder height */
}
```

### Performance Checklist

- [ ] Keep DOM depth under 10 levels.
- [ ] No layout thrashing in JavaScript.
- [ ] Images have explicit width and height.
- [ ] Fonts use `font-display: swap`.
- [ ] Non-critical images use `loading="lazy"`.
- [ ] Avoid multiple stylesheets (inline critical CSS).
- [ ] Use modern image formats (WebP, AVIF).
- [ ] CSS selectors are no more than 3 levels deep.

---

## Anti-Patterns

### 1. Missing or Duplicate `<h1>`

```html
<!-- BAD: no h1 -->
<div class="title">Welcome</div>

<!-- BAD: multiple h1s -->
<h1>Section 1</h1>
<h1>Section 2</h1>

<!-- GOOD: exactly one h1 -->
<h1>Welcome to Our Site</h1>
```

### 2. Missing Meta Description

```html
<!-- BAD: no description -->
<head>
  <title>Page Title</title>
</head>

<!-- GOOD: concise, relevant description -->
<head>
  <title>Page Title</title>
  <meta name="description" content="A concise summary of the page content." />
</head>
```

### 3. Generic Link Text

```html
<!-- BAD: search engines lose context -->
<p>Read more about our features <a href="/features">here</a>.</p>

<!-- GOOD: descriptive link text -->
<p>
  <a href="/features">Explore our features</a> to see what we offer.
</p>
```

### 4. Not Using Structured Data

```html
<!-- BAD: no JSON-LD for a product page -->
<h1>Super Widget</h1>
<p>$29.99</p>

<!-- GOOD: product has structured data -->
<h1>Super Widget</h1>
<p>$29.99</p>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Super Widget",
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD"
  }
}
</script>
```

### 5. Eager Loading Everything

```html
<!-- BAD: all images loaded immediately -->
<img src="hero.jpg" loading="eager" />
<img src="gallery-1.jpg" loading="eager" />
<img src="gallery-2.jpg" loading="eager" />
<img src="gallery-3.jpg" loading="eager" />

<!-- GOOD: lazy load below-fold -->
<img src="hero.jpg" loading="eager" fetchpriority="high" />
<img src="gallery-1.jpg" loading="lazy" />
<img src="gallery-2.jpg" loading="lazy" />
```

### 6. Deeply Nested DOM

```html
<!-- BAD: 15 levels of divs -->
<div><div><div><div><div><div><div><p>Text</p></div></div></div></div></div></div></div>

<!-- GOOD: flat and semantic -->
<p>Text</p>
```

### 7. Render-Blocking JavaScript

```html
<!-- BAD: blocks rendering -->
<script src="analytics.js"></script>

<!-- GOOD: non-blocking -->
<script src="analytics.js" defer></script>
<script src="chat-widget.js" async></script>
```

### 8. Missing Image Dimensions

```html
<!-- BAD: no dimensions cause layout shift -->
<img src="photo.jpg" alt="Photo" />

<!-- GOOD: explicit dimensions prevent CLS -->
<img src="photo.jpg" alt="Photo" width="800" height="600" />
```

### 9. Over-Optimizing Headings for SEO

```html
<!-- BAD: keyword stuffing in headings -->
<h2>Best Web Development Web Development Tools Web Development</h2>

<!-- BAD: all h2s for visual reasons, not hierarchy -->
<h2>Feature 1</h2>
<h2>Feature 2</h2>
<h2>Feature 3</h2>
<!-- Every section at same level when they should be h3 -->

<!-- GOOD: natural, descriptive, hierarchical -->
<h2>Features</h2>
<h3>Feature 1</h3>
<h3>Feature 2</h3>
```

### 10. Blocking Zoom on Mobile

```html
<!-- BAD: user-scalable=no violates WCAG -->
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />

<!-- GOOD: accessible and mobile-friendly -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## Quick Reference

```
Title:      1 per page, under 60 chars, includes brand
Description: 1 per page, under 160 chars, unique per page
Heading:     exactly one h1, sequential hierarchy
JSON-LD:     at least one structured data block per page
Images:      lazy load below-fold, explicit dimensions
Fonts:       font-display: swap, max 3 families
DOM:         max 10 levels deep
Canonical:   every page, self-referencing by default
Viewport:    responsive, user-scalable=yes
Meta tags:   title + description + og:title + og:description + og:type
```
