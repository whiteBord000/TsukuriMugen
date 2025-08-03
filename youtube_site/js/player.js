let data = [];
let autoNextTimer = null;

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

  document.getElementById("title").textContent = video.title;
  document.getElementById("date").textContent = video.date;
  document.getElementById("song").textContent = video.song;
  document.getElementById("artist").textContent = video.artist;
  document.getElementById("start").textContent = startTime;
  document.getElementById("duration").textContent = duration;
  document.getElementById("note").textContent = video.note;

  const player = document.getElementById("player");
  player.src = `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1`; // ミュート解除
  autoNextTimer = setTimeout(() => playRandom(), duration * 1000); // タイマーを直接セット
}



function extractVideoId(url) {
  const match =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return match ? match[1] : "";
}
