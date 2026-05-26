// Landing Page — FlowBase
// Uses utility library: $, $$, onReady, smoothScroll, debounce

import { $, $$, onReady, smoothScroll, debounce, observeElements } from '../../lib/utils.js';

onReady(() => {
  initMobileNav();
  initSmoothScroll();
  initForm();
  initScrollAnimations();
});

/* --- Mobile Nav Toggle --- */
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

  // Close nav on link click (mobile)
  $$('.nav__link', nav).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('aria-hidden') === 'false') {
      hamburger.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });
}

/* --- Smooth Scroll for Nav Links --- */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      smoothScroll(href, 80);
    });
  });
}

/* --- CTA Form Validation --- */
function initForm() {
  const form = $('#ctaForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('#ctaEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.value.trim())) {
      showFormError(form, 'Please enter a valid email address.');
      return;
    }

    clearFormError(form);
    showFormSuccess(form);
  });

  // Real-time validation on blur
  const email = form.querySelector('#ctaEmail');
  email?.addEventListener('blur', () => {
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.setCustomValidity('Invalid email address');
      email.reportValidity();
    } else {
      email.setCustomValidity('');
    }
  });
}

function showFormError(form, message) {
  const existing = form.querySelector('.form-feedback');
  if (existing) existing.remove();

  const feedback = document.createElement('p');
  feedback.className = 'form-feedback';
  feedback.textContent = message;
  feedback.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem;';
  feedback.setAttribute('role', 'alert');
  form.appendChild(feedback);
}

function clearFormError(form) {
  const existing = form.querySelector('.form-feedback');
  if (existing) existing.remove();
}

function showFormSuccess(form) {
  const existing = form.querySelector('.form-feedback');
  if (existing) existing.remove();

  const feedback = document.createElement('p');
  feedback.className = 'form-feedback';
  feedback.textContent = 'Thanks! Check your inbox for a confirmation link.';
  feedback.style.cssText = 'color: #10b981; font-size: 0.875rem; margin-top: 0.5rem;';
  feedback.setAttribute('role', 'status');
  form.appendChild(feedback);
  form.querySelector('#ctaEmail').value = '';
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  observeElements('.feature-card', (el) => {
    el.style.setProperty('--reveal-delay', '0s');
    el.classList.add('revealed');
  });

  observeElements('.pricing-card', (el) => {
    el.classList.add('revealed');
  });
}
