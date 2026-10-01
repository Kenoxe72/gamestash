/* UI commune : thème, toast, retour en haut, guides liés, prix live sur articles */
(function () {
  var THEME_KEY = "jeuxstash-theme";

  function getTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      var dark = theme === "dark";
      toggle.setAttribute("aria-label", dark ? "Passer en mode clair" : "Passer en mode sombre");
      toggle.setAttribute("title", dark ? "Mode clair" : "Mode sombre");
      toggle.textContent = dark ? "☀" : "☾";
    }
  }

  applyTheme(getTheme());

  function mountThemeToggle() {
    var nav = document.querySelector(".site-header nav");
    if (!nav || document.getElementById("theme-toggle")) return;
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "theme-toggle";
    toggle.className = "theme-toggle";
    toggle.addEventListener("click", function () {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    });
    var cta = nav.querySelector(".nav-cta");
    if (cta) nav.insertBefore(toggle, cta);
    else nav.appendChild(toggle);
    applyTheme(getTheme());
  }
  mountThemeToggle();

  function toast(msg) {
    var el = document.getElementById("js-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "js-toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("is-on");
    }, 2200);
  }
  window.JEUXSTASH_toast = toast;

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "back-top";
  btn.setAttribute("aria-label", "Retour en haut");
  btn.innerHTML = "↑";
  document.body.appendChild(btn);
  function onScroll() {
    btn.classList.toggle("is-visible", window.scrollY > 480);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  onScroll();

  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
    var search = document.getElementById("deals-search");
    if (!search) return;
    e.preventDefault();
    search.focus();
    search.select();
  });

  var catalog = window.JEUXSTASH_CATALOG;
  var Fiche = window.JEUXSTASH_FICHE;

  /* Cartes jeu dans les guides (data-picks / data-games) */
  if (catalog && catalog.length && document.querySelector(".guide-picks")) {
    function escG(str) {
      return String(str == null ? "" : str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
    function findGameG(name) {
      var want = String(name || "").toLowerCase();
      for (var i = 0; i < catalog.length; i++) {
        if ((catalog[i].name || "").toLowerCase() === want) return catalog[i];
      }
      for (var j = 0; j < catalog.length; j++) {
        if ((catalog[j].name || "").toLowerCase().indexOf(want) !== -1) return catalog[j];
      }
      return null;
    }
    function coverG(game) {
      if (game.cover) return game.cover;
      if (game.steam) {
        return "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.steam + "/header.jpg";
      }
      return "";
    }
    function priceG(n) {
      if (n == null || Number.isNaN(n)) return null;
      return (
        Number(n).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "\u00a0€"
      );
    }
    function ficheG(game) {
      if (Fiche && Fiche.url) return Fiche.url(game);
      return "/deals?q=" + encodeURIComponent(game.name);
    }
    function pickHTML(game, note) {
      var price = priceG(game.price);
      var oos = game.stock === "out";
      var cover = coverG(game);
      var fiche = ficheG(game);
      return (
        '<article class="guide-pick">' +
        (cover
          ? '<a class="guide-pick-cover" href="' +
            escG(fiche) +
            '"><img src="' +
            escG(cover) +
            '" alt="' +
            escG(game.name) +
            '" width="460" height="215" loading="lazy" /></a>'
          : "") +
        '<div class="guide-pick-body"><h3><a href="' +
        escG(fiche) +
        '">' +
        escG(game.name) +
        "</a></h3>" +
        (note
          ? '<p class="guide-pick-note">' + escG(note) + "</p>"
          : game.blurb
            ? '<p class="guide-pick-note">' + escG(game.blurb) + "</p>"
            : "") +
        '<div class="guide-pick-row">' +
        (oos
          ? '<span class="guide-pick-price is-oos">Rupture / préco</span>'
          : price
            ? '<span class="guide-pick-price">' + price + "</span>"
            : "") +
        '<a class="btn ghost small" href="' +
        escG(fiche) +
        '">Fiche</a>' +
        (oos
          ? ""
          : '<a class="btn buy small" href="' +
            escG(game.ig) +
            '" rel="sponsored noopener" target="_blank">Voir le prix</a>') +
        '<a class="btn ghost small" href="' +
        escG(game.gg || "https://gg.deals/") +
        '" rel="noopener" target="_blank">Comparer</a>' +
        "</div></div></article>"
      );
    }
    document.querySelectorAll(".guide-picks").forEach(function (el) {
      if (el.getAttribute("data-ready")) return;
      var picks = [];
      try {
        if (el.getAttribute("data-picks")) picks = JSON.parse(el.getAttribute("data-picks"));
        else if (el.getAttribute("data-games")) {
          picks = JSON.parse(el.getAttribute("data-games")).map(function (n) {
            return { name: n };
          });
        }
      } catch (e) {
        return;
      }
      var html = picks
        .map(function (p) {
          var game = findGameG(p.name);
          return game ? pickHTML(game, p.note || "") : "";
        })
        .filter(Boolean)
        .join("");
      if (!html) return;
      el.innerHTML = html;
      el.setAttribute("data-ready", "1");
    });
  }

  /* FAQ guides → accordéon */
  (function () {
    var articleFaq = document.querySelector("article.article");
    if (!articleFaq || articleFaq.querySelector(".faq-list")) return;
    var faqH2 = null;
    Array.prototype.forEach.call(articleFaq.children, function (node) {
      if (node.tagName === "H2" && /faq/i.test(node.textContent || "")) faqH2 = node;
    });
    if (!faqH2) return;
    var list = document.createElement("div");
    list.className = "faq-list";
    var node = faqH2.nextElementSibling;
    var batch = [];
    while (
      node &&
      node.tagName !== "H2" &&
      !node.classList.contains("related-guides") &&
      !node.classList.contains("aff-box")
    ) {
      var next = node.nextElementSibling;
      if (node.tagName === "H3") {
        var a = next && next.tagName === "P" ? next : null;
        if (a) {
          var d = document.createElement("details");
          var s = document.createElement("summary");
          s.textContent = node.textContent;
          var ans = document.createElement("div");
          ans.className = "faq-a";
          ans.innerHTML = a.innerHTML;
          d.appendChild(s);
          d.appendChild(ans);
          batch.push(d);
          node.remove();
          a.remove();
          node = next.nextElementSibling;
          continue;
        }
      }
      node = next;
    }
    if (batch.length) {
      batch.forEach(function (d) {
        list.appendChild(d);
      });
      faqH2.insertAdjacentElement("afterend", list);
    }
  })();

  /* Guides mono-jeu : CTA fiche */
  (function () {
    var article = document.querySelector("article.article");
    if (!article || !catalog || !catalog.length) return;
    var h1 = article.querySelector("h1");
    if (!h1) return;
    function findGame(name) {
      var want = String(name || "").toLowerCase();
      for (var i = 0; i < catalog.length; i++) {
        if ((catalog[i].name || "").toLowerCase() === want) return catalog[i];
      }
      return null;
    }
    var mono = null;
    var map = [
      ["Elden Ring", /elden/i],
      ["Cyberpunk 2077", /cyberpunk/i],
      ["Baldur's Gate 3", /baldur/i],
      ["Forza Horizon 5", /forza/i],
      ["EA Sports FC 27", /fc\s*27|ea sports fc/i],
      ["Grand Theft Auto VI", /gta/i],
      ["Black Myth: Wukong", /wukong/i],
      ["Clair Obscur: Expedition 33", /expedition/i],
      ["Call of Duty: Black Ops 7", /black ops|call of duty/i],
    ];
    for (var m = 0; m < map.length; m++) {
      if (map[m][1].test(h1.textContent || "")) {
        mono = findGame(map[m][0]);
        break;
      }
    }
    if (!mono) return;
    var ficheHref =
      Fiche && Fiche.url ? Fiche.url(mono) : "/deals?q=" + encodeURIComponent(mono.name);
    article.querySelectorAll(".aff-box").forEach(function (box) {
      if (box.querySelector(".js-fiche-cta")) return;
      var a = document.createElement("a");
      a.className = "btn ghost small js-fiche-cta";
      a.href = ficheHref;
      a.textContent = "Fiche jeu";
      box.appendChild(a);
    });
    var heroImg = article.querySelector("img.game-cover");
    if (heroImg && !heroImg.closest("a")) {
      var wrap = document.createElement("a");
      wrap.className = "article-hero";
      wrap.href = ficheHref;
      wrap.setAttribute("aria-label", "Voir la fiche " + mono.name);
      heroImg.parentNode.insertBefore(wrap, heroImg);
      wrap.appendChild(heroImg);
      heroImg.removeAttribute("style");
      heroImg.classList.add("article-hero-img");
    }
  })();

  if (catalog && catalog.length) {
    var boxes = document.querySelectorAll(".article .aff-box");
    boxes.forEach(function (box) {
      var link = box.querySelector("a.btn.buy[href*='instant-gaming.com']");
      if (!link) return;
      var href = link.getAttribute("href") || "";
      var game = null;
      for (var i = 0; i < catalog.length; i++) {
        if (catalog[i].ig && href.indexOf(catalog[i].ig.split("?")[0]) !== -1) {
          game = catalog[i];
          break;
        }
        var m = href.match(/\/(\d+)-/);
        var m2 = (catalog[i].ig || "").match(/\/(\d+)-/);
        if (m && m2 && m[1] === m2[1]) {
          game = catalog[i];
          break;
        }
      }
      if (!game) return;
      if (box.querySelector(".live-price")) return;
      var pill = document.createElement("p");
      pill.className = "live-price";
      if (game.stock === "out" && (game.price == null || game.price === 0)) {
        pill.innerHTML = "<strong>Précommande / rupture clé</strong> — regarde la fiche IG.";
      } else if (game.stock === "out") {
        pill.innerHTML = "<strong>Clé en rupture</strong> — compare ailleurs ou reviens plus tard.";
      } else if (game.price != null) {
        var price = Number(game.price).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        pill.innerHTML =
          "Clé IG ≈ <strong>" +
          price +
          "&nbsp;€</strong>" +
          (window.JEUXSTASH_PRICES_UPDATED
            ? ' <span class="fine">· maj. ' + window.JEUXSTASH_PRICES_UPDATED + "</span>"
            : "");
      }
      if (pill.innerHTML) box.insertBefore(pill, box.querySelector(".btn, a.btn"));
    });
  }

  var article = document.querySelector("article.article");
  var guides = window.JEUXSTASH_GUIDES;
  if (!article || !guides || !guides.length) return;
  if (article.querySelector(".related-guides")) return;

  var path = location.pathname.replace(/\/$/, "");
  var current = null;
  for (var i = 0; i < guides.length; i++) {
    if (path.indexOf(guides[i].id) !== -1 || path.endsWith(guides[i].href.replace("/guides/", ""))) {
      current = guides[i];
      break;
    }
  }
  if (!current) {
    for (var j = 0; j < guides.length; j++) {
      if (path.indexOf(guides[j].href.replace(".html", "")) !== -1) {
        current = guides[j];
        break;
      }
    }
  }

  var pool = guides.filter(function (g) {
    return !current || g.id !== current.id;
  });
  var seasonApi = window.JEUXSTASH_SEASON;
  if (seasonApi) {
    var plan = seasonApi.current();
    pool = seasonApi.shuffle(pool, plan.seed + 7);
    pool.sort(function (a, b) {
      var sa = a.evergreen ? 1 : 0;
      var sb = b.evergreen ? 1 : 0;
      if (a.seasons && a.seasons.indexOf(plan.key) !== -1) sa += 2;
      if (b.seasons && b.seasons.indexOf(plan.key) !== -1) sb += 2;
      return sb - sa;
    });
  }
  var pick = pool.slice(0, 3);
  if (!pick.length) return;

  var box = document.createElement("div");
  box.className = "related-guides";
  box.innerHTML =
    "<h2>Aussi utiles</h2><ul>" +
    pick
      .map(function (g) {
        return (
          "<li><a href=\"" +
          g.href +
          '"><strong>' +
          g.title +
          "</strong><span>" +
          g.blurb +
          "</span></a></li>"
        );
      })
      .join("") +
    "</ul>";
  article.appendChild(box);
})();

/* Nav « Mes jeux » sur toutes les pages */
(function () {
  if (window.JEUXSTASH_WATCH) return;
  if (document.querySelector('script[src*="watchlist.js"]')) return;
  var s = document.createElement("script");
  s.src = "/js/watchlist.js?v=20260930x";
  s.defer = true;
  document.head.appendChild(s);
})();
