let currentIndex = 0;
let songList = [];
let playTimer = null;

let csvFiles = [
  { file: "csv/20250520.csv" },
  { file: "csv/20250530.csv" },
  { file: "csv/20250603.csv" },
  { file: "csv/20250606a.csv" },
  { file: "csv/20250606b.csv" },
  { file: "csv/20250619.csv" },
  { file: "csv/20250625.csv" },
  { file: "csv/20250630.csv" },
  { file: "csv/20250712.csv" },
  { file: "csv/20250716.csv" },
  { file: "csv/20250721.csv" },
  { file: "csv/20250727.csv" },
  { file: "csv/20250803.csv" }
];

window.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("csv-selector");

  // 各CSVからタイトル取得してプルダウン作成
  Promise.all(csvFiles.map(fileObj =>
    fetch(fileObj.file)
      .then(res => res.text())
      .then(csvText => {
        const firstLine = csvText.trim().split("\n")[1]; // ヘッダーの次の行（1曲目）
        const [title] = firstLine.split(",");
        const displayTitle1 = title.replace(/【.*?】/g, ""); // 【】内を除去
        const displayTitle2 = displayTitle1.replace(/〖.*?〗/g, ""); // 【】内を除去
        return { file: fileObj.file, title: displayTitle2.trim() };
      })
  )).then(filesWithTitles => {
    filesWithTitles.forEach(csv => {
      const option = document.createElement("option");
      option.value = csv.file;
      option.textContent = csv.title;
      selector.appendChild(option);
    });

    // 初期ロード
    loadCsv(filesWithTitles[0].file);
  });

  selector.addEventListener("change", () => {
    loadCsv(selector.value);
  });
});

function loadCsv(file) {
  fetch(file)
    .then(response => response.text())
    .then(csvText => {
      currentIndex = 0;
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

  // 既存の.player-wrapperを取得してiframeだけ差し替える
  const wrapper = document.querySelector(".player-wrapper");
  wrapper.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

  // 曲情報更新
  const info = document.getElementById("info");
  info.innerHTML = `
    <strong>曲名:</strong> ${song.song}<br>
    <strong>アーティスト:</strong> ${song.artist}<br>
    <strong>備考:</strong> ${song.note || "なし"}<br>
  `;

  // 次曲タイマー
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
