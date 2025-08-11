let data = [];
let autoNextTimer = null;

// ID生成を追加
function makeTrackId({ url, start, duration }) {
  const vid = extractVideoId(url);
  return `${vid}_${parseInt(start || 0)}_${parseInt(duration || 0)}`;
}

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

fetch("csv/All_Music.csv") // 再生する曲のリストを設定
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
    const favBtn = document.getElementById("fav-btn");
    if (favBtn) {
      favBtn.addEventListener("click", () => {
        if (!window.__currentTrackId) return;
        toggleFavoriteById(window.__currentTrackId);
      });
    }
    playRandom();  // 初回再生
  });

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

  const startTime = video.start || 0;
  const duration = video.duration || 30;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1`;

  // 統一されたプレイヤー構造
  const playerContainer = document.querySelector(".player-wrapper");
  playerContainer.innerHTML = `
    <iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
  `;

  document.getElementById("title").textContent = video.title;
  document.getElementById("date").textContent = video.date;
  document.getElementById("song").textContent = video.song;
  document.getElementById("artist").textContent = video.artist;
  document.getElementById("start").textContent = startTime;
  document.getElementById("duration").textContent = duration;
  document.getElementById("note").textContent = video.note;
  autoNextTimer = setTimeout(() => playRandom(), duration * 1000); // タイマーを直接セット

  window.__currentTrackId = makeTrackId({ url: video.url, start: startTime, duration });
  updateFavButton(window.__currentTrackId);

  autoNextTimer = setTimeout(() => playRandom(), duration * 1000);
}

function extractVideoId(url) {
  const match =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return match ? match[1] : "";
}
