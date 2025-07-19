const setlists = [
  {
    title: "2025年7月10日 夏ライブ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    csv: "csv/20250710.csv"
  },
  {
    title: "2025年6月1日 配信祭",
    thumbnail: "https://img.youtube.com/vi/xvFZjo5PgG0/0.jpg",
    videoUrl: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
    csv: "csv/20250601.csv"
  }
];

let lastClicked = null;

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("thumbnail-container");

  setlists.forEach((item, index) => {
    const img = document.createElement("img");
    img.src = item.thumbnail;
    img.className = "thumbnail";
    img.alt = item.title;

    img.addEventListener("click", () => {
      if (lastClicked === index) {
        // 二度目のクリックでYouTubeへ遷移
        window.open(item.videoUrl, "_blank");
      } else {
        fetchAndShowCSV(item.csv, item.title);
        lastClicked = index;
      }
    });

    container.appendChild(img);
  });
});

function fetchAndShowCSV(csvPath, title) {
  fetch(csvPath)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split("\n").map(row => row.split(","));
      const table = document.createElement("table");

      const header = table.insertRow();
      rows[0].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
      });

      rows.slice(1).forEach(cols => {
        const tr = table.insertRow();
        cols.forEach(col => {
          const td = document.createElement("td");
          td.textContent = col;
          tr.appendChild(td);
        });
      });

      const popup = document.getElementById("popup");
      const content = document.getElementById("popup-content");
      content.innerHTML = `<h2>${title}</h2>`;
      content.appendChild(table);
      popup.style.display = "block";
    })
    .catch(err => alert("CSV読み込みエラー: " + err));
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
  lastClicked = null;
}
