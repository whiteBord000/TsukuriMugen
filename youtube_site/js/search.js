let allSongs = [];

window.addEventListener("DOMContentLoaded", () => {
  fetch("csv/All_Music.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1); // ヘッダー除去
      allSongs = rows.map(row => {
        const [title, date, url, song, artist, start, duration, note] = row.split(",");
        return { title, date, url, song, artist, start, duration, note };
      });

      document.getElementById("searchInput").addEventListener("input", searchSongs);
    });
});

function searchSongs() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  const results = allSongs.filter(song =>
    song.song.toLowerCase().includes(keyword) ||
    song.artist.toLowerCase().includes(keyword) ||
    (song.note && song.note.toLowerCase().includes(keyword))
  );

  renderResults(results);
}

function renderResults(results) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>該当なし</p>";
    return;
  }

  results.forEach(song => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${song.song}</strong> - ${song.artist} (${song.date})</p>
      <button onclick="playSong('${song.url}', ${song.start}, ${song.duration})">▶ 再生</button>
      <button onclick="toggleFavorite('${song.url}', this)">★</button>
    `;
    container.appendChild(div);
  });
}

function playSong(url, start, duration) {
  const videoId = extractVideoId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&autoplay=1`;

  const popup = window.open("", "再生", "width=640,height=400");
  popup.document.write(`
    <html><body>
      <iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
    </body></html>
  `);

  setTimeout(() => popup.close(), duration * 1000);
}

function extractVideoId(url) {
  const match =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return match ? match[1] : "";
}

// お気に入り機能
function toggleFavorite(url, btn) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (favs.includes(url)) {
    favs = favs.filter(u => u !== url);
    btn.textContent = "★";
  } else {
    favs.push(url);
    btn.textContent = "★（済）";
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
}
