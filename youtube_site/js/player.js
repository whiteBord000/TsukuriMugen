let data = [];
let autoNextTimer = null;
let ytPlayer = null;
let apiReady = false;
let startWhenDataReady = false;

/* ===== 共有URL & クリップボード ===== */
function buildShareUrl(videoId, startSec) {
  const s = parseInt(startSec || 0);
  return `https://youtu.be/${videoId}?t=${s}`;
}
function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(
    () => alert("コピーしました"),
    () => {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
      alert("コピーしました");
    }
  );
}

/* ===== ID生成（お気に入り） ===== */
function extractVideoId(url) {
  const match =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return match ? match[1] : "";
}
function makeTrackId({ url, start, duration }) {
  const vid = extractVideoId(url);
  return `${vid}_${parseInt(start || 0)}_${parseInt(duration || 0)}`;
}

/* ===== お気に入りユーティリティ ===== */
function getFavSet() {
  return new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
}
function setFavSet(set) {
  localStorage.setItem("favorites", JSON.stringify([...set]));
}
function isFavorite(id) {
  return getFavSet().has(id);
}
function toggleFavoriteById(id) {
  const set = getFavSet();
  if (set.has(id)) set.delete(id); else set.add(id);
  setFavSet(set);
  updateFavButton(id);
}
function updateFavButton(id) {
  const btn = document.getElementById("fav-btn");
  if (!btn) return;
  btn.textContent = isFavorite(id) ? "★（お気に入り）" : "☆ お気に入り";
}

/* ===== CSV読み込み ===== */
fetch("csv/All_Music.csv")
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split("\n").slice(1); // ヘッダー除外
    data = rows.map(row => {
      const [title, date, url, song, artist, start, duration, note] = row.split(",");
      return {
        title,
        date,
        url,
        song,
        artist,
        start: parseInt(start),
        duration: parseInt(duration),
        note
      };
    });

    // お気に入りボタン
    const favBtn = document.getElementById("fav-btn");
    if (favBtn) {
      favBtn.addEventListener("click", () => {
        if (!window.__currentTrackId) return;
        toggleFavoriteById(window.__currentTrackId);
      });
    }

    // 履歴ポップアップボタン
    const openHistBtn = document.getElementById("open-history");
    if (openHistBtn) openHistBtn.onclick = openHistory;
    // HTMLの onclick から呼べるように
    window.closeHistory = closeHistory;

    // APIが準備済みなら開始、未準備ならフラグだけ立てる
    if (apiReady) playRandom();
    else startWhenDataReady = true;
  });

