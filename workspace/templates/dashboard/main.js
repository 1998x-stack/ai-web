// Dashboard — Metric
// Uses utility library: $, $$, onReady, initDarkMode, debounce

import { $, $$, onReady, initDarkMode, debounce } from '../../lib/utils.js';

onReady(() => {
  initMobileSidebar();
  initDarkMode();
  initSortableTable();
  initSearch();
});

/* --- Mobile Sidebar Toggle --- */
function initMobileSidebar() {
  const hamburger = $('#hamburgerBtn');
  const sidebar = $('#sidebar');
  if (!hamburger || !sidebar) return;

  function isMobile() {
    return window.innerWidth < 768;
  }

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    sidebar.setAttribute('aria-hidden', String(expanded));
    document.body.style.overflow = (!expanded && isMobile()) ? 'hidden' : '';
  });

  // Close sidebar on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.getAttribute('aria-hidden') === 'false' && isMobile()) {
      hamburger.setAttribute('aria-expanded', 'false');
      sidebar.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (isMobile() &&
        sidebar.getAttribute('aria-hidden') === 'false' &&
        !sidebar.contains(e.target) &&
        !hamburger.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      sidebar.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  // Sync on resize
  const onResize = debounce(() => {
    if (!isMobile() && sidebar.getAttribute('aria-hidden') === 'false') {
      // On desktop sidebar is always visible
      sidebar.removeAttribute('aria-hidden');
      document.body.style.overflow = '';
    }
  }, 150);
  window.addEventListener('resize', onResize);
}

/* --- Sortable Table --- */
function initSortableTable() {
  const table = $('#ordersTable');
  if (!table) return;

  const headers = $$('th.sortable', table);
  const tbody = table.querySelector('tbody');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const key = header.dataset.sort;
      const isAsc = header.classList.contains('sort-asc');

      // Clear all sorts
      headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));

      // Set new sort direction
      header.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
      const direction = isAsc ? -1 : 1;

      const rows = $$('tr', tbody);
      rows.sort((a, b) => {
        const aVal = a.querySelector(`.cell-${key}`)?.textContent?.trim() || '';
        const bVal = b.querySelector(`.cell-${key}`)?.textContent?.trim() || '';

        // Handle currency values
        const aNum = parseFloat(aVal.replace(/[$,]/g, ''));
        const bNum = parseFloat(bVal.replace(/[$,]/g, ''));
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return (aNum - bNum) * direction;
        }

        // Handle dates
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return (aDate - bDate) * direction;
        }

        return aVal.localeCompare(bVal) * direction;
      });

      rows.forEach(row => tbody.appendChild(row));
    });
  });
}

/* --- Search / Filter Table --- */
function initSearch() {
  const searchInput = $('#dashboardSearch');
  const table = $('#ordersTable');
  if (!searchInput || !table) return;

  const rows = $$('tbody tr', table);

  const doSearch = debounce((query) => {
    const lower = query.toLowerCase().trim();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = !lower || text.includes(lower) ? '' : 'none';
    });
  }, 200);

  searchInput.addEventListener('input', (e) => doSearch(e.target.value));
}
