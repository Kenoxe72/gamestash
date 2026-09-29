(function () {
  const grid = document.getElementById("deals-grid");
  const search = document.getElementById("deals-search");
  const filters = document.getElementById("deals-filters");
  const platFilters = document.getElementById("deals-platforms");
  const empty = document.getElementById("deals-empty");
  const countEl = document.getElementById("deals-count");
  const sortEl = document.getElementById("deals-sort");
  const stockOnly = document.getElementById("deals-stock");
  const under20 = document.getElementById("deals-under20");
  const updatedEl = document.getElementById("deals-updated");
  if (!grid || !window.JEUXSTASH_CATALOG) return;

  let activeCat = "all";
  let activePlat = "all";

  if (updatedEl && window.JEUXSTASH_PRICES_UPDATED) {
    try {
      const d = new Date(window.JEUXSTASH_PRICES_UPDATED + "T12:00:00");
      updatedEl.textContent =
        "Prix maj. " +
        d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      updatedEl.textContent = "Prix maj. " + window.JEUXSTASH_PRICES_UPDATED;
    }
  }

  // ?q= / ?platform= / ?style= / ?sort= / ?stock= / ?under20=
  try {
    const params = new URLSearchParams(location.search);
    const q0 = params.get("q") || (location.hash ? decodeURIComponent(location.hash.slice(1)) : "");
    if (q0 && search) search.value = q0;
    const p0 = (params.get("platform") || "").toLowerCase();
    if (p0 && ["pc", "ps5", "switch", "xbox"].indexOf(p0) !== -1) {
      activePlat = p0;
    }
    const c0 = (params.get("style") || "").toLowerCase();
    if (c0 && ["hot", "coop", "chill", "action", "sport"].indexOf(c0) !== -1) {
      activeCat = c0;
    }
    const s0 = params.get("sort");
    if (s0 && sortEl) {
      const ok = ["featured", "price-asc", "price-desc", "name"];
      if (ok.indexOf(s0) !== -1) sortEl.value = s0;
    }
    if (params.get("stock") === "1" && stockOnly) stockOnly.checked = true;
    if (params.get("under20") === "1" && under20) under20.checked = true;
  } catch (e) {}

  if (filters) {
    filters.querySelectorAll("[data-filter]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-filter") === activeCat);
    });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function platformsOf(game) {
    if (game.platforms && game.platforms.length) return game.platforms;
    return ["pc"];
  }

  function coverUrl(game) {
    if (game.cover) return game.cover;
    if (game.steam) {
      return "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.steam + "/header.jpg";
    }
    return "";
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

  function platLabel(plats) {
    const order = ["pc", "ps5", "switch", "xbox"];
    const labels = { pc: "PC", ps5: "PS5", switch: "Switch", xbox: "Xbox" };
    return order
      .filter(function (p) {
        return plats.indexOf(p) !== -1;
      })
      .map(function (p) {
        return labels[p];
      })
      .join(" · ");
  }

  function badgesHTML(game) {
    const out = game.stock === "out";
    const price = formatPrice(game.price);
    const plat = platLabel(platformsOf(game));
    const hasAmz = !!game.amazon;
    let html = "";
    if (out) html += '<span class="game-badge game-badge--out">Clé rupture</span>';
    if (plat) html += '<span class="game-badge game-badge--plat">' + esc(plat) + "</span>";
    // Prix jaquette = toujours Instant Gaming (clé). Jamais le prix Amazon.
    if (price && !out) {
      html +=
        '<span class="game-badge game-badge--price" title="Prix clé Instant Gaming">' +
        "Clé " +
        price +
        "</span>";
    } else if (hasAmz && out) {
      html +=
        '<span class="game-badge game-badge--price game-badge--amz" title="Voir le prix sur Amazon">Sur Amazon</span>';
    }
    return html ? '<span class="game-badges">' + html + "</span>" : "";
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function searchHaystack(game) {
    const parts = [game.name, game.blurb];
    if (game.aliases && game.aliases.length) parts.push(game.aliases.join(" "));
    return norm(parts.join(" "));
  }

  function queryVariants(q) {
    const n = norm(q);
    if (!n) return [];
    const out = [n, n.replace(/\s+/g, "")];
    // chiffres ↔ chiffres romains (gta 6 ↔ gta vi)
    out.push(n.replace(/\b6\b/g, "vi").replace(/\b7\b/g, "vii").replace(/\b5\b/g, "v").replace(/\b4\b/g, "iv").replace(/\b3\b/g, "iii").replace(/\b2\b/g, "ii"));
    out.push(n.replace(/\bvii\b/g, "7").replace(/\bvi\b/g, "6").replace(/\bv\b/g, "5").replace(/\biv\b/g, "4").replace(/\biii\b/g, "3").replace(/\bii\b/g, "2"));
    // dédup
    const seen = {};
    return out.filter(function (v) {
      if (!v || seen[v]) return false;
      seen[v] = true;
      return true;
    });
  }

  function matchesQuery(game, q) {
    if (!q) return true;
    const hay = searchHaystack(game);
    const hayCompact = hay.replace(/\s+/g, "");
    const variants = queryVariants(q);
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (hay.indexOf(v) !== -1) return true;
      if (hayCompact.indexOf(v.replace(/\s+/g, "")) !== -1) return true;
    }
    return false;
  }

  function guideLink(game) {
    const map = {
      "Elden Ring": "/guides/elden-ring-pas-cher",
      "Cyberpunk 2077": "/guides/cyberpunk-pas-cher",
      "Baldur's Gate 3": "/guides/baldurs-gate-3-pas-cher",
      "Forza Horizon 5": "/guides/forza-horizon-5-pas-cher",
      "EA Sports FC 27": "/guides/ea-fc-pas-cher",
      "Grand Theft Auto VI": "/guides/gta-6-pas-cher",
    };
    if (map[game.name]) return '<a class="btn ghost small" href="' + map[game.name] + '">Guide</a>';
    if ((game.name || "").indexOf("Call of Duty") === 0) {
      return '<a class="btn ghost small" href="/guides/call-of-duty-pas-cher">Guide</a>';
    }
    return "";
  }

  function amazonGameUrl(query) {
    const tag = (window.JEUXSTASH_AMAZON_TAG || "").trim();
    let url = "https://www.amazon.fr/s?k=" + encodeURIComponent(query);
    if (tag) url += "&tag=" + encodeURIComponent(tag);
    return url;
  }

  function buyButtons(game) {
    const ig = game.ig;
    const amzQ = game.amazon;
    const oos = game.stock === "out";
    const price = formatPrice(game.price);
    const parts = [];

    if (ig) {
      if (oos) {
        parts.push('<span class="btn buy small is-oos" aria-disabled="true">Clé en rupture</span>');
      } else {
        parts.push(
          '<a class="btn buy small" href="' +
            esc(ig) +
            '" rel="sponsored noopener" target="_blank" title="Clé digitale Instant Gaming' +
            (price ? " — " + price : "") +
            '">Clé digitale</a>'
        );
      }
    }

    if (amzQ) {
      const cls = ig && !oos ? "btn ghost small" : "btn buy small";
      parts.push(
        '<a class="' +
          cls +
          '" href="' +
          esc(amazonGameUrl(amzQ)) +
          '" rel="sponsored noopener" target="_blank" title="Version physique — prix sur Amazon">Sur Amazon</a>'
      );
    }

    if (!parts.length) {
      parts.push(
        '<a class="btn buy small" href="https://www.instant-gaming.com/fr/?igr=gamer-47bd4c" rel="sponsored noopener" target="_blank">Chercher</a>'
      );
    }

    return parts.join("");
  }

  function primaryHref(game) {
    if (game.ig && game.stock !== "out") return game.ig;
    if (game.amazon) return amazonGameUrl(game.amazon);
    return game.ig || "https://www.instant-gaming.com/fr/?igr=gamer-47bd4c";
  }

  function cardHTML(game) {
    const cats = (game.cats || []).join(" ");
    const plats = platformsOf(game).join(" ");
    const name = esc(game.name);
    const blurb = esc(game.blurb || "");
    const tag = esc(game.tag || "");
    const gg = esc(game.gg);
    const oos = game.stock === "out";
    const cover = coverUrl(game);
    const primary = esc(primaryHref(game));
    const img = cover
      ? '<img class="game-cover" src="' +
        cover +
        '" alt="' +
        name +
        '" width="460" height="215" loading="lazy" />'
      : '<div class="game-cover game-cover--empty" aria-hidden="true"></div>';
    return (
      '<article class="game-card' +
      (oos ? " is-oos" : "") +
      '" data-name="' +
      game.name.toLowerCase().replace(/"/g, "") +
      '" data-cats="' +
      cats +
      '" data-platforms="' +
      plats +
      '">' +
      '<a class="game-cover-link" href="' +
      primary +
      '" rel="sponsored noopener" target="_blank">' +
      img +
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
      buyButtons(game) +
      '<a class="btn ghost small" href="' +
      gg +
      '" rel="noopener" target="_blank">Comparer</a>' +
      guideLink(game) +
      '<button type="button" class="btn ghost small js-share-deal" data-name="' +
      name +
      '" title="Copier le lien de recherche">Partager</button>' +
      "</div></div></article>"
    );
  }

  function sortList(list) {
    const mode = sortEl ? sortEl.value : "featured";
    const copy = list.slice();
    if (mode === "price-asc") {
      copy.sort(function (a, b) {
        const pa = a.price == null ? 9999 : a.price;
        const pb = b.price == null ? 9999 : b.price;
        return pa - pb;
      });
    } else if (mode === "price-desc") {
      copy.sort(function (a, b) {
        const pa = a.price == null ? -1 : a.price;
        const pb = b.price == null ? -1 : b.price;
        return pb - pa;
      });
    } else if (mode === "name") {
      copy.sort(function (a, b) {
        return a.name.localeCompare(b.name, "fr");
      });
    } else {
      copy.sort(function (a, b) {
        const sa = a.stock === "ok" ? 0 : 1;
        const sb = b.stock === "ok" ? 0 : 1;
        if (sa !== sb) return sa - sb;
        const pa = a.price == null ? 9999 : a.price;
        const pb = b.price == null ? 9999 : b.price;
        return pa - pb;
      });
    }
    return copy;
  }

  const RECENT_KEY = "jeuxstash_recent";

  function loadRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveRecent(name) {
    if (!name) return;
    var list = loadRecent().filter(function (n) {
      return n !== name;
    });
    list.unshift(name);
    list = list.slice(0, 6);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) {}
    renderRecent();
  }

  function byName(name) {
    for (var i = 0; i < window.JEUXSTASH_CATALOG.length; i++) {
      if (window.JEUXSTASH_CATALOG[i].name === name) return window.JEUXSTASH_CATALOG[i];
    }
    return null;
  }

  function renderRecent() {
    var wrap = document.getElementById("deals-recent");
    var track = document.getElementById("deals-recent-track");
    if (!wrap || !track) return;
    var names = loadRecent();
    var games = names.map(byName).filter(Boolean);
    if (!games.length) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    track.innerHTML = games
      .map(function (g) {
        var price =
          g.price != null
            ? Number(g.price).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "\u00a0€"
            : "—";
        return (
          '<button type="button" class="recent-chip" data-q="' +
          esc(g.name) +
          '"><span>' +
          esc(g.name) +
          "</span><em>" +
          price +
          "</em></button>"
        );
      })
      .join("");
  }

  function render(list) {
    grid.innerHTML = list
      .map(function (g, i) {
        return cardHTML(g).replace('class="game-card', 'class="game-card anim-card" style="--i:' + i + '"');
      })
      .join("");
    if (countEl) countEl.textContent = list.length + (list.length > 1 ? " jeux" : " jeu");
    if (empty) empty.hidden = list.length > 0;
  }

  function syncPlatChips() {
    if (!platFilters) return;
    platFilters.querySelectorAll("[data-platform]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-platform") === activePlat);
    });
  }

  function syncStyleChips() {
    if (!filters) return;
    filters.querySelectorAll("[data-filter]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-filter") === activeCat);
    });
  }

  function apply() {
    const q = (search && search.value ? search.value : "").trim().toLowerCase();
    let list = window.JEUXSTASH_CATALOG.filter(function (g) {
      const plats = platformsOf(g);
      const catOk = activeCat === "all" || (g.cats || []).indexOf(activeCat) !== -1;
      const platOk = activePlat === "all" || plats.indexOf(activePlat) !== -1;
      const qOk = matchesQuery(g, q);
      const stockOk = !stockOnly || !stockOnly.checked || g.stock === "ok";
      const cheapOk = !under20 || !under20.checked || (g.price != null && g.price > 0 && g.price < 20);
      return catOk && platOk && qOk && stockOk && cheapOk;
    });
    list = sortList(list);
    render(list);
    syncPlatChips();
    syncStyleChips();

    try {
      const url = new URL(location.href);
      if (q) url.searchParams.set("q", q);
      else url.searchParams.delete("q");
      if (activePlat !== "all") url.searchParams.set("platform", activePlat);
      else url.searchParams.delete("platform");
      if (activeCat !== "all") url.searchParams.set("style", activeCat);
      else url.searchParams.delete("style");
      const sortMode = sortEl ? sortEl.value : "featured";
      if (sortMode && sortMode !== "featured") url.searchParams.set("sort", sortMode);
      else url.searchParams.delete("sort");
      if (stockOnly && stockOnly.checked) url.searchParams.set("stock", "1");
      else url.searchParams.delete("stock");
      if (under20 && under20.checked) url.searchParams.set("under20", "1");
      else url.searchParams.delete("under20");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) {}
  }

  function luckyPick() {
    const pool = window.JEUXSTASH_CATALOG.filter(function (g) {
      return g.stock === "ok" && g.price != null && g.price > 0;
    });
    if (!pool.length) return;
    const g = pool[Math.floor(Math.random() * pool.length)];
    if (search) search.value = g.name;
    activeCat = "all";
    activePlat = "all";
    if (stockOnly) stockOnly.checked = false;
    if (under20) under20.checked = false;
    apply();
    saveRecent(g.name);
    const card = grid.querySelector(".game-card");
    if (card) {
      card.classList.add("is-lucky");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (window.JEUXSTASH_toast) {
      window.JEUXSTASH_toast("Au pif : " + g.name);
    }
  }

  grid.addEventListener("click", function (e) {
    const share = e.target.closest(".js-share-deal");
    if (share) {
      e.preventDefault();
      const name = share.getAttribute("data-name") || "";
      const url = location.origin + "/deals?q=" + encodeURIComponent(name);
      function ok() {
        if (window.JEUXSTASH_toast) window.JEUXSTASH_toast("Lien copié");
        saveRecent(name);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(ok).catch(function () {
          window.prompt("Copie ce lien :", url);
        });
      } else {
        window.prompt("Copie ce lien :", url);
      }
      return;
    }
    const cover = e.target.closest(".game-cover-link");
    if (cover) {
      const card = cover.closest(".game-card");
      const title = card && card.querySelector("h3");
      if (title) saveRecent(title.textContent);
    }
  });

  const recentTrack = document.getElementById("deals-recent-track");
  if (recentTrack) {
    recentTrack.addEventListener("click", function (e) {
      const chip = e.target.closest(".recent-chip");
      if (!chip || !search) return;
      search.value = chip.getAttribute("data-q") || "";
      apply();
    });
  }

  const luckyBtn = document.getElementById("deals-lucky");
  if (luckyBtn) luckyBtn.addEventListener("click", luckyPick);

  if (filters) {
    filters.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      activeCat = btn.getAttribute("data-filter");
      apply();
    });
  }

  if (platFilters) {
    platFilters.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-platform]");
      if (!btn) return;
      activePlat = btn.getAttribute("data-platform");
      apply();
    });
  }

  if (search) search.addEventListener("input", apply);
  if (sortEl) sortEl.addEventListener("change", apply);
  if (stockOnly) stockOnly.addEventListener("change", apply);
  if (under20) under20.addEventListener("change", apply);

  syncPlatChips();
  syncStyleChips();
  renderRecent();
  apply();
})();
