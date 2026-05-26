// Portfolio — Aria Vasquez
// Uses utility library: $, $$, onReady, smoothScroll, validateForm, observeElements

import { $, $$, onReady, smoothScroll, validateForm, observeElements } from '../../lib/utils.js';

onReady(() => {
  initMobileNav();
  initSmoothScroll();
  initHeaderScroll();
  initForm();
  initScrollAnimations();
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

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      smoothScroll(href, 72);
    });
  });
}

/* --- Header background on scroll --- */
function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* --- Contact Form --- */
function initForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(form);

    const result = validateForm(form, {
      name: { required: true, minLength: 2, requiredMessage: 'Please enter your name' },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Please enter a valid email address'
      },
      message: { required: true, minLength: 10, requiredMessage: 'Please enter a message (min 10 characters)' }
    });

    if (!result.valid) {
      showErrors(form, result.errors);
      return;
    }

    showSuccess(form);
  });

  // Clear error on input
  $$('.form__input, .form__textarea', form).forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('has-error');
      const error = input.parentElement.querySelector('.form__error');
      if (error) error.remove();
    });
  });
}

function showErrors(form, errors) {
  Object.entries(errors).forEach(([fieldName, message]) => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (!input) return;
    input.classList.add('has-error');
    const error = document.createElement('p');
    error.className = 'form__error';
    error.textContent = message;
    error.setAttribute('role', 'alert');
    input.parentElement.appendChild(error);
  });
}

function clearErrors(form) {
  $$('.has-error', form).forEach(el => el.classList.remove('has-error'));
  $$('.form__error', form).forEach(el => el.remove());
  const success = form.querySelector('.form-success');
  if (success) success.remove();
}

function showSuccess(form) {
  clearErrors(form);
  const msg = document.createElement('p');
  msg.className = 'form-success';
  msg.textContent = 'Thanks! I will get back to you within 24 hours.';
  msg.style.cssText = 'color: #10b981; font-size: 0.875rem; margin-top: 0.5rem;';
  msg.setAttribute('role', 'status');
  form.appendChild(msg);
  form.reset();
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  observeElements('.work-card', (el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}
