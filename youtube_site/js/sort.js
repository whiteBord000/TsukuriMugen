// js/sort.js
(() => {
  // 初期: 配信日時・降順（新しい順）
  const sortState = { key: 'date', order: 'desc' };

  function initSortUI() {
    const keySel = document.getElementById('sortKey');
    const orderBtn = document.getElementById('sortOrderBtn');
    if (!keySel || !orderBtn) return;

    keySel.value = sortState.key;
    updateOrderBtn(orderBtn);

    keySel.addEventListener('change', () => {
      sortState.key = keySel.value;
      rerenderWithSort();
    });

    orderBtn.addEventListener('click', () => {
      sortState.order = (sortState.order === 'asc') ? 'desc' : 'asc';
      updateOrderBtn(orderBtn);
      rerenderWithSort();
    });
  }

  function updateOrderBtn(btn) {
    const asc = sortState.order === 'asc';
    btn.setAttribute('aria-pressed', asc ? 'false' : 'true');
    btn.textContent = asc ? '▲ 昇順' : '▼ 降順';
  }

  function normalizeDate(s) {
    if (!s || typeof s !== 'string') return null;
    const t = s.trim().replace(/[.]/g, '-').replace(/\//g, '-');
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  }

  function sortResultsArray(items) {
    if (!Array.isArray(items)) return items;
    const sign = (sortState.order === 'asc') ? 1 : -1;

    return items.slice().sort((a, b) => {
      if (sortState.key === 'date') {
        const da = normalizeDate(a.date || a.streamDate || a['配信日'] || '');
        const db = normalizeDate(b.date || b.streamDate || b['配信日'] || '');
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return (da < db ? -1 : da > db ? 1 : 0) * sign;
      } else {
        const ta = (a.song || a.title || a['曲名'] || '').toString();
        const tb = (b.song || b.title || b['曲名'] || '').toString();
        return ta.localeCompare(tb, 'ja', { sensitivity: 'base', numeric: true }) * sign;
      }
    });
  }

  function wrapRenderResultsWhenReady() {
    const MAX_WAIT = 4000, INTERVAL = 50;
    let waited = 0;
    const timer = setInterval(() => {
      if (typeof window.renderResults === 'function') {
        clearInterval(timer);
        const originalRender = window.renderResults;

        window.renderResults = function(items) {
          try {
            window.lastSearchResults = Array.isArray(items) ? items.slice() : items;
            originalRender.call(this, sortResultsArray(window.lastSearchResults));
          } catch (e) {
            originalRender.call(this, items);
          }
        };

        initSortUI();
      } else if ((waited += INTERVAL) >= MAX_WAIT) {
        clearInterval(timer);
      }
    }, INTERVAL);
  }

  function rerenderWithSort() {
    if (typeof window.renderResults !== 'function') return;
    if (Array.isArray(window.lastSearchResults)) {
      window.renderResults(window.lastSearchResults);
    } else if (typeof window.updateSearch === 'function') {
      const results = window.updateSearch();
      if (Array.isArray(results)) window.renderResults(results);
    }
  }

  window.SortController = {
    getState: () => ({ ...sortState }),
    setKey: k => { sortState.key = k; rerenderWithSort(); },
    setOrder: o => { sortState.order = o; rerenderWithSort(); },
    rerender: rerenderWithSort
  };

  document.addEventListener('DOMContentLoaded', wrapRenderResultsWhenReady);
})();
