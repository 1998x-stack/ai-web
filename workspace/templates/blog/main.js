// Blog — The Ledger
// Uses utility library: $, $$, onReady, debounce, validateForm

import { $, $$, onReady, debounce, validateForm } from '../../lib/utils.js';

onReady(() => {
  initMobileNav();
  initTagFiltering();
  initSinglePost();
  initSearch();
  initNewsletterForm();
});

/* --- Mobile Nav --- */
function initMobileNav() {
  const hamburger = $('#hamburgerBtn');
  const nav = $('#mainNav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-hidden', String(expanded));
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  $$('.nav__link', nav).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('aria-hidden') === 'false') {
      hamburger.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
}

/* --- Tag Filtering (by category) --- */
function initTagFiltering() {
  const filterButtons = $$('#categoryFilters .filter-btn');
  const sidebarLinks = $$('#sidebarCategories .category-link');
  const allPosts = $$('.post-card');

  function applyFilter(category) {
    if (category === 'all') {
      allPosts.forEach(p => p.style.display = '');
    } else {
      allPosts.forEach(p => {
        p.style.display = p.dataset.category === category ? '' : 'none';
      });
    }

    filterButtons.forEach(btn => {
      const isActive = btn.dataset.filter === category;
      btn.classList.toggle('filter-btn--active', isActive);
    });
    sidebarLinks.forEach(link => {
      const isActive = link.dataset.filter === category;
      link.classList.toggle('category-link--active', isActive);
    });
  }

  function handleFilterClick(e) {
    const btn = e.currentTarget;
    const category = btn.dataset.filter;
    applyFilter(category);
  }

  filterButtons.forEach(btn => btn.addEventListener('click', handleFilterClick));
  sidebarLinks.forEach(link => link.addEventListener('click', handleFilterClick));
}

/* --- Single Post Toggle --- */
function initSinglePost() {
  const blogHome = $('#blogHome');
  const singlePost = $('#singlePost');
  const backBtn = $('#postBackBtn');
  const readMoreBtns = $$('.read-more-btn');

  if (!blogHome || !singlePost || !backBtn) return;

  function showSinglePost() {
    blogHome.hidden = true;
    singlePost.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'The Ledger — Article';
  }

  function showBlogHome() {
    singlePost.hidden = true;
    blogHome.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'The Ledger';
  }

  readMoreBtns.forEach(btn => {
    btn.addEventListener('click', showSinglePost);
  });

  backBtn.addEventListener('click', showBlogHome);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !singlePost.hidden) {
      showBlogHome();
    }
  });
}

/* --- Search Filtering --- */
function initSearch() {
  const searchInput = $('#searchInput');
  const posts = $$('.post-card');
  if (!searchInput) return;

  const doSearch = debounce((query) => {
    const lower = query.toLowerCase().trim();
    posts.forEach(post => {
      const title = post.querySelector('.post-card__title')?.textContent?.toLowerCase() || '';
      const excerpt = post.querySelector('.post-card__excerpt')?.textContent?.toLowerCase() || '';
      const match = !lower || title.includes(lower) || excerpt.includes(lower);
      post.style.display = match ? '' : 'none';
    });
  }, 250);

  searchInput.addEventListener('input', (e) => doSearch(e.target.value));
}

/* --- Newsletter Signup --- */
function initNewsletterForm() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback(form);

    const result = validateForm(form, {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Please enter a valid email address'
      }
    });

    if (!result.valid) {
      showFeedback(form, result.errors.email || 'Please enter your email address');
      return;
    }

    showFeedback(form, 'Thanks! Check your inbox.', 'success');
    form.querySelector('input[type="email"]').value = '';
  });
}

function clearFeedback(form) {
  const existing = form.querySelector('.sidebar-feedback');
  if (existing) existing.remove();
}

function showFeedback(form, message, type = 'error') {
  clearFeedback(form);
  const el = document.createElement('p');
  el.className = 'sidebar-feedback';
  el.textContent = message;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.style.cssText = `font-size: 0.8125rem; color: ${type === 'error' ? '#e53e3e' : '#38a169'}; margin-top: 0.375rem;`;
  form.appendChild(el);
}
