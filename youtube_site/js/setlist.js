const setlists = [
 [
  {
    "id": "setlist_2025_05_20",
    "title": "〖 歌枠 〗あたしのことが知りたいなら歌を聴け 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/ceAlqDW8CwE?si=zNoCx61k7ZfBrm5f",
    "thumbnail": "https://www.youtube.com/live/ceAlqDW8CwE?si=zNoCx61k7ZfBrm5f/hqdefault.jpg",
    "csv": "csv/20250520.csv"
  }
]
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
