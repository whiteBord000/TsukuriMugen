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
  },
  {
    "id": "setlist_2025_06_03",
    "title": "〖 歌枠 〗高評価800いくまで終われま8→2222いってもうた 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/AjiIhR7vnvs?si=7SOrfLmXZ7KjKDAA",
    "thumbnail": "https://img.youtube.com/vi/AjiIhR7vnvs/hqdefault.jpg",
    "csv": "20250603.csv"
  },
  {
    "id": "setlist_2025_06_06_a",
    "title": "〖 歌枠 〗登録者５万人行くまで終われま5 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/u4xILjkPxsk?si=ODVBx_qwHltGHNIB",
    "thumbnail": "https://img.youtube.com/vi/u4xILjkPxsk/hqdefault.jpg",
    "csv": "20250606a.csv"
  },
  {
    "id": "setlist_2025_06_06_b",
    "title": "〖 歌枠 〗収益化ありがとうFOREVER 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/VU-9c7e7F1Y?si=3FOrcNtSHadVqIPA",
    "thumbnail": "https://img.youtube.com/vi/VU-9c7e7F1Y/hqdefault.jpg",
    "csv": "20250606b.csv"
  },
  {
    "id": "setlist_2025_06_19",
    "title": "〖 歌枠 〗ちょこっとだけ歌うなどしたりだとか 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/A7j3NpJ0vzI?si=54dUT2O9rojM6ipl",
    "thumbnail": "https://img.youtube.com/vi/A7j3NpJ0vzI/hqdefault.jpg",
    "csv": "20250619.csv"
  },
  {
    "id": "setlist_2025_06_25",
    "title": "〖 歌枠 〗げりら・げりら・げりら 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/yz_8qLw4Z7A?si=c41IhHBwLojof49Q",
    "thumbnail": "https://img.youtube.com/vi/yz_8qLw4Z7A/hqdefault.jpg",
    "csv": "20250625.csv"
  },
  {
    "id": "setlist_2025_06_30",
    "title": "〖 歌枠 〗とても素敵な 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/OsAowO2rwX8?si=vq81g_u-JTCadr8u",
    "thumbnail": "https://img.youtube.com/vi/OsAowO2rwX8/hqdefault.jpg",
    "csv": "20250630.csv"
  },
  {
    "id": "setlist_2025_07_12",
    "title": "〖 歌枠 〗乗れる波は乗れってばっちゃんが言ってた 〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/sZrGuETYpWY?si=Hm_fSu1WqTCIQDC9",
    "thumbnail": "https://img.youtube.com/vi/sZrGuETYpWY/hqdefault.jpg",
    "csv": "20250712.csv"
  },
  {
    "id": "setlist_2025_07_16",
    "title": "〖 歌枠 〗 週の真ん中なので歌う〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/7qIRHYVAG84?si=8OmzntD7AgNxheE5",
    "thumbnail": "https://img.youtube.com/vi/7qIRHYVAG84/hqdefault.jpg",
    "csv": "20250716.csv"
  },
  {
    "id": "setlist_2025_07_27",
    "title": "【眠雲ツクリ】最高のバトンを受け取りました。ラストかますぞ【 #ミリプロ20万人耐久歌枠リレー 】",
    "videoUrl": "https://www.youtube.com/live/NgFZN0VrJDQ?si=E0HTaBtqE88BUP5c",
    "thumbnail": "https://img.youtube.com/vi/NgFZN0VrJDQ/hqdefault.jpg",
    "csv": "20250727.csv"
  }
  // {
  //   "id": "",
  //   "title": "",
  //   "videoUrl": "",
  //   "thumbnail": "https://img.youtube.com/vi//hqdefault.jpg",
  //   "csv": ""
  // }

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
      content.innerHTML = `<h2>${title}</h2>`;

      // サムネイルをクリック可能なリンクで表示
      const thumb = document.createElement("img");
      thumb.src = currentSet.thumbnail;
      thumb.className = "popup-thumbnail";
      thumb.alt = title;
      thumb.addEventListener("click", () => {
        window.open(currentSet.videoUrl, "_blank");
      });
      content.appendChild(thumb);

      // セットリスト表
      content.appendChild(table);
      popup.style.display = "block";
    })
    .catch(err => alert("CSV読み込みエラー：" + err));
}



function closePopup() {
  document.getElementById("popup").style.display = "none";
  lastClicked = null;
}
