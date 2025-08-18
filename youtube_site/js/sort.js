// js/sort.js
(() => {
  // 初期：曲名（あ→ん）
  let sortValue = 'song-asc';

  function compareJa(a, b) {
    return String(a || '').localeCompare(String(b || ''), 'ja', { sensitivity: 'base', numeric: true });
  }

  function sortArray(items) {
    if (!Array.isArray(items)) return items;
    const sorted = items.slice();

    switch (sortValue) {
      case 'song-asc':
        sorted.sort((a, b) => compareJa(a.song, b.song));
        break;
      case 'song-desc':
        sorted.sort((a, b) => compareJa(b.song, a.song));
        break;
      case 'artist-asc':
        sorted.sort((a, b) => compareJa(a.artist, b.artist));
        break;
      case 'artist-desc':
        sorted.sort((a, b) => compareJa(b.artist, a.artist));
        break;
    }
    return sorted;
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
            originalRender.call(this, sortArray(window.lastSearchResults));
          } catch (e) {
            originalRender.call(this, items);
          }
        };

        initUI();
      } else if ((waited += INTERVAL) >= MAX_WAIT) {
        clearInterval(timer);
      }
    }, INTERVAL);
  }

  function initUI() {
    const sel = document.getElementById('sortSelect');
    if (!sel) return;
    sel.value = sortValue;
    sel.addEventListener('change', () => {
      sortValue = sel.value;
      rerender();
    });
  }

  function rerender() {
    if (typeof window.renderResults !== 'function') return;
    if (Array.isArray(window.lastSearchResults)) {
      window.renderResults(window.lastSearchResults);
    } else if (typeof window.updateSearch === 'function') {
      const results = window.updateSearch();
      if (Array.isArray(results)) window.renderResults(results);
    }
  }

  // 公開（必要なら外から触れる）
  window.SortController = {
    get: () => sortValue,
    set: (v) => { sortValue = v; rerender(); },
    rerender
  };

  document.addEventListener('DOMContentLoaded', wrapRenderResultsWhenReady);
})();
