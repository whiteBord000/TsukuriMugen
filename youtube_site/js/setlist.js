// setlist.js（差し替え版）

/** ＝＝＝ お気に入り用ユーティリティ ＝＝＝ */
function extractVideoId(url) {
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/live\/([^?&]+)/);
  return m ? m[1] : "";
}
function makeTrackId({ url, start, duration }) {
  const vid = extractVideoId(url);
  return `${vid}_${parseInt(start || 0)}_${parseInt(duration || 0)}`;
}
function getFavSet() {
  return new Set(JSON.parse(localStorage.getItem("favorites") || "[]"));
}
function saveFavSet(set) {
  localStorage.setItem("favorites", JSON.stringify([...set]));
}
function toggleFavoriteById(id) {
  const set = getFavSet();
  if (set.has(id)) set.delete(id); else set.add(id);
  saveFavSet(set);
  return set.has(id);
}

/** ＝＝＝ 既存のセットリスト定義 ＝＝＝ */
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
    "id": "setlist_2025_07_21",
    "title": "〖 歌枠 〗 ラッキー７万人耐久〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/y24GlFS9zz0?si=6wMrw5fyHWilMzn4",
    "thumbnail": "https://img.youtube.com/vi/y24GlFS9zz0/hqdefault.jpg",
    "csv": "20250721.csv"
  },
  {
    "id": "setlist_2025_07_27",
    "title": "【眠雲ツクリ】最高のバトンを受け取りました。ラストかますぞ【 #ミリプロ20万人耐久歌枠リレー 】",
    "videoUrl": "https://www.youtube.com/live/NgFZN0VrJDQ?si=E0HTaBtqE88BUP5c",
    "thumbnail": "https://img.youtube.com/vi/NgFZN0VrJDQ/hqdefault.jpg",
    "csv": "20250727.csv"
  },
  {
    "id": "setlist_2025_08_03",
    "title": "〖 歌枠 〗 八月一発目はこうじゃろ〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/-04_M7QpSvA?si=GTXLOk-TrfPNUEvb",
    "thumbnail": "https://img.youtube.com/vi/-04_M7QpSvA/hqdefault.jpg",
    "csv": "20250803.csv"
  },
  {
    "id": "setlist_2025_08_09",
    "title": "〖 歌枠 〗お昼なにたべよ〖 眠雲ツクリ / ミリプロ 〗",
    "videoUrl": "https://www.youtube.com/live/L8Ydc01uae0?si=iac2S4_08ZnvWlDF",
    "thumbnail": "https://img.youtube.com/vi/L8Ydc01uae0/hqdefault.jpg",
    "csv": "20250809.csv"
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
      const headerRow = rows[0];
      const dataRows = rows.slice(1);

      // 画面に見せない列（タイトル/日付/URL/開始/秒数は非表示）
      const excludeCols = [0, 1, 2, 5, 6];

      const table = document.createElement("table");

      // ヘッダー行
      const header = table.insertRow();
      headerRow.forEach((col, i) => {
        if (!excludeCols.includes(i)) {
          const th = document.createElement("th");
          th.textContent = col;
          header.appendChild(th);
        }
      });
      // 右端にお気に入り列
      const favTh = document.createElement("th");
      favTh.textContent = "お気に入り";
      header.appendChild(favTh);

      // データ行
      const favSet = getFavSet();
      dataRows.forEach(cols => {
        const tr = table.insertRow();

        // 表示列
        cols.forEach((col, i) => {
          if (!excludeCols.includes(i)) {
            const td = document.createElement("td");
            td.textContent = col;
            tr.appendChild(td);
          }
        });

        // ID作成のための元情報
        const url = cols[2];
        const start = cols[5];
        const duration = cols[6];
        const id = makeTrackId({ url, start, duration });

        // お気に入りボタン列
        const favTd = document.createElement("td");
        const btn = document.createElement("button");
        btn.className = "fav-btn";
        btn.dataset.id = id;
        btn.textContent = favSet.has(id) ? "★（お気に入り）" : "☆ お気に入り";
        btn.addEventListener("click", (e) => {
          const nowOn = toggleFavoriteById(id);
          e.currentTarget.textContent = nowOn ? "★（お気に入り）" : "☆ お気に入り";
        });
        favTd.appendChild(btn);
        tr.appendChild(favTd);
      });

      // ポップアップ描画
      const popup = document.getElementById("popup");
      const content = document.getElementById("popup-content");
      content.innerHTML = `<h2>${title}</h2>`;

      // サムネイル（クリックで0秒スタート）
      const thumb = document.createElement("img");
      thumb.src = currentSet.thumbnail;
      thumb.className = "popup-thumbnail";
      thumb.alt = title;
      thumb.addEventListener("click", () => {
        const zeroStartUrl = currentSet.videoUrl.replace(/(\?.*)?$/, "") + "?t=0";
        window.open(zeroStartUrl, "_blank");
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
