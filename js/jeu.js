/* Fiche jeu — résumé, verdict, config Steam, CTA Instant Gaming */
(function () {
  var root = document.getElementById("fiche-root");
  var F = window.JEUXSTASH_FICHE;
  var catalog = window.JEUXSTASH_CATALOG;
  if (!root || !F || !catalog) return;

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function coverUrl(game) {
    if (game.cover) return game.cover;
    if (game.steam) {
      return "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.steam + "/header.jpg";
    }
    return "";
  }

  /** Jaquette fiche = capsule Steam (format cover), pas library_hero (trop large / hors cadre) */
  function bannerUrl(game) {
    if (game.steam) {
      return (
        "https://cdn.cloudflare.steamstatic.com/steam/apps/" +
        game.steam +
        "/capsule_616x353.jpg"
      );
    }
    if (game.cover) return game.cover;
    return "";
  }

  function bannerSrcset(game) {
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

  function currentSlug() {
    var path = location.pathname.replace(/\/+$/, "");
    var parts = path.split("/").filter(Boolean);
    if (parts[0] === "jeu" && parts[1] && parts[1] !== "index.html") {
      return decodeURIComponent(parts[1]);
    }
    var root = document.getElementById("fiche-root");
    if (root && root.getAttribute("data-slug")) return root.getAttribute("data-slug");
    var q = new URLSearchParams(location.search);
    return q.get("slug") || q.get("q") || "";
  }

  function guideFor(game) {
    var map = {
      "Elden Ring": "/guides/elden-ring-pas-cher",
      "Cyberpunk 2077": "/guides/cyberpunk-pas-cher",
      "Baldur's Gate 3": "/guides/baldurs-gate-3-pas-cher",
      "Forza Horizon 5": "/guides/forza-horizon-5-pas-cher",
      "EA Sports FC 27": "/guides/ea-fc-pas-cher",
      "Grand Theft Auto VI": "/guides/gta-6-pas-cher",
      "Black Myth: Wukong": "/guides/black-myth-wukong-pas-cher",
      "Clair Obscur: Expedition 33": "/guides/expedition-33-pas-cher",
    };
    if (map[game.name]) return map[game.name];
    if ((game.name || "").indexOf("Call of Duty") === 0) return "/guides/call-of-duty-pas-cher";
    return null;
  }

  function platLabel(game) {
    var plats = game.platforms || [];
    var labels = { pc: "PC", ps5: "PS5", switch: "Switch", xbox: "Xbox" };
    return plats
      .map(function (p) {
        return labels[p] || p;
      })
      .join(" · ");
  }

  function sanitizeSteamHtml(html) {
    if (!html) return "";
    return String(html)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/on\w+\s*=\s*'[^']*'/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/<(?!\/?(?:ul|ol|li|br|p|strong|b|em|i|h[1-3])\b)[^>]+>/gi, "");
  }

  function setMeta(game) {
    var title = game.name + " — prix, résumé & config — JeuxStash";
    var desc =
      (game.blurb || "Fiche JeuxStash") +
      " Prix clé Instant Gaming, verdict, config PC si dispo.";
    document.title = title;
    var md = document.getElementById("meta-desc");
    if (md) md.setAttribute("content", desc);
    var can = document.getElementById("canonical");
    if (can) can.setAttribute("href", "https://www.jeuxstash.fr" + F.url(game));
    var ogt = document.querySelector('meta[property="og:title"]');
    if (!ogt) {
      ogt = document.createElement("meta");
      ogt.setAttribute("property", "og:title");
      document.head.appendChild(ogt);
    }
    ogt.setAttribute("content", title);
  }

  function renderShell(game) {
    var price = formatPrice(game.price);
    var oos = game.stock === "out";
    var cover = bannerUrl(game);
    var coverFb = coverUrl(game);
    var srcset = bannerSrcset(game);
    var guide = guideFor(game);
    var V = window.JEUXSTASH_VERDICT;
    var verdict = V ? V.for(game) : null;

    root.innerHTML =
      '<article class="fiche">' +
      (cover
        ? '<div class="fiche-banner">' +
          '<img class="fiche-cover" src="' +
          esc(cover) +
          '"' +
          (srcset ? ' srcset="' + esc(srcset) + '" sizes="616px"' : "") +
          ' alt="' +
          esc(game.name) +
          '" width="616" height="353" loading="eager" fetchpriority="high"' +
          (coverFb && coverFb !== cover ? ' data-fallback="' + esc(coverFb) + '"' : "") +
          " />" +
          "</div>"
        : "") +
      '<div class="fiche-hero">' +
      '<div class="fiche-kicker">' +
      '<span class="tag">' +
      esc(game.tag || "Jeu") +
      "</span>" +
      (verdict ? V.chipHTML(game) : "") +
      (window.JEUXSTASH_WATCH ? window.JEUXSTASH_WATCH.btnHTML(game.name) : "") +
      "</div>" +
      "<h1>" +
      esc(game.name) +
      "</h1>" +
      '<p class="fiche-blurb">' +
      esc(game.blurb || "") +
      "</p>" +
      (platLabel(game) ? '<p class="fine">Plateformes : ' + esc(platLabel(game)) + "</p>" : "") +
      (verdict && verdict.compare
        ? '<p class="price-compare">' + esc(verdict.compare) + "</p>"
        : "") +
      '<div class="fiche-price-row">' +
      (oos
        ? '<span class="btn buy is-oos" aria-disabled="true">Clé en rupture</span>'
        : price
          ? '<span class="fiche-price">' + price + "</span>"
          : "") +
      (oos
        ? ""
        : '<a class="btn buy" href="' +
          esc(game.ig) +
          '" rel="sponsored noopener" target="_blank">Voir le prix sur Instant Gaming</a>') +
      '<a class="btn ghost" href="' +
      esc(game.gg || "https://gg.deals/") +
      '" rel="noopener" target="_blank">Comparer</a>' +
      (guide ? '<a class="btn ghost" href="' + guide + '">Guide d’achat</a>' : "") +
      "</div>" +
      '<p class="fine">Affiliation Instant Gaming — vous payez le même prix.</p>' +
      "</div>" +
      '<div class="fiche-grid">' +
      '<section class="fiche-block" id="fiche-resume">' +
      "<h2>Résumé</h2>" +
      '<p class="fine" id="fiche-resume-status">Chargement du résumé Steam…</p>' +
      '<div id="fiche-resume-body"></div>' +
      "</section>" +
      '<section class="fiche-block" id="fiche-specs">' +
      "<h2>Config PC</h2>" +
      '<p class="fine" id="fiche-specs-status">Chargement des prérequis…</p>' +
      '<div id="fiche-specs-body" class="fiche-specs-body"></div>' +
      "</section>" +
      "</div>" +
      '<section class="fiche-block fiche-cta">' +
      "<h2>Prêt à comparer&nbsp;?</h2>" +
      "<p>Regardez le prix clé, vérifiez ailleurs, puis achetez seulement si le verdict vous convient.</p>" +
      '<div class="row">' +
      (oos
        ? ""
        : '<a class="btn buy" href="' +
          esc(game.ig) +
          '" rel="sponsored noopener" target="_blank">Instant Gaming</a>') +
      '<a class="btn ghost" href="' +
      esc(game.gg || "https://gg.deals/") +
      '" rel="noopener" target="_blank">GG.deals</a>' +
      '<a class="btn ghost" href="/deals">Retour catalogue</a>' +
      "</div></section>" +
      "</article>";

    if (window.JEUXSTASH_WATCH) window.JEUXSTASH_WATCH.syncUI();

    var img = root.querySelector(".fiche-cover[data-fallback]");
    if (img) {
      img.addEventListener("error", function onErr() {
        img.removeEventListener("error", onErr);
        var fb = img.getAttribute("data-fallback");
        if (!fb) return;
        img.removeAttribute("data-fallback");
        img.removeAttribute("srcset");
        img.src = fb;
      });
    }
  }

  function fillSteam(game, data) {
    var resumeStatus = document.getElementById("fiche-resume-status");
    var resumeBody = document.getElementById("fiche-resume-body");
    var specsStatus = document.getElementById("fiche-specs-status");
    var specsBody = document.getElementById("fiche-specs-body");

    if (resumeBody) {
      var bits = [];
      if (data && data.short) {
        bits.push("<p>" + esc(data.short) + "</p>");
      } else {
        bits.push("<p>" + esc(game.blurb || "Pas de résumé détaillé pour ce titre.") + "</p>");
      }
      if (data && data.genres && data.genres.length) {
        bits.push('<p class="fine">Genres : ' + esc(data.genres.join(", ")) + "</p>");
      }
      if (data && data.developers && data.developers.length) {
        bits.push('<p class="fine">Développeur : ' + esc(data.developers.join(", ")) + "</p>");
      }
      if (data && data.release) {
        bits.push('<p class="fine">Sortie : ' + esc(data.release) + "</p>");
      }
      if (data && data.metacritic) {
        bits.push('<p class="fine">Metacritic : ' + esc(String(data.metacritic)) + "</p>");
      }
      resumeBody.innerHTML = bits.join("");
      if (resumeStatus) resumeStatus.hidden = true;
    }

    if (specsBody) {
      var hasPc = game.platforms && game.platforms.indexOf("pc") !== -1;
      if (!game.steam) {
        specsBody.innerHTML =
          "<p>Pas d’ID Steam pour ce titre — la config dépend de la plateforme (console / store).</p>";
        if (specsStatus) specsStatus.hidden = true;
        return;
      }
      if (!hasPc && !(data && (data.min || data.rec))) {
        specsBody.innerHTML = "<p>Titre surtout console — pas de config PC listée ici.</p>";
        if (specsStatus) specsStatus.hidden = true;
        return;
      }
      if (!data || (!data.min && !data.rec)) {
        specsBody.innerHTML =
          '<p>Prérequis indisponibles pour le moment. Voir la fiche <a href="https://store.steampowered.com/app/' +
          esc(String(game.steam)) +
          '/" rel="noopener" target="_blank">Steam</a>.</p>';
        if (specsStatus) specsStatus.hidden = true;
        return;
      }
      var html = "";
      if (data.min) {
        html += '<div class="fiche-req"><h3>Minimum</h3><div class="fiche-req-html">' + sanitizeSteamHtml(data.min) + "</div></div>";
      }
      if (data.rec) {
        html +=
          '<div class="fiche-req"><h3>Recommandé</h3><div class="fiche-req-html">' +
          sanitizeSteamHtml(data.rec) +
          "</div></div>";
      }
      specsBody.innerHTML = html;
      if (specsStatus) specsStatus.hidden = true;
    }
  }

  function loadSteam(game) {
    if (!game.steam) {
      fillSteam(game, null);
      return;
    }
    fetch("/api/steam/" + game.steam)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        fillSteam(game, data && data.ok ? data : null);
      })
      .catch(function () {
        fillSteam(game, null);
      });
  }

  var slug = currentSlug();
  var game = F.findBySlug(catalog, slug);

  if (!slug) {
    root.innerHTML =
      '<p>Choisissez un jeu dans le <a href="/deals">catalogue</a>.</p>';
    return;
  }

  if (!game) {
    root.innerHTML =
      "<p>Jeu introuvable pour « " +
      esc(slug) +
      " ».</p><p><a class=\"btn buy\" href=\"/deals\">Retour catalogue</a></p>";
    return;
  }

  // Canonique /jeu/{slug}/ — redirige les anciens ?slug=
  try {
    var pretty = F.url(game);
    var now = location.pathname.replace(/\/+$/, "") + "/";
    if (location.search || now !== pretty) {
      if (location.search) {
        location.replace(pretty);
        return;
      }
      history.replaceState(null, "", pretty);
    }
  } catch (e) {}

  setMeta(game);
  renderShell(game);
  loadSteam(game);
})();
