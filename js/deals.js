(function () {
  const grid = document.getElementById("deals-grid");
  const search = document.getElementById("deals-search");
  const filters = document.getElementById("deals-filters");
  const empty = document.getElementById("deals-empty");
  const countEl = document.getElementById("deals-count");
  if (!grid || !window.JEUXSTASH_CATALOG) return;

  let activeCat = "all";

  function coverUrl(steamId) {
    return "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamId + "/header.jpg";
  }

  function cardHTML(game) {
    const cats = (game.cats || []).join(" ");
    return (
      '<article class="game-card" data-name="' +
      game.name.toLowerCase() +
      '" data-cats="' +
      cats +
      '">' +
      '<a class="game-cover-link" href="' +
      game.ig +
      '" rel="sponsored noopener" target="_blank">' +
      '<img class="game-cover" src="' +
      coverUrl(game.steam) +
      '" alt="' +
      game.name +
      '" width="460" height="215" loading="lazy" />' +
      "</a>" +
      '<div class="game-card-body">' +
      '<span class="tag">' +
      game.tag +
      "</span>" +
      "<h3>" +
      game.name +
      "</h3>" +
      "<p>" +
      game.blurb +
      "</p>" +
      '<div class="row">' +
      '<a class="btn buy small" href="' +
      game.ig +
      '" rel="sponsored noopener" target="_blank">Acheter</a>' +
      '<a class="btn ghost small" href="' +
      game.gg +
      '" rel="noopener" target="_blank">Comparer</a>' +
      "</div></div></article>"
    );
  }

  function render(list) {
    grid.innerHTML = list.map(cardHTML).join("");
    if (countEl) countEl.textContent = list.length + (list.length > 1 ? " jeux" : " jeu");
    if (empty) empty.hidden = list.length > 0;
  }

  function apply() {
    const q = (search && search.value ? search.value : "").trim().toLowerCase();
    const list = window.JEUXSTASH_CATALOG.filter(function (g) {
      const catOk = activeCat === "all" || (g.cats || []).indexOf(activeCat) !== -1;
      const qOk = !q || g.name.toLowerCase().indexOf(q) !== -1 || (g.blurb || "").toLowerCase().indexOf(q) !== -1;
      return catOk && qOk;
    });
    render(list);
  }

  if (filters) {
    filters.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      activeCat = btn.getAttribute("data-filter");
      filters.querySelectorAll("[data-filter]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      apply();
    });
  }

  if (search) search.addEventListener("input", apply);

  apply();
})();
