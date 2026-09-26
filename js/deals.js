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

  // ?q= / ?platform= / #hash prefill
  try {
    const params = new URLSearchParams(location.search);
    const q0 = params.get("q") || (location.hash ? decodeURIComponent(location.hash.slice(1)) : "");
    if (q0 && search) search.value = q0;
    const p0 = (params.get("platform") || "").toLowerCase();
    if (p0 && ["pc", "ps5", "switch", "xbox"].indexOf(p0) !== -1) {
      activePlat = p0;
    }
  } catch (e) {}

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
        '<span class="game-badge game-badge--price game-badge--amz" title="Voir le prix boîte sur Amazon">Boîte Amazon</span>';
    }
    return html ? '<span class="game-badges">' + html + "</span>" : "";
  }

  function guideLink(game) {
    const map = {
      "Elden Ring": "/guides/elden-ring-pas-cher.html",
      "Cyberpunk 2077": "/guides/cyberpunk-pas-cher.html",
      "Baldur's Gate 3": "/guides/baldurs-gate-3-pas-cher.html",
      "Forza Horizon 5": "/guides/forza-horizon-5-pas-cher.html",
    };
    const href = map[game.name];
    return href ? '<a class="btn ghost small" href="' + href + '">Guide</a>' : "";
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
          '" rel="sponsored noopener" target="_blank" title="Version physique — prix sur Amazon">Boîte Amazon</a>'
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

  function render(list) {
    grid.innerHTML = list.map(cardHTML).join("");
    if (countEl) countEl.textContent = list.length + (list.length > 1 ? " jeux" : " jeu");
    if (empty) empty.hidden = list.length > 0;
  }

  function syncPlatChips() {
    if (!platFilters) return;
    platFilters.querySelectorAll("[data-platform]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-platform") === activePlat);
    });
  }

  function apply() {
    const q = (search && search.value ? search.value : "").trim().toLowerCase();
    let list = window.JEUXSTASH_CATALOG.filter(function (g) {
      const plats = platformsOf(g);
      const catOk = activeCat === "all" || (g.cats || []).indexOf(activeCat) !== -1;
      const platOk = activePlat === "all" || plats.indexOf(activePlat) !== -1;
      const qOk =
        !q ||
        g.name.toLowerCase().indexOf(q) !== -1 ||
        (g.blurb || "").toLowerCase().indexOf(q) !== -1;
      const stockOk = !stockOnly || !stockOnly.checked || g.stock === "ok";
      const cheapOk = !under20 || !under20.checked || (g.price != null && g.price > 0 && g.price < 20);
      return catOk && platOk && qOk && stockOk && cheapOk;
    });
    list = sortList(list);
    render(list);
    syncPlatChips();

    try {
      const url = new URL(location.href);
      if (q) url.searchParams.set("q", q);
      else url.searchParams.delete("q");
      if (activePlat !== "all") url.searchParams.set("platform", activePlat);
      else url.searchParams.delete("platform");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) {}
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
  apply();
})();
