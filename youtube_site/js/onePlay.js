const CSV_FILE = "csv/20250520.csv"; // ←再生対象のセットリストCSV

let currentIndex = 0;
let songList = [];

window.addEventListener("DOMContentLoaded", () => {
  fetch(CSV_FILE)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split("\n").slice(1); // ヘッダー除外
      songList = rows.map(line => {
        const [title, date, url, song, , artist, duration, note] = line.split(",");
        const videoId = extractVideoId(url);
        const startSeconds = getStartSeconds(url);
        return { title, videoId, startSeconds, duration: parseInt(duration), song, artist, note };
      });
      playNext();
    })
    .catch(err => console.error("CSV読み込みエラー:", err));
});

function extractVideoId(url) {
  const match = url.match(/(?:\/|v=)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
}

function getStartSeconds(url) {
  const match = url.match(/[?&]t=(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function playNext() {
  if (currentIndex >= songList.length) {
    currentIndex = 0; // ループしたくなければ return;
  }

  const song = songList[currentIndex];
  const embedUrl = `https://www.youtube.com/embed/${song.videoId}?start=${song.startSeconds}&autoplay=1&mute=0`;

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

  setTimeout(() => {
    currentIndex++;
    playNext();
  }, song.duration * 1000);
}
