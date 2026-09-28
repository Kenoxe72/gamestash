/* UI commune : toast, retour en haut, guides liés, prix live sur articles */
(function () {
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

  // Back to top
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

  // / focuses search when present
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

  // Live price badge on guide aff-boxes from catalog
  var catalog = window.JEUXSTASH_CATALOG;
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
        // match by product id in URL
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

  // Related guides on article pages
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
        return '<li><a href="' + g.href + '">' + g.title + "</a> — " + g.blurb + "</li>";
      })
      .join("") +
    "</ul>";
  article.appendChild(box);
})();
