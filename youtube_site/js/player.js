let allVideos = [];
let loopActive = true;

async function loadAllCSVs() {
  const csvFiles = ['setlists/rock.csv', 'setlists/chill.csv', 'setlists/classic.csv'];

  for (const file of csvFiles) {
    const res = await fetch(file);
    const text = await res.text();
    const rows = text.trim().split('\n').slice(1);
    rows.forEach(row => {
      const [title, url, artist, mood, seconds] = row.split(',');
      allVideos.push({ title, url, artist, mood, seconds: parseInt(seconds) });
    });
  }

  playRandom();
}

function playRandom() {
  if (!loopActive) return;

  const video = allVideos[Math.floor(Math.random() * allVideos.length)];
  const videoId = video.url.split('v=')[1]?.split('&')[0];
  const start = video.url.includes('t=') ? '' : '';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  const container = document.getElementById('video-container');
  container.innerHTML = `
    <h2>${video.title} (${video.artist})</h2>
    <iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
  `;

  setTimeout(() => {
    if (loopActive) playRandom();
  }, (video.seconds || 30) * 1000); // デフォ30秒
}

function stopLoop() {
  loopActive = false;
}

window.onload = loadAllCSVs;
