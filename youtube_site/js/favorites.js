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


window.addEventListener("DOMContentLoaded", () => {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (favs.length === 0) {
    document.getElementById("favResults").innerHTML = "<p>お気に入りが登録されていません。</p>";
    return;
  }

  fetch("csv/All_Music.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      const songs = rows.map(row => {
        const [title, date, url, song, artist, start, duration, note] = row.split(",");
        return { title, date, url, song, artist, start, duration, note };
      });

      const favSongs = songs.filter(song => favs.includes(song.url));
      renderFavorites(favSongs);
    });
});

function renderFavorites(favSongs) {
  const container = document.getElementById("favResults");
  container.innerHTML = "";

  favSongs.forEach(song => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${song.song}</strong> - ${song.artist}</p>
      <button onclick="playSong('${song.url}', ${song.start}, ${song.duration})">▶ 再生</button>
    `;
    container.appendChild(div);
  });
}

function playSong(url, start, duration) {
  const videoId = url.match(/(?:\/|v=|\/live\/)([A-Za-z0-9_-]{11})/)[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&autoplay=1`;

  const popup = window.open("", "再生", "width=640,height=400");
  popup.document.write(`
    <html><body>
      <iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
    </body></html>
  `);
  setTimeout(() => popup.close(), duration * 1000);
}

let allSongs = [];
let queue = [];           // お気に入りの曲オブジェクト配列
let current = 0;
let autoNextTimer = null;
let autoNext = true;

document.addEventListener("DOMContentLoaded", () => {
  fetch("csv/All_Music.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      allSongs = rows.map(row => {
        const [title, date, url, song, artist, start, duration, note] = row.split(",");
        const obj = { title, date, url, song, artist, start, duration, note };
        obj.id = makeTrackId(obj);  // ← ここでもid付与
        return obj;
      });
      loadFavorites();
    });

  // ついでにUI制御（あれば）
  const favContainer = document.getElementById("favResults");
  favContainer.addEventListener("click", (e) => {
    if (e.target.matches(".play-one")) {
      const idx = parseInt(e.target.dataset.index);
      playAt(idx);
    }
    if (e.target.matches(".remove-fav")) {
      const id = e.target.dataset.id;
      removeFavorite(id);
      loadFavorites();
    }
  });
});

function loadFavorites() {
  const favIds = JSON.parse(localStorage.getItem("favorites") || "[]");
  const favSet = new Set(favIds);
  queue = allSongs.filter(s => favSet.has(s.id));
  current = 0;
  renderFavList();
}

function renderFavList() {
  const container = document.getElementById("favResults");
  container.innerHTML = "";

  if (queue.length === 0) {
    container.innerHTML = "<p>お気に入りが登録されていません。</p>";
    return;
  }

  // コントロール
  container.insertAdjacentHTML("beforeend", `
    <div style="text-align:center;">
      <button id="prevBtn">⏮ 前へ</button>
      <button id="toggleAuto">${autoNext ? "⏹ 自動次曲OFF" : "▶ 自動次曲ON"}</button>
      <button id="nextBtn">⏭ 次へ</button>
    </div>
  `);

  // リスト
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

  // ハンドラ
  document.getElementById("prevBtn").onclick = prev;
  document.getElementById("nextBtn").onclick = next;
  document.getElementById("toggleAuto").onclick = () => {
    autoNext = !autoNext;
    document.getElementById("toggleAuto").textContent = autoNext ? "⏹ 自動次曲OFF" : "▶ 自動次曲ON";
  };
}

function playAt(index) {
  if (index < 0 || index >= queue.length) return;
  current = index;

  const s = queue[current];
  const vid = extractVideoId(s.url);
  const start = parseInt(s.start || 0);
  const duration = parseInt(s.duration || 30);
  const embedUrl = `https://www.youtube.com/embed/${vid}?start=${start}&autoplay=1`;

  // playerは常に1つだけ差し替える
  const wrapper = document.querySelector(".player-wrapper");
  wrapper.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

  // 次曲予約
  if (autoNext) {
    if (autoNextTimer) clearTimeout(autoNextTimer);
    autoNextTimer = setTimeout(next, duration * 1000);
  }

  // 表示更新
  renderFavList();
}

function next() {
  if (current + 1 < queue.length) {
    playAt(current + 1);
  }
}

function prev() {
  if (current - 1 >= 0) {
    playAt(current - 1);
  }
}

function removeFavorite(id) {
  let favs = new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
  favs.delete(id);
  localStorage.setItem("favorites", JSON.stringify([...favs]));
}
