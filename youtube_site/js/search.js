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

function applySort(results) {
  const sortValue = document.getElementById("sortSelect")?.value || "song_asc";
  return results.slice().sort((a, b) => {
    if (sortValue === "song_asc") return a.song.localeCompare(b.song, "ja");
    if (sortValue === "song_desc") return b.song.localeCompare(a.song, "ja");
    if (sortValue === "artist_asc") return a.artist.localeCompare(b.artist, "ja");
    if (sortValue === "artist_desc") return b.artist.localeCompare(a.artist, "ja");
    return 0;
  });
}

// 検索（キーワードフィルタ＋ソート）
function searchSongs() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  let results = allSongs.filter(s =>
    s.song.toLowerCase().includes(keyword) ||
    s.artist.toLowerCase().includes(keyword) ||
    (s.note && s.note.toLowerCase().includes(keyword))
  );
  results = applySort(results);
  renderResults(results);
}

// 初期ロード
window.addEventListener("DOMContentLoaded", () => {
  fetch("csv/All_Music.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      allSongs = rows.map(row => {
        const [title, , url, song, artist, start, duration, note] = row.split(",");
        const obj = { title, url, song, artist, start, duration, note };
        obj.id = makeTrackId(obj);
        return obj;
      });

      document.getElementById("searchInput").addEventListener("input", searchSongs);
      document.getElementById("sortSelect").addEventListener("change", searchSongs);

      // デフォルトで一覧を表示
      searchSongs();
    });
});

// 結果描画
function renderResults(results) {
  const favs = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (!results.length) {
    container.innerHTML = "<p>該当なし</p>";
    return;
  }

  results.forEach(song => {
    const isFav = favs.has(song.id);
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${song.song}</strong> - ${song.artist}</p>
      <button class="play-btn"
              data-url="${song.url}"
              data-start="${song.start}"
              data-duration='${song.duration}'>▶ 再生</button>
      <button class="fav-btn" data-id="${song.id}">
        ${isFav ? "★（お気に入り）" : "☆ お気に入り"}
      </button>
    `;
    container.appendChild(div);
  });
}

// プレイヤー
function playInline(url, start, duration) {
  const videoId = extractVideoId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&autoplay=1`;
  let wrapper = document.querySelector(".player-wrapper");
  if (!wrapper) {
    const mount = document.getElementById("searchResults");
    wrapper = document.createElement("div");
    wrapper.className = "player-wrapper";
    mount.parentNode.insertBefore(wrapper, mount);
  }
  wrapper.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
}

// お気に入り機能
function toggleFavoriteById(id, btnEl) {
  const set = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
  if (set.has(id)) {
    set.delete(id);
    if (btnEl) btnEl.textContent = "☆";
  } else {
    set.add(id);
    if (btnEl) btnEl.textContent = "★";
  }
  localStorage.setItem("favorites", JSON.stringify([...set]));
}
