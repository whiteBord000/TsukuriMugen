let allSongs = [];
allSongs = rows.map(row => {
  const [title, date, url, song, artist, start, duration, note] = row.split(",");
  const obj = { title, date, url, song, artist, start, duration, note };
  obj.id = makeTrackId(obj);   // ← 追加
  return obj;
});


window.addEventListener("DOMContentLoaded", () => {
  fetch("csv/All_Music.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1); // ヘッダー除去
      allSongs = rows.map(row => {
        const [title, date, url, song, artist, start, duration, note] = row.split(",");
        return { title, date, url, song, artist, start, duration, note };
      });

      document.getElementById("searchInput").addEventListener("input", searchSongs);
    });
});

function searchSongs() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  const results = allSongs.filter(song =>
    song.song.toLowerCase().includes(keyword) ||
    song.artist.toLowerCase().includes(keyword) ||
    (song.note && song.note.toLowerCase().includes(keyword))
  );

  renderResults(results);
}

function renderResults(results) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>該当なし</p>";
    return;
  }

  results.forEach(song => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${song.song}</strong> - ${song.artist} (${song.date})</p>
      <button onclick="playSong('${song.url}', ${song.start}, ${song.duration})">▶ 再生</button>
      <button onclick="toggleFavorite('${song.url}', this)">★</button>
    `;
    container.appendChild(div);
  });
}

function playSong(url, start, duration) {
  const videoId = extractVideoId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&autoplay=1`;

  const popup = window.open("", "再生", "width=640,height=400");
  popup.document.write(`
    <html><body>
      <iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
    </body></html>
  `);

  setTimeout(() => popup.close(), duration * 1000);
}

function extractVideoId(url) {
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return m ? m[1] : "";
}

// 曲の一意キー
function makeTrackId({ url, start, duration }) {
  const vid = extractVideoId(url);
  return `${vid}_${parseInt(start || 0)}_${parseInt(duration || 0)}`;
}

// お気に入り機能
function toggleFavorite(url, btn) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (favs.includes(url)) {
    favs = favs.filter(u => u !== url);
    btn.textContent = "★";
  } else {
    favs.push(url);
    btn.textContent = "（済）";
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function renderResults(results) {
  const favs = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>該当なし</p>";
    return;
  }

  results.forEach(song => {
    const isFav = favs.has(song.id);
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${song.song}</strong> - ${song.artist} (${song.date})</p>
      <button data-id="${song.id}" data-url="${song.url}" data-start="${song.start}" data-duration="${song.duration}" class="play-btn">▶ 再生</button>
      <button data-id="${song.id}" class="fav-btn">${isFav ? "★（お気に入り）" : "☆ お気に入り"}</button>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".play-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const url = e.currentTarget.dataset.url;
      const start = parseInt(e.currentTarget.dataset.start || 0);
      const duration = parseInt(e.currentTarget.dataset.duration || 30);
      playInline(url, start, duration); // 下の新関数
    });
  });

  container.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      toggleFavoriteById(e.currentTarget.dataset.id, e.currentTarget);
    });
  });
}

// URLポップアップ廃止→ページ内再生（共通.cssの.player-wrapperを使う）
function playInline(url, start, duration) {
  const videoId = extractVideoId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&autoplay=1`;
  let wrapper = document.querySelector(".player-wrapper");
  if (!wrapper) {
    // 検索ページにもプレイヤー枠を置きたい場合の保険
    const mount = document.getElementById("searchResults");
    wrapper = document.createElement("div");
    wrapper.className = "player-wrapper";
    mount.parentNode.insertBefore(wrapper, mount);
  }
  wrapper.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  // （必要ならdurationで自動停止や次処理を実装）
}

function toggleFavoriteById(id, btnEl) {
  let favs = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
  if (favs.has(id)) {
    favs.delete(id);
    if (btnEl) btnEl.textContent = "☆ お気に入り";
  } else {
    favs.add(id);
    if (btnEl) btnEl.textContent = "★（お気に入り）";
  }
  localStorage.setItem("favorites", JSON.stringify([...favs]));
}