/* ===== YouTube Iframe API 初期化 ===== */
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player("yt-player", {
    playerVars: { autoplay: 1, rel: 0, controls: 1 },
    events: {
      onReady: () => {
        apiReady = true;
        if (startWhenDataReady && data.length) playRandom();
      },
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerStateChange(ev) {
  if (ev.data === YT.PlayerState.ENDED) {
    if (autoNextTimer) clearTimeout(autoNextTimer);
    playRandom();
  }
}

/* ===== メイン再生 ===== */
function playRandom(retryCount = 0) {
  if (autoNextTimer) clearTimeout(autoNextTimer);

  const MAX_RETRIES = 10;
  const video = data[Math.floor(Math.random() * data.length)];
  const videoId = extractVideoId(video.url);

  if (!videoId || videoId.length !== 11) {
    if (retryCount < MAX_RETRIES) return playRandom(retryCount + 1);
    alert("有効な動画が見つかりませんでした。");
    return;
  }

  const startTime = parseInt(video.start || 0);
  const duration = parseInt(video.duration || 30);
  const endTime = startTime + duration;

  // === API呼び出しで再生（フォールバックあり） ===
  if (apiReady && ytPlayer?.loadVideoById) {
    ytPlayer.loadVideoById({
      videoId,
      startSeconds: startTime,
      endSeconds: endTime,
      suggestedQuality: "large"
    });
  } else {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startTime}&end=${endTime}&autoplay=1&rel=0`;
    const container = document.querySelector(".player-wrapper");
    container.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }

  // 共有URL
  const share = buildShareUrl(videoId, startTime);
  const shareCell = document.getElementById("shareUrl");
  if (shareCell) {
    shareCell.innerHTML = `
      <a href="${share}" target="_blank" rel="noopener">${share}</a>
      <button id="copyShareBtn">コピー</button>
    `;
    const copyBtn = document.getElementById("copyShareBtn");
    if (copyBtn) copyBtn.onclick = () => copyToClipboard(share);
  }

  // 情報欄
  document.getElementById("title").textContent = video.title;
  document.getElementById("date").textContent = video.date;
  document.getElementById("song").textContent = video.song;
  document.getElementById("artist").textContent = video.artist;
  document.getElementById("start").textContent = startTime;
  document.getElementById("duration").textContent = duration;
  document.getElementById("note").textContent = video.note;

  // お気に入り連携
  window.__currentTrackId = makeTrackId({ url: video.url, start: startTime, duration });
  updateFavButton(window.__currentTrackId);

  // 履歴
  addHistory({
    id: window.__currentTrackId,
    title: video.title,
    date: video.date,
    url: video.url,
    song: video.song,
    artist: video.artist,
    start: startTime,
    duration: duration,
    note: video.note
  });

  // ENDイベントが来ない時のセーフティ
  autoNextTimer = setTimeout(() => playRandom(), (duration + 2) * 1000);
}

/* ===== 再生履歴 ===== */
function loadHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}
function saveHistory(arr) {
  localStorage.setItem("history", JSON.stringify(arr));
}
function addHistory(entry) {
  let hist = loadHistory();
  hist.unshift({ ...entry, ts: Date.now() });
  const seen = new Set();
  hist = hist.filter(e => (seen.has(e.id) ? false : (seen.add(e.id), true)));
  if (hist.length > 100) hist = hist.slice(0, 100);
  saveHistory(hist);
}
function openHistory() {
  renderHistory();
  const pop = document.getElementById("historyPopup");
  if (pop) pop.style.display = "block";
}
function closeHistory() {
  const pop = document.getElementById("historyPopup");
  if (pop) pop.style.display = "none";
}
function renderHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;
  const hist = loadHistory();
  if (!hist.length) {
    list.innerHTML = "<p>履歴はまだありません。</p>";
    return;
  }
  const table = document.createElement("table");
  const thead = table.createTHead().insertRow();
  ["日付","曲名","アーティスト","操作"].forEach(h => {
    const th = document.createElement("th"); th.textContent = h; thead.appendChild(th);
  });
  const tbody = table.createTBody();
  hist.forEach(h => {
    const tr = tbody.insertRow();
    tr.insertCell().textContent = h.date || "";
    tr.insertCell().textContent = h.song || "";
    tr.insertCell().textContent = h.artist || "";
    const ops = tr.insertCell();
    const playBtn = document.createElement("button");
    playBtn.textContent = "再生";
    playBtn.onclick = () => playSpecific(h);
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "URLコピー";
    copyBtn.onclick = () => copyToClipboard(buildShareUrl(extractVideoId(h.url), h.start));
    ops.appendChild(playBtn);
    ops.appendChild(copyBtn);
  });
  list.innerHTML = "";
  list.appendChild(table);
}

/* 履歴から1曲だけ再生 → 終わったら通常に復帰 */
function playSpecific(v) {
  if (!v || !v.url) return;
  if (autoNextTimer) clearTimeout(autoNextTimer);

  const videoId = extractVideoId(v.url);
  if (!videoId || videoId.length !== 11) return;

  const startTime = parseInt(v.start || 0);
  const duration = parseInt(v.duration || 30);
  const endTime = startTime + duration;

  if (apiReady && ytPlayer?.loadVideoById) {
    ytPlayer.loadVideoById({
      videoId,
      startSeconds: startTime,
      endSeconds: endTime,
      suggestedQuality: "large"
    });
  } else {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startTime}&end=${endTime}&autoplay=1&rel=0`;
    const playerContainer = document.querySelector(".player-wrapper");
    playerContainer.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }

  // 情報欄と共有URL
  const share = buildShareUrl(videoId, startTime);
  const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t ?? ""; };
  setText("title", v.title);
  setText("date", v.date);
  setText("song", v.song);
  setText("artist", v.artist);
  setText("start", startTime);
  setText("duration", duration);
  setText("note", v.note);

  const shareCell = document.getElementById("shareUrl");
  if (shareCell) {
    shareCell.innerHTML = `
      <a href="${share}" target="_blank" rel="noopener">${share}</a>
      <button id="copyShareBtn">コピー</button>
    `;
    const copyBtn = document.getElementById("copyShareBtn");
    if (copyBtn) copyBtn.onclick = () => copyToClipboard(share);
  }

  window.__currentTrackId = makeTrackId({ url: v.url, start: startTime, duration });
  updateFavButton(window.__currentTrackId);

  // 1曲再生後は通常の無限再生へ戻す
  autoNextTimer = setTimeout(() => playRandom(), duration * 1000);
}
