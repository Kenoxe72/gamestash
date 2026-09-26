/* Liste guides : evergreen + boost saison, ordre qui change chaque mois */
(function () {
  const guides = window.JEUXSTASH_GUIDES;
  const seasonApi = window.JEUXSTASH_SEASON;
  const grid = document.querySelector(".guide-grid[data-rotate]");
  if (!guides || !seasonApi || !grid) return;

  const plan = seasonApi.current();
  const boost = plan.guideBoost || [];

  function score(g) {
    let s = 0;
    if (g.evergreen) s += 5;
    if (boost.indexOf(g.id) !== -1) s += 20;
    if (g.seasons && g.seasons.indexOf(plan.key) !== -1) s += 10;
    return s;
  }

  const ordered = seasonApi.shuffle(guides, plan.seed + 99).sort(function (a, b) {
    return score(b) - score(a);
  });

  // Affiche 7 guides max (varie), evergreen toujours inclus
  const shown = [];
  const seen = {};
  ordered.forEach(function (g) {
    if (shown.length >= 7) return;
    if (g.evergreen || boost.indexOf(g.id) !== -1 || (g.seasons && g.seasons.indexOf(plan.key) !== -1)) {
      shown.push(g);
      seen[g.id] = true;
    }
  });
  ordered.forEach(function (g) {
    if (shown.length >= 7) return;
    if (!seen[g.id]) {
      shown.push(g);
      seen[g.id] = true;
    }
  });

  function cardHTML(g, i) {
    const num = String(i + 1).padStart(2, "0");
    const featured = i === 0 ? " guide-card--featured" : "";
    const thumb = g.thumb
      ? '<img class="guide-thumb" src="' + g.thumb + '" alt="" loading="lazy" width="460" height="215" />'
      : "";
    return (
      '<a class="guide-card' +
      featured +
      '" href="' +
      g.href +
      '">' +
      thumb +
      '<span class="guide-num">' +
      num +
      "</span>" +
      '<span class="guide-kicker">' +
      g.kicker +
      "</span>" +
      "<strong>" +
      g.title +
      "</strong>" +
      "<span>" +
      g.blurb +
      "</span>" +
      "</a>"
    );
  }

  grid.innerHTML = shown.map(cardHTML).join("");

  const note = document.getElementById("guides-season-note");
  if (note) {
    note.textContent =
      "À la une ce " +
      plan.label.toLowerCase() +
      " · les autres guides restent accessibles via Google / sitemap.";
  }
})();
