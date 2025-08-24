// setlist.js

/** お気に入りユーティリティ（現状のまま利用） **/
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
function getFavSet() { return new Set(JSON.parse(localStorage.getItem("favorites") || "[]")); }
function saveFavSet(set) { localStorage.setItem("favorites", JSON.stringify([...set])); }
function toggleFavoriteById(id) {
  const set = getFavSet();
  if (set.has(id)) set.delete(id); else set.add(id);
  saveFavSet(set);
  return set.has(id);
}

/** YouTubeサムネ生成 */
function youtubeThumbFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return `https://i.ytimg.com/vi/${u.pathname.slice(1)}/hqdefault.jpg`;
    const v = u.searchParams.get('v');
    if (v) return `https://i.ytimg.com/vi/${v}/hqdefault.jpg`;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && (parts[0] === 'live' || parts[0] === 'shorts')) {
      return `https://i.ytimg.com/vi/${parts[1]}/hqdefault.jpg`;
    }
  } catch { }
  // ダメな場合は何も出さない（or プレースホルダー）
  return '';
}

let setlists = [];
let lastClicked = null;

window.addEventListener("DOMContentLoaded", () => {
  fetch("csv/setlists.csv", { cache: "no-store" })
    .then(r => r.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1); // ヘッダ除外
      setlists = rows.map(line => {
        const cols = parseCsvLine(line);
        const [id, title, videoUrl, csv] = cols;
        return { id, title, videoUrl, csv };
      });
      renderThumbnails();
    })
    .catch(err => console.error("setlists.csv 読み込み失敗:", err));
});

function parseCsvLine(line) {
  const out = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = false; }
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function renderThumbnails() {
  const container = document.getElementById("thumbnail-container");
  container.innerHTML = "";

  setlists.forEach((item, index) => {
    const img = document.createElement("img");
    img.src = youtubeThumbFromUrl(item.videoUrl);
    img.className = "thumbnail";
    img.alt = item.title;

    img.addEventListener("click", () => {
      if (lastClicked === index) {
        window.open(item.videoUrl, "_blank");
      } else {
        fetchAndShowCSV(item.csv, item.title, item.videoUrl);
        lastClicked = index;
      }
    });

    container.appendChild(img);
  });
}

function fetchAndShowCSV(csvFileName, title, videoUrl) {
  fetch("csv/" + csvFileName)
    .then(response => response.text())
    .then(csvText => {
      const rows = csvText.trim().split("\n").map(row => row.split(","));
      const headerRow = rows[0];
      const dataRows = rows.slice(1);

      const excludeCols = [0, 1, 2, 5, 6]; // （既存仕様のまま）

      const table = document.createElement("table");

      const header = table.insertRow();
      headerRow.forEach((col, i) => {
        if (!excludeCols.includes(i)) {
          const th = document.createElement("th");
          th.textContent = col;
          header.appendChild(th);
        }
      });
      const favTh = document.createElement("th");
      favTh.textContent = "お気に入り";
      header.appendChild(favTh);

      const favSet = getFavSet();
      dataRows.forEach(cols => {
        const tr = table.insertRow();
        cols.forEach((col, i) => {
          if (!excludeCols.includes(i)) {
            const td = document.createElement("td");
            td.textContent = col;
            tr.appendChild(td);
          }
        });
        const url = cols[2], start = cols[5], duration = cols[6];
        const id = makeTrackId({ url, start, duration });

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

      const popup = document.getElementById("popup");
      const content = document.getElementById("popup-content");
      content.innerHTML = `<h2>${title}</h2>`;

      const thumb = document.createElement("img");
      thumb.src = youtubeThumbFromUrl(videoUrl);
      thumb.className = "popup-thumbnail";
      thumb.alt = title;
      thumb.addEventListener("click", () => {
        const zeroStartUrl = videoUrl.replace(/(\?.*)?$/, "") + "?t=0";
        window.open(zeroStartUrl, "_blank");
      });
      content.appendChild(thumb);

      content.appendChild(table);
      popup.style.display = "block";
    })
    .catch(err => alert("CSV読み込みエラー：" + err));
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
  lastClicked = null;
}
