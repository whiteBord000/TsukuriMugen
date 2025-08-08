window.addEventListener("DOMContentLoaded", () => {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (favs.length === 0) {
    document.getElementById("favResults").innerHTML = "<p>お気に入りが登録されていません。</p>";
    return;
  }

  fetch("csv/All_Music.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);
      const songs = rows.map(row => {
        const [title, date, url, song, artist, start, duration, note] = row.split(",");
        return { title, date, url, song, artist, start, duration, note };
      });

      const favSongs = songs.filter(song => favs.includes(song.url));
      renderFavorites(favSongs);
    });
});

function renderFavorites(favSongs) {
  const container = document.getElementById("favResults");
  container.innerHTML = "";

  favSongs.forEach(song => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${song.song}</strong> - ${song.artist}</p>
      <button onclick="playSong('${song.url}', ${song.start}, ${song.duration})">▶ 再生</button>
    `;
    container.appendChild(div);
  });
}

function playSong(url, start, duration) {
  const videoId = url.match(/(?:\/|v=|\/live\/)([A-Za-z0-9_-]{11})/)[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${start}&autoplay=1`;

  const popup = window.open("", "再生", "width=640,height=400");
  popup.document.write(`
    <html><body>
      <iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
    </body></html>
  `);
  setTimeout(() => popup.close(), duration * 1000);
}
