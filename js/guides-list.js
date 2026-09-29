/* Liste guides : evergreen + boost saison, ordre qui change chaque mois */
(function () {
  const guides = window.JEUXSTASH_GUIDES;
  const seasonApi = window.JEUXSTASH_SEASON;
  const grid = document.querySelector(".guide-grid[data-rotate]");
  if (!guides || !seasonApi || !grid) return;

  const plan = seasonApi.current();
  const boost = plan.guideBoost || [];
  let showAll = false;

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

  function pickSeasonal() {
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
    return shown;
  }

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
      '" style="--i:' +
      i +
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

  function render() {
    const list = showAll ? ordered : pickSeasonal();
    grid.innerHTML = list.map(cardHTML).join("");
    const note = document.getElementById("guides-season-note");
    if (note) {
      var seasonWord = plan.label.toLowerCase();
      // cet devant voyelle / h muet : cet automne, cet hiver, cet été — ce printemps
      var ce = /^[aeiouyàâäéèêëïîôùûüœæh]/i.test(seasonWord) ? "cet " : "ce ";
      note.textContent = showAll
        ? list.length + " guides · filtre saison désactivé"
        : "À la une " + ce + seasonWord + " · " + list.length + " guides";
    }
    const toggle = document.getElementById("guides-toggle-all");
    if (toggle) {
      toggle.textContent = showAll ? "Voir la sélection" : "Tous les guides";
      toggle.setAttribute("aria-pressed", showAll ? "true" : "false");
    }
  }

  const toggle = document.getElementById("guides-toggle-all");
  if (toggle) {
    toggle.addEventListener("click", function () {
      showAll = !showAll;
      render();
    });
  }

  render();
})();
