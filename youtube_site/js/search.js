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

// 初期化・タグ付け
let currentSortKey = "date";
let currentSortOrder = "asc"; // asc or desc

window.addEventListener("DOMContentLoaded", () => {
  fetch("csv/All_Music.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      allSongs = rows.map(row => {
        const [title, date, url, song, artist, start, duration, note] = row.split(",");
        const obj = { title, date, url, song, artist, start, duration, note };
        obj.id = makeTrackId(obj);
        return obj;
      });

      document.getElementById("searchInput").addEventListener("input", searchSongs);

      // ソートイベント
      document.getElementById("sortKey").addEventListener("change", e => {
        currentSortKey = e.target.value;
        searchSongs();
      });
      document.getElementById("sortAsc").addEventListener("click", () => {
        currentSortOrder = "asc";
        searchSongs();
      });
      document.getElementById("sortDesc").addEventListener("click", () => {
        currentSortOrder = "desc";
        searchSongs();
      });
    });
});

// 検索
function searchSongs() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  let results = allSongs.filter(s =>
    s.song.toLowerCase().includes(keyword) ||
    s.artist.toLowerCase().includes(keyword) ||
    (s.note && s.note.toLowerCase().includes(keyword))
  );

  // 並び替え
  results.sort((a, b) => {
    let valA = a[currentSortKey];
    let valB = b[currentSortKey];

    if (currentSortKey === "date") {
      // 日付比較
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      // 文字列比較（曲名）
      valA = valA || "";
      valB = valB || "";
    }

    if (valA < valB) return currentSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return currentSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  renderResults(results);
}


// 再生ボタン化
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

  container.querySelectorAll(".play-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const url = e.currentTarget.dataset.url;
      const start = parseInt(e.currentTarget.dataset.start || 0);
      const duration = parseInt(e.currentTarget.dataset.duration || 30);
      playInline(url, start, duration);
    });
  });
  container.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      toggleFavoriteById(e.currentTarget.dataset.id, e.currentTarget);
    });
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
