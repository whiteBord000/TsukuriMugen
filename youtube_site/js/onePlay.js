const CSV_FILE = "csv/20250520.csv";

let currentIndex = 0;
let songList = [];
let playTimer = null;

window.addEventListener("DOMContentLoaded", () => {
  fetch(CSV_FILE)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split("\n").slice(1); // ヘッダー除外
      songList = rows.map(line => {
        const [title, date, url, song, artist, start, duration, note] = line.split(",");
        const videoId = extractVideoId(url);
        const startSeconds = parseInt(start);
        return { title, videoId, startSeconds, duration: parseInt(duration), song, artist, note };
      });
      playSong(currentIndex);
    })
    .catch(err => console.error("CSV読み込みエラー:", err));
});

function extractVideoId(url) {
  const match = url.match(/(?:\/|v=)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
}

function playSong(index) {
  if (index >= songList.length) return;

  if (playTimer) clearTimeout(playTimer);

  const song = songList[index];
  const end = song.startSeconds + song.duration;
  const embedUrl = `https://www.youtube.com/embed/${song.videoId}?start=${song.startSeconds}&end=${end}&autoplay=1`;

  const iframe = document.createElement("iframe");
  iframe.src = embedUrl;
  iframe.allow = "autoplay; encrypted-media";
  iframe.setAttribute("allowfullscreen", "");

  const container = document.getElementById("player-container");
  container.innerHTML = "";
  container.appendChild(iframe);

  const info = document.getElementById("info");
  info.innerHTML = `
    <strong>曲名:</strong> ${song.song}<br>
    <strong>アーティスト:</strong> ${song.artist}<br>
    <strong>備考:</strong> ${song.note || "なし"}<br>
  `;

  playTimer = setTimeout(() => {
    currentIndex++;
    playSong(currentIndex);
  }, song.duration * 1000);
}

function nextSong() {
  if (currentIndex + 1 < songList.length) {
    currentIndex++;
    playSong(currentIndex);
  }
}
