/* Accueil dynamique — hero + grilles selon saison / mois */
(function () {
  const catalog = window.JEUXSTASH_CATALOG;
  const seasonApi = window.JEUXSTASH_SEASON;
  if (!catalog || !seasonApi) return;

  const plan = seasonApi.current();
  const seed = plan.seed;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function coverUrl(game) {
    if (game.cover) return game.cover;
    return "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.steam + "/header.jpg";
  }

  function formatPrice(n) {
    if (n == null || Number.isNaN(n)) return null;
    return (
      Number(n).toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "\u00a0€"
    );
  }

  function badgesHTML(game) {
    const out = game.stock === "out";
    const price = formatPrice(game.price);
    let html = "";
    if (out) html += '<span class="game-badge game-badge--out">Rupture</span>';
    if (price) html += '<span class="game-badge game-badge--price">' + price + "</span>";
    return html ? '<span class="game-badges">' + html + "</span>" : "";
  }

  function byName(name) {
    for (let i = 0; i < catalog.length; i++) {
      if (catalog[i].name === name) return catalog[i];
    }
    return null;
  }

  function score(game, preferCat) {
    let s = 0;
    const cats = game.cats || [];
    if (preferCat && cats.indexOf(preferCat) !== -1) s += 10;
    (plan.boost || []).forEach(function (b) {
      if (cats.indexOf(b) !== -1) s += 4;
    });
    if (game.stock === "ok") s += 8;
    if (game.stock === "out") s -= 3;
    if (game.price != null && game.price > 0 && game.price < 20) s += 2;
    return s;
  }

  function pick(preferCat, count, exclude) {
    exclude = exclude || {};
    const pool = catalog.filter(function (g) {
      return !exclude[g.name] && (!preferCat || (g.cats || []).indexOf(preferCat) !== -1);
    });
    const ranked = seasonApi.shuffle(pool, seed + (preferCat || "x").length * 17).sort(function (a, b) {
      return score(b, preferCat) - score(a, preferCat);
    });
    const out = [];
    for (let i = 0; i < ranked.length && out.length < count; i++) {
      out.push(ranked[i]);
      exclude[ranked[i].name] = true;
    }
    return out;
  }

  function guideLinks(game) {
    if (game.name === "Elden Ring") {
      return '<a class="btn ghost small" href="/guides/elden-ring-pas-cher.html">Guide</a>';
    }
    if (game.name === "Cyberpunk 2077") {
      return '<a class="btn ghost small" href="/guides/cyberpunk-pas-cher.html">Guide</a>';
    }
    if (game.name === "Baldur's Gate 3") {
      return '<a class="btn ghost small" href="/guides/baldurs-gate-3-pas-cher.html">Guide</a>';
    }
    if (game.name === "Forza Horizon 5") {
      return '<a class="btn ghost small" href="/guides/forza-horizon-5-pas-cher.html">Guide</a>';
    }
    if (game.name.indexOf("EA Sports") === 0) {
      return '<a class="btn ghost small" href="/guides/meilleurs-jeux-sport-2026.html">Faut-il acheter ?</a>';
    }
    return "";
  }

  function cardHTML(game) {
    const name = esc(game.name);
    const blurb = esc(game.blurb || "");
    const tag = esc(game.tag || "");
    const ig = esc(game.ig);
    const gg = esc(game.gg);
    const oos = game.stock === "out";
    const buy = oos
      ? '<span class="btn buy small is-oos" aria-disabled="true">Rupture</span>'
      : '<a class="btn buy small" href="' + ig + '" rel="sponsored noopener" target="_blank">Voir le prix</a>';
    return (
      '<article class="game-card' +
      (oos ? " is-oos" : "") +
      '">' +
      '<a class="game-cover-link" href="' +
      ig +
      '" rel="sponsored noopener" target="_blank">' +
      '<img class="game-cover" src="' +
      coverUrl(game) +
      '" alt="' +
      name +
      '" width="460" height="215" loading="lazy" />' +
      badgesHTML(game) +
      "</a>" +
      '<div class="game-card-body">' +
      '<span class="tag">' +
      tag +
      "</span>" +
      "<h3>" +
      name +
      "</h3>" +
      "<p>" +
      blurb +
      "</p>" +
      '<div class="row">' +
      buy +
      '<a class="btn ghost small" href="' +
      gg +
      '" rel="noopener" target="_blank">Comparer</a>' +
      guideLinks(game) +
      "</div></div></article>"
    );
  }

  function tipCard() {
    return (
      '<article class="game-card game-card--tip">' +
      '<div class="game-card-body">' +
      '<span class="tag">Astuce budget</span>' +
      "<h3>Game Pass d’abord ?</h3>" +
      "<p>Si tu testes beaucoup, l’abo peut battre l’achat.</p>" +
      '<div class="row">' +
      '<a class="btn buy small" href="/guides/game-pass-vs-acheter.html">Mini-guide</a>' +
      '<a class="btn ghost small" href="https://gg.deals/" rel="noopener" target="_blank">Comparer</a>' +
      "</div></div></article>"
    );
  }

  function fillGrid(id, games, extraHTML) {
    const el = document.querySelector("#" + id + " .game-grid[data-rotate]");
    if (!el) return;
    el.innerHTML = games.map(cardHTML).join("") + (extraHTML || "");
  }

  function setHero(game) {
    if (!game) return;
    const feature = document.querySelector(".hero-feature");
    const actions = document.querySelector(".hero-actions");
    const eyebrow = document.querySelector(".hero .eyebrow");
    if (eyebrow) {
      eyebrow.textContent = plan.eyebrow + " · " + plan.label;
    }
    if (feature) {
      feature.href = game.ig;
      feature.classList.toggle("is-oos", game.stock === "out");
      const img = feature.querySelector("img");
      if (img) {
        img.src = coverUrl(game);
        img.alt = game.name;
      }
      const strong = feature.querySelector("strong");
      const em = feature.querySelector("em");
      if (strong) strong.textContent = game.name;
      if (em) em.textContent = game.blurb || plan.blurb;
      const old = feature.querySelector(".game-badges");
      if (old) old.remove();
      feature.insertAdjacentHTML("beforeend", badgesHTML(game));
    }
    if (actions) {
      const buy = actions.querySelector(".btn.buy, .btn.is-oos");
      if (buy) {
        if (game.stock === "out") {
          const span = document.createElement("span");
          span.className = "btn buy is-oos";
          span.setAttribute("aria-disabled", "true");
          span.textContent = game.name + " — rupture";
          buy.replaceWith(span);
        } else if (buy.tagName === "A") {
          buy.href = game.ig;
          buy.textContent = "Voir le prix — " + game.name;
        } else {
          const a = document.createElement("a");
          a.className = "btn buy";
          a.href = game.ig;
          a.rel = "sponsored noopener";
          a.target = "_blank";
          a.textContent = "Voir le prix — " + game.name;
          buy.replaceWith(a);
        }
      }
    }
  }

  // Hero : priorité stock OK parmi heroPrefer, sinon meilleur score hot
  let hero = null;
  for (let i = 0; i < plan.heroPrefer.length; i++) {
    const g = byName(plan.heroPrefer[i]);
    if (g && g.stock === "ok") {
      hero = g;
      break;
    }
  }
  if (!hero) {
    for (let i = 0; i < plan.heroPrefer.length; i++) {
      hero = byName(plan.heroPrefer[i]);
      if (hero) break;
    }
  }
  if (!hero) hero = pick("hot", 1)[0] || catalog[0];
  setHero(hero);

  const used = {};
  if (hero) used[hero.name] = true;

  fillGrid("coop", pick("coop", 6, used));
  fillGrid("chill", pick("chill", 4, used), tipCard());
  fillGrid("sport", pick("sport", 2, used));
  // hits : mélange hot + boost saison, 8 cartes
  const hits = pick("hot", 8, used);
  if (hits.length < 8) {
    pick(null, 8 - hits.length, used).forEach(function (g) {
      hits.push(g);
    });
  }
  fillGrid("hits", hits);

  const stamp = document.getElementById("season-stamp");
  if (stamp) {
        stamp.textContent = "sélection " + plan.label.toLowerCase() + " · ça tourne chaque mois";
  }
})();
