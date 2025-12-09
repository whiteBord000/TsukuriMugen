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
let dedupeOn = false;

// 複数配信にまたがる同じ曲をまとめるためのグループ
// key: "曲名__アーティスト", value: [その曲が出てくる行の配列]
let lastGroups = new Map();

// （必要なら）最後に画面に出した結果も保持しておく
let lastResults = [];

// 並び替え
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

// 検索（キーワードフィルタ＋ソート＋重複モード）
function searchSongs() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();

  // ① キーワードでフィルタ（キーワード空なら実質 allSongs 全部）
  const filtered = allSongs.filter(s =>
    s.song.toLowerCase().includes(keyword) ||
    s.artist.toLowerCase().includes(keyword) ||
    (s.note && s.note.toLowerCase().includes(keyword))
  );

  // ② 同じ「曲名＋アーティスト」でグループ化
  const groups = new Map();
  for (const s of filtered) {
    const key = `${s.song}__${s.artist}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  lastGroups = groups; // リストボタン用に保存

  // ③ 重複排除ONなら、各グループから1件だけ代表を出す
  let results;
  if (dedupeOn) {
    results = [];
    for (const [, arr] of groups) {
      results.push(arr[0]); // 先頭を代表として表示
    }
  } else {
    results = filtered.slice();
  }

  // ④ ソート
  results = applySort(results);
  lastResults = results; // 一応保持

  // ⑤ 画面に描画
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

      // イベント設定
      document.getElementById("searchInput").addEventListener("input", searchSongs);
      document.getElementById("sortSelect").addEventListener("change", searchSongs);

      const dedupe = document.getElementById("dedupeToggle");
      if (dedupe) {
        dedupe.addEventListener("change", () => {
          dedupeOn = dedupe.checked;
          searchSongs();  // 状態変わったら再描画
        });
      }

      // ポップアップ閉じるボタン
      const closeBtn = document.getElementById("songListClose");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          const popup = document.getElementById("songListPopup");
          if (popup) popup.style.display = "none";
        });
      }

      // ポップアップ内の再生ボタンのイベント（デリゲート）
      const popup = document.getElementById("songListPopup");
      if (popup && !popup.__wired) {
        popup.addEventListener("click", (e) => {
          const play = e.target.closest(".popup-play-btn");
          if (play) {
            const url = play.dataset.url;
            const start = parseInt(play.dataset.start || "0", 10);
            const duration = parseInt(play.dataset.duration || "30", 10);
            playInline(url, start, duration);
            return;
          }
        });
        popup.__wired = true;
      }

      // ★ 初期表示：キーワード空の状態で全曲表示
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

    const key = `${song.song}__${song.artist}`;
    const group = lastGroups.get(key) || [];
    const hasMulti = group.length > 1; // 同じ曲が複数配信にあるか

    const div = document.createElement("div");
div.className = "search-result-row";  // ★ 追加クラス

div.innerHTML = `
  <div class="search-main">
    <span class="search-song">${song.song}</span>
    <span class="search-artist">- ${song.artist}</span>
  </div>
  <div class="search-actions">
    <button class="play-btn"
            data-url="${song.url}"
            data-start="${song.start}"
            data-duration="${song.duration}">▶ 再生</button>
    <button class="fav-btn" data-id="${song.id}">
      ${isFav ? "★（お気に入り）" : "☆ お気に入り"}
    </button>
    ${hasMulti ? `
      <button class="list-btn"
              data-song="${song.song}"
              data-artist="${song.artist}">
        リスト
      </button>
    ` : ""}
  </div>
`;
container.appendChild(div);
  });

  if (!container.__wired) {
    container.addEventListener("click", (e) => {
      const play = e.target.closest(".play-btn");
      if (play) {
        const url = play.dataset.url;
        const start = parseInt(play.dataset.start || "0", 10);
        const duration = parseInt(play.dataset.duration || "30", 10);
        playInline(url, start, duration);
        return;
      }

      const fav = e.target.closest(".fav-btn");
      if (fav) {
        toggleFavoriteById(fav.dataset.id, fav);
        return;
      }

      const listBtn = e.target.closest(".list-btn");
      if (listBtn) {
        const songName = listBtn.dataset.song;
        const artist = listBtn.dataset.artist;
        openSongList(songName, artist);
        return;
      }
    });
    container.__wired = true; // 二重登録防止
  }
}

// 「リスト」ボタン押下時：その曲が出てくる動画タイトルをポップアップ表示
function openSongList(songName, artist) {
  const key = `${songName}__${artist}`;
  const group = lastGroups.get(key) || [];
  if (!group.length) return;

  const popup = document.getElementById("songListPopup");
  const content = document.getElementById("songListContent");

  // 念のため、要素がなかったときのフォールバックとして alert
  if (!popup || !content) {
    const titles = Array.from(new Set(group.map(s => s.title)));
    const lines = titles.map(t => `・${t}`).join("\n");
    alert(`${songName} - ${artist}\n\nこの曲が出てくる配信:\n${lines}`);
    return;
  }

  // ポップアップ中身を組み立て
  let html = `<h2>${songName} - ${artist}</h2>`;
  html += "<ul>";

  // 同じタイトルが重複していたらまとめつつ、その配信内の曲ごとの再生ボタンを出すイメージ
  // （単純に group の1行ごとにボタン出す形でもOK）
  for (const s of group) {
    html += `
      <li>
        <span>${s.title}</span>
        <button class="popup-play-btn"
                data-url="${s.url}"
                data-start="${s.start}"
                data-duration="${s.duration}">
          ▶ 再生
        </button>
      </li>
    `;
  }

  html += "</ul>";

  content.innerHTML = html;
  popup.style.display = "block";
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
  const had = set.has(id);
  if (had) set.delete(id); else set.add(id);
  localStorage.setItem("favorites", JSON.stringify([...set]));

  if (btnEl) {
    btnEl.textContent = had ? "☆ お気に入り" : "★（お気に入り）";
  }
}
