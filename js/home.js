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

  /** Fond hero : Steam library_hero HD (header.jpg est trop petit → flou) */
  function heroBgUrl(game) {
    if (game.steam) {
      return (
        "https://cdn.cloudflare.steamstatic.com/steam/apps/" +
        game.steam +
        "/library_hero_2x.jpg"
      );
    }
    if (game.cover && game.cover.indexOf("/616x353/") !== -1) {
      return game.cover.replace("/616x353/", "/orig/");
    }
    return coverUrl(game);
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
    const coming = window.JEUXSTASH_COMING && window.JEUXSTASH_COMING.isComing(game);
    const price = formatPrice(game.price);
    let html = "";
    if (coming) {
      html +=
        '<span class="game-badge game-badge--coming">' +
        esc(window.JEUXSTASH_COMING.label(game)) +
        "</span>";
    } else if (out) {
      html += '<span class="game-badge game-badge--out">Rupture</span>';
    }
    if (price) {
      html +=
        '<span class="game-badge game-badge--price">' +
        (coming && out ? "Préco " : "") +
        price +
        "</span>";
    }
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
      return '<a class="btn ghost small" href="/guides/elden-ring-pas-cher">Guide</a>';
    }
    if (game.name === "Cyberpunk 2077") {
      return '<a class="btn ghost small" href="/guides/cyberpunk-pas-cher">Guide</a>';
    }
    if (game.name === "Baldur's Gate 3") {
      return '<a class="btn ghost small" href="/guides/baldurs-gate-3-pas-cher">Guide</a>';
    }
    if (game.name === "Forza Horizon 5") {
      return '<a class="btn ghost small" href="/guides/forza-horizon-5-pas-cher">Guide</a>';
    }
    if (game.name.indexOf("Call of Duty") === 0) {
      return '<a class="btn ghost small" href="/guides/call-of-duty-pas-cher">Guide</a>';
    }
    if (game.name.indexOf("Grand Theft Auto VI") === 0 || game.name.indexOf("GTA") === 0) {
      return '<a class="btn ghost small" href="/guides/gta-6-pas-cher">Guide</a>';
    }
    if (game.name.indexOf("EA Sports") === 0) {
      return '<a class="btn ghost small" href="/guides/ea-fc-pas-cher">Guide FC 27</a>';
    }
    return "";
  }

  function cardHTML(game) {
    const name = esc(game.name);
    const blurb = esc(game.blurb || "");
    const tag = esc(game.tag || "");
    const ig = esc(game.ig);
    const gg = esc(game.gg);
    const fiche =
      window.JEUXSTASH_FICHE && window.JEUXSTASH_FICHE.url
        ? esc(window.JEUXSTASH_FICHE.url(game))
        : "/deals?q=" + encodeURIComponent(game.name);
    const oos = game.stock === "out";
    const coming = window.JEUXSTASH_COMING && window.JEUXSTASH_COMING.isComing(game);
    const buy =
      oos && !coming
        ? '<span class="btn buy small is-oos" aria-disabled="true">Rupture</span>'
        : '<a class="btn buy small" href="' +
          ig +
          '" rel="sponsored noopener" target="_blank">' +
          (coming ? "Précommander" : "Voir le prix") +
          "</a>";
    return (
      '<article class="game-card' +
      (oos && !coming ? " is-oos" : "") +
      (coming ? " is-coming" : "") +
      '">' +
      '<div class="game-cover-wrap">' +
      '<a class="game-cover-link" href="' +
      fiche +
      '">' +
      '<img class="game-cover" src="' +
      coverUrl(game) +
      '" alt="' +
      name +
      '" width="460" height="215" loading="lazy" />' +
      badgesHTML(game) +
      "</a>" +
      (window.JEUXSTASH_WATCH ? window.JEUXSTASH_WATCH.btnHTML(game.name) : "") +
      "</div>" +
      '<div class="game-card-body">' +
      '<div class="card-meta">' +
      '<span class="tag">' +
      tag +
      "</span>" +
      (window.JEUXSTASH_VERDICT ? window.JEUXSTASH_VERDICT.chipHTML(game) : "") +
      "</div>" +
      '<h3><a class="game-title-link" href="' +
      fiche +
      '">' +
      name +
      "</a></h3>" +
      "<p>" +
      blurb +
      "</p>" +
      (window.JEUXSTASH_VERDICT ? window.JEUXSTASH_VERDICT.compareHTML(game) : "") +
      '<div class="row">' +
      '<a class="btn ghost small" href="' +
      fiche +
      '">Fiche</a>' +
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
      '<span class="tag">Budget</span>' +
      "<h3>Game Pass ou achat&nbsp;?</h3>" +
      "<p>Si vous testez beaucoup de jeux, l’abonnement peut revenir moins cher.</p>" +
      '<div class="row">' +
      '<a class="btn buy small" href="/guides/game-pass-vs-acheter">Lire le guide</a>' +
      '<a class="btn ghost small" href="https://gg.deals/" rel="noopener" target="_blank">Comparer</a>' +
      "</div></div></article>"
    );
  }

  function fillGrid(id, games, extraHTML) {
    const el = document.querySelector("#" + id + " .game-grid[data-rotate]");
    if (!el) return;
    el.innerHTML = games.map(cardHTML).join("") + (extraHTML || "");
    if (window.JEUXSTASH_WATCH) window.JEUXSTASH_WATCH.syncUI();
  }

  function setHero(game) {
    if (!game) return;
    const actions = document.querySelector(".hero-actions");
    const eyebrow = document.querySelector(".hero .eyebrow");
    const bgImg = document.getElementById("hero-bg-img");
    if (eyebrow) {
      eyebrow.textContent = plan.eyebrow + " · " + plan.label;
    }
    if (bgImg) {
      const hd = heroBgUrl(game);
      bgImg.src = hd;
      if (game.steam) {
        bgImg.srcset =
          "https://cdn.cloudflare.steamstatic.com/steam/apps/" +
          game.steam +
          "/library_hero.jpg 960w, " +
          "https://cdn.cloudflare.steamstatic.com/steam/apps/" +
          game.steam +
          "/library_hero_2x.jpg 1920w";
        bgImg.sizes = "100vw";
      } else {
        bgImg.removeAttribute("srcset");
        bgImg.removeAttribute("sizes");
      }
      bgImg.alt = "";
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
          buy.rel = "sponsored noopener";
          buy.target = "_blank";
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

  // Ce soir · 2h : sessions courtes, mix solo / coop
  (function fillTonight() {
    var prefer = [
      "Balatro",
      "Vampire Survivors",
      "It Takes Two",
      "Hades",
      "Overcooked 2",
      "PlateUp!",
      "PEAK",
      "Content Warning",
      "Lethal Company",
      "Celeste",
      "Stardew Valley",
      "Phasmophobia",
      "R.E.P.O.",
      "Hollow Knight",
    ];
    var list = [];
    prefer.forEach(function (name) {
      if (list.length >= 4) return;
      var g = byName(name);
      if (g && g.stock === "ok" && !used[g.name]) {
        list.push(g);
        used[g.name] = true;
      }
    });
    if (list.length < 4) {
      pick("chill", 4 - list.length, used).forEach(function (g) {
        if (g.stock === "ok") list.push(g);
      });
    }
    fillGrid("tonight", list.slice(0, 4));
  })();

  fillGrid("coop", pick("coop", 6, used));

  // À venir : précommandes / sorties (tri date croissante)
  (function fillComing() {
    var prefer = [
      "Call of Duty: Modern Warfare 4",
      "Grand Theft Auto VI",
      "Crimson Desert Enhanced",
      "Pragmata",
      "The Witcher 4",
    ];
    var list = [];
    prefer.forEach(function (name) {
      var g = byName(name);
      if (g && window.JEUXSTASH_COMING && window.JEUXSTASH_COMING.isComing(g)) list.push(g);
    });
    catalog.forEach(function (g) {
      if (list.length >= 6) return;
      if (!window.JEUXSTASH_COMING || !window.JEUXSTASH_COMING.isComing(g)) return;
      if (list.some(function (x) { return x.name === g.name; })) return;
      list.push(g);
    });
    list.sort(function (a, b) {
      var ra = a.release || "9999";
      var rb = b.release || "9999";
      return String(ra).localeCompare(String(rb));
    });
    fillGrid("coming", list.slice(0, 6));
  })();

  // Hits : gros titres + sport + hot (chill/sport sections retirées de l’accueil)
  const hitForce = [];
  ["Call of Duty: Black Ops 7", "Grand Theft Auto VI", "Black Myth: Wukong", "EA Sports FC 27"].forEach(function (name) {
    const g = byName(name);
    if (g && !used[g.name]) {
      hitForce.push(g);
      used[g.name] = true;
    }
  });
  const hits = hitForce
    .concat(pick("hot", 6, used))
    .concat(pick("chill", 2, used))
    .slice(0, 10);
  if (hits.length < 8) {
    pick(null, 8 - hits.length, used).forEach(function (g) {
      hits.push(g);
    });
  }
  fillGrid("hits", hits);

  // Grosses baisses : mix % fort + titres reconnus (pas que du −90 % obscur)
  (function fillPromos() {
    var rail = document.getElementById("promo-rail");
    var V = window.JEUXSTASH_VERDICT;
    if (!rail || !V) return;
    var FAME = {
      "Elden Ring": 1,
      "Baldur's Gate 3": 1,
      "Cyberpunk 2077": 1,
      "Hollow Knight: Silksong": 1,
      "Hollow Knight": 0.85,
      Balatro: 0.95,
      "Black Myth: Wukong": 1,
      "Helldivers 2": 0.95,
      "Red Dead Redemption 2": 0.95,
      "The Witcher 3": 0.9,
      "Hades II": 0.9,
      Hades: 0.8,
      "Clair Obscur: Expedition 33": 0.95,
      "Monster Hunter Wilds": 0.9,
      "Forza Horizon 5": 0.85,
      "GTA V Enhanced": 0.85,
      "Warhammer 40,000: Space Marine 2": 0.8,
      "Resident Evil 4": 0.8,
      "God of War": 0.85,
      "God of War Ragnarök": 0.9,
      "Marvel's Spider-Man": 0.8,
      "Marvel's Spider-Man 2": 0.85,
      "Hogwarts Legacy": 0.8,
      "No Man's Sky": 0.75,
      "Disco Elysium": 0.7,
      "It Takes Two": 0.75,
      "Sea of Thieves": 0.7,
      Minecraft: 0.85,
      "Call of Duty: Black Ops 7": 0.9,
      "EA Sports FC 27": 0.75,
      "Borderlands 4": 0.75,
      "Death Stranding 2": 0.75,
      "Alan Wake 2": 0.7,
      Palworld: 0.7,
      "Stardew Valley": 0.7,
    };
    function fameOf(g) {
      if (FAME[g.name] != null) return FAME[g.name];
      if ((g.cats || []).indexOf("hot") !== -1) return 0.45;
      return 0.15;
    }
    function promoScore(g, v) {
      var pct = v.savePct || 0;
      var fame = fameOf(g);
      var euros = v.store != null && g.price != null ? Math.max(0, v.store - g.price) : 0;
      return pct * (0.5 + 0.5 * fame) + Math.min(euros, 35) * 0.35 + fame * 28;
    }
    var ranked = catalog
      .filter(function (g) {
        return g.stock === "ok" && g.price != null && g.price > 0;
      })
      .map(function (g) {
        var v = V.for(g);
        return { game: g, pct: v.savePct || 0, v: v, score: promoScore(g, v), fame: fameOf(g) };
      })
      .filter(function (x) {
        return x.pct >= 25;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
    // Au moins 2 titres « connus » si possible, puis compléter
    var picked = [];
    var used = {};
    ranked.forEach(function (x) {
      if (picked.length >= 4) return;
      if (x.fame < 0.7) return;
      picked.push(x);
      used[x.game.name] = true;
    });
    ranked.forEach(function (x) {
      if (picked.length >= 4) return;
      if (used[x.game.name]) return;
      picked.push(x);
      used[x.game.name] = true;
    });
    if (!picked.length) {
      rail.innerHTML =
        '<p class="fine">Pas de grosse baisse détectée pour l’instant — <a href="/deals">voir le catalogue</a>.</p>';
      return;
    }
    rail.innerHTML = picked
      .map(function (x) {
        var g = x.game;
        var name = esc(g.name);
        var price = formatPrice(g.price) || "";
        var fiche =
          window.JEUXSTASH_FICHE && window.JEUXSTASH_FICHE.url
            ? esc(window.JEUXSTASH_FICHE.url(g))
            : esc(g.ig);
        var compare =
          x.v.store != null
            ? "Boutique ≈ " +
              Number(x.v.store).toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) +
              "\u00a0€"
            : "";
        return (
          '<div class="promo-card">' +
          '<div class="game-cover-wrap">' +
          '<a class="promo-card-media" href="' +
          fiche +
          '">' +
          '<img src="' +
          coverUrl(g) +
          '" alt="" width="230" height="107" loading="lazy" />' +
          '<span class="promo-save">−' +
          x.pct +
          "&nbsp;%</span>" +
          "</a>" +
          (window.JEUXSTASH_WATCH ? window.JEUXSTASH_WATCH.btnHTML(g.name) : "") +
          "</div>" +
          '<a class="promo-card-body" href="' +
          fiche +
          '">' +
          "<strong>" +
          name +
          "</strong>" +
          '<span class="promo-price">' +
          price +
          (compare ? " · " + esc(compare) : "") +
          "</span>" +
          "</a></div>"
        );
      })
      .join("");
    if (window.JEUXSTASH_WATCH) window.JEUXSTASH_WATCH.syncUI();
  })();

  var trust = document.getElementById("trust-stats");
  if (trust) {
    var n = catalog.length;
    var cheap = catalog.filter(function (g) {
      return g.stock === "ok" && g.price != null && g.price < 20;
    }).length;
    var upd = window.JEUXSTASH_PRICES_UPDATED || "";
    var dateLabel = "récemment";
    if (upd) {
      try {
        dateLabel = new Date(upd + "T12:00:00").toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        });
      } catch (e) {
        dateLabel = upd;
      }
    }
    trust.textContent =
      n + " jeux · " + cheap + " sous 20 € · maj. " + dateLabel + " · sans compte";
  }

  const stamp = document.getElementById("season-stamp");
  if (stamp) {
    stamp.textContent = "sélection " + plan.label.toLowerCase() + " · mise à jour mensuelle";
  }

  // Note hero : Black Friday ou sélection saison
  const seasonCta = document.getElementById("season-cta");
  const bf = plan.blackFriday;
  if (seasonCta) {
    if (bf) {
      seasonCta.href = bf.href;
      seasonCta.textContent =
        bf.phase === "live" ? "Black Friday — guide soldes" : bf.eyebrow + " — " + bf.cta.toLowerCase();
    } else if (plan.key === "automne") {
      seasonCta.href = "/guides/meilleurs-jeux-pas-cher-automne-2026";
      seasonCta.textContent = "Sélection automne";
    } else {
      seasonCta.href = "/guides/";
      seasonCta.textContent = "Voir les guides";
    }
  }

  // Guides money block — boost saison
  const money = document.getElementById("money-links");
  const guides = window.JEUXSTASH_GUIDES;
  if (money && guides && guides.length) {
    const boost = plan.guideBoost || [];
    const ranked = guides.slice().sort(function (a, b) {
      const sa = boost.indexOf(a.id) !== -1 ? 10 : a.evergreen ? 3 : 0;
      const sb = boost.indexOf(b.id) !== -1 ? 10 : b.evergreen ? 3 : 0;
      return sb - sa;
    });
    money.innerHTML = ranked
      .slice(0, 4)
      .map(function (g) {
        return (
          '<a href="' +
          g.href +
          '"><strong>' +
          esc(g.title) +
          "</strong><span>" +
          esc(g.blurb) +
          "</span></a>"
        );
      })
      .join("");
  }

  // Hasard → deals avec un jeu random
  const lucky = document.getElementById("home-lucky");
  if (lucky) {
    lucky.addEventListener("click", function () {
      const pool = catalog.filter(function (g) {
        return g.stock === "ok" && g.price != null;
      });
      const g = pool[Math.floor(Math.random() * pool.length)] || catalog[0];
      location.href = "/deals?q=" + encodeURIComponent(g.name);
    });
  }
})();
