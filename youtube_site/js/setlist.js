const setlists = [
  {
    "id": "setlist_2025_05_20",
    "title": "〖 歌枠 〗あたしのことが知りたいなら歌を聴け 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/ceAlqDW8CwE?si=zNoCx61k7ZfBrm5f",
    "thumbnail": "https://img.youtube.com/vi/ceAlqDW8CwE/hqdefault.jpg",
    "csv": "20250520.csv"
  },
  {
    "id": "setlist_2025_05_30",
    "title": "〖 縦型歌枠 〗この歌枠は縦型なんだ 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/AJzuJ1BQGFk?si=_JlworqvnhMFmR8Q",
    "thumbnail": "https://img.youtube.com/vi/AJzuJ1BQGFk/hqdefault.jpg",
    "csv": "20250530.csv"
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

function fetchAndShowCSV(csvFileName, title) {
  // CSVファイル名から該当セットリストオブジェクトを取得
  const currentSet = setlists.find(s => s.csv === csvFileName);

  fetch("csv/" + csvFileName)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split("\n").map(row => row.split(","));
      const table = document.createElement("table");

      // 表示したくない列のインデックス（例：0=title, 1=date, 2=url, 5=artist, 6=duration）
      const excludeCols = [0, 1, 2, 5, 6];

      // ヘッダー行
      const header = table.insertRow();
      rows[0].forEach((col, i) => {
        if (!excludeCols.includes(i)) {
          const th = document.createElement("th");
          th.textContent = col;
          header.appendChild(th);
        }
      });

      // データ行
      rows.slice(1).forEach(cols => {
        const tr = table.insertRow();
        cols.forEach((col, i) => {
          if (!excludeCols.includes(i)) {
            const td = document.createElement("td");
            td.textContent = col;
            tr.appendChild(td);
          }
        });
      });

      const popup = document.getElementById("popup");
      const content = document.getElementById("popup-content");

      // サムネイルをクリック可能なリンクで表示
      const thumbnailLink = document.createElement("a");
      thumbnailLink.href = currentSet.videoUrl;
      thumbnailLink.target = "_blank";

      const thumbnailImg = document.createElement("img");
      thumbnailImg.src = currentSet.thumbnail;
      thumbnailImg.alt = currentSet.title;
      const thumb = document.createElement("img");
      thumb.src = setlists.find(s => s.csv === csvFileName)?.thumbnail;
      thumb.className = "popup-thumbnail";
      thumb.alt = title;
      thumb.addEventListener("click", () => {
        window.open(setlists.find(s => s.csv === csvFileName)?.videoUrl, "_blank");
      });
      content.appendChild(thumb);


      thumbnailLink.appendChild(thumbnailImg);

      content.innerHTML = `<h2>${title}</h2>`;
      content.appendChild(thumbnailLink);
      content.appendChild(table);

      popup.style.display = "block";
    })
    .catch(err => alert("CSV読み込みエラー：" + err));
}



function closePopup() {
  document.getElementById("popup").style.display = "none";
  lastClicked = null;
}
