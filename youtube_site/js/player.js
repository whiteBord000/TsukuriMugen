let data = [];
let autoNextTimer = null;

fetch("csv/20250520.csv")  // ★csvの場所を正確に指定（パス重要）
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
    playRandom();  // 初回実行
  });

function playRandom() {
  // タイマーが動いてたらキャンセル
  if (autoNextTimer) {
    clearTimeout(autoNextTimer);
  }

  const video = data[Math.floor(Math.random() * data.length)];
  const videoId = extractVideoId(video.url);
  const endTime = video.start + video.duration;

  document.getElementById("title").textContent = video.title;
  document.getElementById("date").textContent = video.date;
  document.getElementById("song").textContent = video.song;
  document.getElementById("artist").textContent = video.artist;
  document.getElementById("start").textContent = video.start;
  document.getElementById("duration").textContent = video.duration;
  document.getElementById("note").textContent = video.note;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${video.start}&end=${endTime}&autoplay=1`;
  document.getElementById("player").src = embedUrl;

  // duration 秒後に次の動画へ自動切替
  autoNextTimer = setTimeout(() => {
    playRandom();
  }, video.duration * 1000);  // ミリ秒に変換
}

function extractVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/) ||
                url.match(/youtu\.be\/([^?&]+)/) ||
                url.match(/\/live\/([^?&]+)/);
  return match ? match[1] : "";
}
