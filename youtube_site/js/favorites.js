function extractVideoId(url) {
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return m ? m[1] : "";
}
function makeTrackId({ url, start, duration }) {
  const vid = extractVideoId(url);
  return `${vid}_${parseInt(start || 0)}_${parseInt(duration || 0)}`;
}

let allSongs = [];
let queue = [];
let current = 0;
let autoNext = true;
let autoNextTimer = null;

// 初期化
document.addEventListener("DOMContentLoaded", async () => {
  const text = await fetch("csv/All_Music.csv").then(r => r.text());
  const rows = text.trim().split("\n").slice(1);
  allSongs = rows.map(row => {
    const [title, date, url, song, artist, start, duration, note] = row.split(",");
    const obj = { title, date, url, song, artist, start, duration, note };
    obj.id = makeTrackId(obj);
    return obj;
  });

  migrateFavoritesIfNeeded(); // ← ここでURL保存→ID保存へ移行

  loadFavorites();

  // ボタン委譲
  const favContainer = document.getElementById("favResults");
  favContainer.addEventListener("click", e => {
    if (e.target.matches(".play-one")) {
      playAt(parseInt(e.target.dataset.index));
    }
    if (e.target.matches(".remove-fav")) {
      removeFavorite(e.target.dataset.id);
      loadFavorites();
    }
  });
});

// URLをIDに
function migrateFavoritesIfNeeded() {
  const raw = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!raw.length) return;

  // URLっぽい文字列が入ってたらIDへ変換
  const looksUrl = raw.some(v => typeof v === "string" && v.startsWith("http"));
  if (!looksUrl) return;

  const ids = [];
  for (const v of raw) {
    if (typeof v === "string" && v.startsWith("http")) {
      const hit = allSongs.find(s => s.url === v);
      if (hit) ids.push(hit.id);
    } else if (typeof v === "string") {
      ids.push(v);
    }
  }
  localStorage.setItem("favorites", JSON.stringify(ids));
}

// ロード制御
function loadFavorites() {
  const favIds = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
  queue = allSongs.filter(s => favIds.has(s.id));
  current = 0;
  renderFavList();
}

function renderFavList() {
  const container = document.getElementById("favResults");
  container.innerHTML = "";

  if (!queue.length) {
    container.innerHTML = "<p>お気に入りが登録されていません。</p>";
    return;
  }

  container.insertAdjacentHTML("beforeend", `
    <div style="text-align:center;">
      <button id="prevBtn">⏮ 前へ</button>
      <button id="toggleAuto">${autoNext ? "⏹ 自動次曲OFF" : "▶ 自動次曲ON"}</button>
      <button id="nextBtn">⏭ 次へ</button>
    </div>
  `);

  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = "0";
  queue.forEach((s, i) => {
    const li = document.createElement("li");
    li.style.margin = "6px 0";
    li.innerHTML = `
      <span>${i === current ? "▶ " : ""}<strong>${s.song}</strong> - ${s.artist} (${s.date})</span>
      <button class="play-one" data-index="${i}">再生</button>
      <button class="remove-fav" data-id="${s.id}">★解除</button>
    `;
    ul.appendChild(li);
  });
  container.appendChild(ul);

  document.getElementById("prevBtn").onclick = prev;
  document.getElementById("nextBtn").onclick = next;
  document.getElementById("toggleAuto").onclick = () => {
    autoNext = !autoNext;
    document.getElementById("toggleAuto").textContent = autoNext ? "⏹ 自動次曲OFF" : "▶ 自動次曲ON";
  };
}

// 再生制御
function playAt(index) {
  if (index < 0 || index >= queue.length) return;
  current = index;

  const s = queue[current];
  const vid = extractVideoId(s.url);
  const start = parseInt(s.start || 0);
  const duration = parseInt(s.duration || 30);
  const embedUrl = `https://www.youtube.com/embed/${vid}?start=${start}&autoplay=1`;

  const wrapper = document.querySelector(".player-wrapper");
  wrapper.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

  if (autoNext) {
    if (autoNextTimer) clearTimeout(autoNextTimer);
    autoNextTimer = setTimeout(next, duration * 1000);
  }

  renderFavList();
}

function next() {
  if (current + 1 < queue.length) playAt(current + 1);
}
function prev() {
  if (current - 1 >= 0) playAt(current - 1);
}

function removeFavorite(id) {
  const set = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
  set.delete(id);
  localStorage.setItem("favorites", JSON.stringify([...set]));
}
