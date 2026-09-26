/* UI commune : retour en haut + guides liés */
(function () {
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
  // match by filename
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
  // prefer same season / evergreen mix
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
