/* サムネギャラリー
 * - CSV(title,url,日付,note)を読み込み
 * - title先頭の「〖 … 〗」からカテゴリ名を抽出（#番号は無視）
 * - カテゴリごとにグループ化し、最古日付のサムネを代表で表示
 * - クリックでそのカテゴリの一覧をモーダル展開
 */

function initGallery(options) {
  const cfg = Object.assign({
    csvPath: 'csv/thumbnail.csv',
    urlToThumb: defaultUrlToThumb,
    openLinkTarget: '_blank'
  }, options || {});

  const state = {
    rawItems: [],
    groups: new Map(), // key: category, value: array of items
    orderedCategories: [], // 表示順
    filteredCategories: []
  };

  const $gallery = document.getElementById('gallery');
  const $empty = document.getElementById('emptyState');
  const $stats = document.getElementById('stats');
  const $search = document.getElementById('searchBox');
  const $reset = document.getElementById('resetBtn');

  // モーダル要素
  const $modalBackdrop = document.getElementById('modalBackdrop');
  const $modalTitle = document.getElementById('modalTitle');
  const $modalList = document.getElementById('modalList');
  const $modalClose = document.getElementById('modalClose');

  // ===== util =====
  function parseCSV(text) {
    // 簡易CSVパーサ（ダブルクオート対応）
    const rows = [];
    let i = 0, field = '', row = [], inQuotes = false;

    while (i < text.length) {
      const c = text[i];

      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; } // エスケープされた"
          inQuotes = false; i++; continue;
        }
        field += c; i++; continue;
      } else {
        if (c === '"') { inQuotes = true; i++; continue; }
        if (c === ',') { row.push(field.trim()); field = ''; i++; continue; }
        if (c === '\n') { row.push(field.trim()); rows.push(row); row = []; field = ''; i++; continue; }
        if (c === '\r') { i++; continue; }
        field += c; i++; continue;
      }
    }
    // 最終フィールド
    if (field.length || row.length) { row.push(field.trim()); rows.push(row); }

    // ヘッダ→オブジェクト
    if (!rows.length) return [];
    const header = rows[0].map(h => h.trim());
    const idx = {
      title: header.findIndex(h => h === 'title'),
      url: header.findIndex(h => h === 'url'),
      date: header.findIndex(h => h === '日付'),
      note: header.findIndex(h => h === 'note')
    };
    return rows.slice(1).filter(r => r.length > 1).map(r => ({
      title: r[idx.title] ?? '',
      url: r[idx.url] ?? '',
      date: r[idx.date] ?? '',
      note: r[idx.note] ?? ''
    }));
  }

  function extractCategory(title) {
    // 先頭の「〖 … 〗」を取り出す。#数字は無視する。
    // 例：〖 夜廻#3 〗おばけには優しく → 夜廻
    //     〖 歌枠 〗高評価〜 → 歌枠
    const m = title.match(/^〖\s*([^〗]+?)\s*〗/);
    if (!m) return '未分類';
    let cat = m[1];
    // #数字を除去
    cat = cat.replace(/#\d+\s*$/,'').trim();
    return cat || '未分類';
  }

  function parseDate(s) {
    // "YYYY-MM-DD" / "YYYY/MM/DD" / "YYYY.MM.DD" 想定、失敗したらnull
    if (!s) return null;
    const norm = s.replace(/[./]/g, '-');
    const d = new Date(norm);
    return isNaN(d.getTime()) ? null : d;
  }

  function defaultComparerAscDate(a, b) {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (da && db) return da - db;             // 古い→新しい
    if (da && !db) return -1;
    if (!da && db) return 1;
    return 0;
  }

  function makeThumbURL(item) {
    return cfg.urlToThumb(item.url) || '';
  }

  // YouTubeのURLならIDからサムネURLを返す。その他はそのまま画像URLとして返す。
  // 必要ならここを差し替えてください。
  function defaultUrlToThumb(url) {
    if (!url) return '';
    try {
      // youtu.be/ID or youtube.com/watch?v=ID or /live/ID etc.
      const u = new URL(url);
      if (u.hostname.includes('youtu')) {
        let id = '';
        if (u.hostname === 'youtu.be') {
          id = u.pathname.slice(1);
        } else {
          // /watch?v=, /live/, /shorts/
          if (u.searchParams.get('v')) id = u.searchParams.get('v');
          if (!id) {
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts.length >= 2 && (parts[0] === 'live' || parts[0] === 'shorts')) {
              id = parts[1];
            }
          }
        }
        if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
      // それ以外は画像URLとみなす
      return url;
    } catch {
      return url;
    }
  }

  // ===== rendering =====
  function renderGallery() {
    const q = ($search.value || '').trim().toLowerCase();

    // フィルタ
    const cats = state.orderedCategories.filter(cat => {
      if (!q) return true;
      const inCat = cat.toLowerCase().includes(q);
      if (inCat) return true;
      // タイトルにもヒットさせたい場合は、代表アイテムもチェック
      const items = state.groups.get(cat) || [];
      return items.some(it => it.title.toLowerCase().includes(q));
    });

    state.filteredCategories = cats;

    $gallery.innerHTML = '';
    if (!cats.length) {
      $empty.style.display = 'block';
    } else {
      $empty.style.display = 'none';
      const frag = document.createDocumentFragment();
      for (const cat of cats) {
        const items = state.groups.get(cat) || [];
        if (!items.length) continue;
        // 最古（いちばんはじめ）
        const representative = items.slice().sort(defaultComparerAscDate)[0];
        const repThumb = makeThumbURL(representative);
        const count = items.length;

        const card = document.createElement('article');
        card.className = 'gallery-card';
        card.tabIndex = 0;
        card.setAttribute('role','button');
        card.setAttribute('aria-label', `${cat} のサムネ一覧を開く`);

        card.innerHTML = `
          <img class="gallery-thumb" alt="${cat} の代表サムネ" loading="lazy" src="${repThumb}">
          <div class="gallery-meta">
            <div class="gallery-title">〖 ${cat} 〗</div>
            <div class="gallery-sub">${count}件・最古：${representative.date || '不明'}</div>
          </div>
        `;
        card.addEventListener('click', () => openModal(cat, items));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(cat, items); }
        });

        frag.appendChild(card);
      }
      $gallery.appendChild(frag);
    }

    $stats.textContent = `カテゴリ ${cats.length} / 総カテゴリ ${state.orderedCategories.length}・アイテム ${state.rawItems.length}`;
  }

  function openModal(cat, items) {
    $modalTitle.textContent = `〖 ${cat} 〗一覧`;
    $modalList.innerHTML = '';

    // 新しい順で並べる（一覧は最新が見やすい想定）
    const sorted = items.slice().sort((a, b) => -defaultComparerAscDate(a, b));
    const frag = document.createDocumentFragment();
    for (const it of sorted) {
      const li = document.createElement('div');
      li.className = 'list-item';
      const thumb = makeThumbURL(it);
      const date = it.date || '日付不明';
      const safeTitle = it.title.replace(/^〖\s*[^〗]+〗\s*/,''); // 見栄え用：先頭カテゴリ飾りは落とす

      // aタグは動画/画像のURLへ。別タブで開く設定はcfg.openLinkTarget
      li.innerHTML = `
        <a href="${it.url}" target="${cfg.openLinkTarget}">
          <img class="list-thumb" alt="${safeTitle}" loading="lazy" src="${thumb}">
          <div class="list-meta">
            <div class="list-title">${safeTitle}</div>
            <div class="list-sub">${date}${it.note ? ` ・ ${it.note}` : ''}</div>
          </div>
        </a>
      `;
      frag.appendChild(li);
    }
    $modalList.appendChild(frag);

    // 開く
    $modalBackdrop.classList.add('open');
    $modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    $modalBackdrop.classList.remove('open');
    $modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  $modalClose.addEventListener('click', closeModal);
  $modalBackdrop.addEventListener('click', (e) => {
    if (e.target === $modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  $search.addEventListener('input', renderGallery);
  $reset.addEventListener('click', () => { $search.value = ''; renderGallery(); });

  // ===== boot =====
  fetch(cfg.csvPath, { cache: 'no-store' })
    .then(r => r.text())
    .then(text => {
      const items = parseCSV(text);

      // グルーピング
      const groups = new Map();
      for (const it of items) {
        const cat = extractCategory(it.title);
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat).push(it);
      }

      // 表示カテゴリ順：代表アイテムの最古日付が古い順（＝歴史が長い順）→必要に応じて変更OK
      const categories = Array.from(groups.keys());
      categories.sort((a, b) => {
        const aRep = groups.get(a).slice().sort(defaultComparerAscDate)[0];
        const bRep = groups.get(b).slice().sort(defaultComparerAscDate)[0];
        return defaultComparerAscDate(aRep, bRep);
      });

      state.rawItems = items;
      state.groups = groups;
      state.orderedCategories = categories;
      renderGallery();
    })
    .catch(err => {
      console.error('CSV読み込みエラー', err);
      $stats.textContent = '読み込みに失敗しました';
    });
}

// 共有関数として外へ
function defaultUrlToThumb(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu')) {
      let id = '';
      if (u.hostname === 'youtu.be') {
        id = u.pathname.slice(1);
      } else {
        if (u.searchParams.get('v')) id = u.searchParams.get('v');
        if (!id) {
          const parts = u.pathname.split('/').filter(Boolean);
          if (parts.length >= 2 && (parts[0] === 'live' || parts[0] === 'shorts')) id = parts[1];
        }
      }
      if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }
    return url;
  } catch {
    return url;
  }
}
