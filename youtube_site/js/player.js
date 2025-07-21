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

  // 無効な動画ID or 明らかに無効な長さのときスキップ
  if (!videoId || videoId.length !== 11) {
    if (retryCount < MAX_RETRIES) {
      playRandom(retryCount + 1); // 再試行
    } else {
      alert("有効な動画が見つかりませんでした。");
    }
    return;
  }

  const endTime = video.start + video.duration;

  // 情報表示
  document.getElementById("title").textContent = video.title;
  document.getElementById("date").textContent = video.date;
  document.getElementById("song").textContent = video.song;
  document.getElementById("artist").textContent = video.artist;
  document.getElementById("start").textContent = video.start;
  document.getElementById("duration").textContent = video.duration;
  document.getElementById("note").textContent = video.note;

  // 再生URL設定
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${video.start}&end=${endTime}&autoplay=1`;
  document.getElementById("player").src = embedUrl;

  // 次の動画を duration 秒後に再生
  autoNextTimer = setTimeout(() => {
    playRandom();
  }, video.duration * 1000);
}


function extractVideoId(url) {
  const match =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return match ? match[1] : "";
}
