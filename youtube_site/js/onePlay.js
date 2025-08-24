// onePlay.js

let currentIndex = 0;
let songList = [];
let playTimer = null;

// setlists.csv を読み込んで selector を作る
window.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("csv-selector");

  fetch("csv/setlists.csv", { cache: "no-store" })
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      const items = rows.map(line => {
        const cols = parseCsvLine(line);
        const [id, title, videoUrl, csv] = cols;
        return { id, title, videoUrl, csv };
      });

      items.forEach(item => {
        const option = document.createElement("option");
        option.value = "csv/" + item.csv;
        // 見栄え用に飾りを落とす
        const display = item.title.replace(/【.*?】/g, "").replace(/〖.*?〗/g, "").trim();
        option.textContent = display || item.title;
        selector.appendChild(option);
      });

      if (items.length) loadCsv("csv/" + items[0].csv);
    });

  selector.addEventListener("change", () => {
    loadCsv(selector.value);
  });
});

function parseCsvLine(line) {
  const out = []; let cur = ''; let inQ = false;
  for (let i=0;i<line.length;i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i+1] === '"') { cur += '"'; i++; }
        else { inQ = false; }
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function loadCsv(file) {
  fetch(file)
    .then(response => response.text())
    .then(csvText => {
      currentIndex = 0;
      const rows = csvText.trim().split("\n").slice(1);
      songList = rows.map(line => {
        const [title, date, url, song, artist, start, duration, note] = line.split(",");
        const videoId = extractVideoId(url);
        const startSeconds = parseInt(start);
        return { title, videoId, startSeconds, duration: parseInt(duration), song, artist, note };
      });
      playSong(currentIndex);
    })
    .catch(err => console.error("CSV読み込みエラー:", err));
}

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

  const wrapper = document.querySelector(".player-wrapper");
  wrapper.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

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
