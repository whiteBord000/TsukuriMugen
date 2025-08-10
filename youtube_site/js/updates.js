window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("js/updates.json", { cache: "no-store" });
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
  } catch (e) {
    console.error("更新情報の読み込みに失敗しました:", e);
    const list = document.getElementById("logList");
    list.innerHTML = "<p>読み込みに失敗しました。時間をおいて再度お試しください。</p>";
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
