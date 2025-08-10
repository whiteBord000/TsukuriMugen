// js/updates.js
function hasFromHome() {
  const sp = new URLSearchParams(location.search);
  return sp.get("from") === "home";
}

window.addEventListener("DOMContentLoaded", async () => {
  const guard = document.getElementById("guard");
  const area  = document.getElementById("changelog");
  if (!hasFromHome()) {
    guard.style.display = "block";
    return;
  }

  try {
    const res = await fetch("updates.json", { cache: "no-store" });
    const items = await res.json();

    // 日付降順
    items.sort((a, b) => (a.date < b.date ? 1 : -1));

    const list = document.getElementById("logList");
    items.forEach(it => {
      const div = document.createElement("div");
      div.className = "log-item";

      const head = document.createElement("div");
      head.className = "log-head";
      head.innerHTML = `
        <span class="log-date">${it.date}</span>
        <span class="log-title">${escapeHtml(it.title)}</span>
        ${it.tags?.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("") || ""}
      `;
      div.appendChild(head);

      if (it.notes && it.notes.length) {
        const body = document.createElement("div");
        body.className = "log-body";
        const ul = document.createElement("ul");
        it.notes.forEach(n => {
          const li = document.createElement("li");
          li.textContent = n;
          ul.appendChild(li);
        });
        body.appendChild(ul);
        div.appendChild(body);
      }

      list.appendChild(div);
    });

    area.style.display = "block";
  } catch (e) {
    guard.style.display = "block";
    console.error(e);
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
