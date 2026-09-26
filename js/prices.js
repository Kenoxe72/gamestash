/* Badges prix / rupture sur les jaquettes (catalogue) */
(function () {
  const catalog = window.JEUXSTASH_CATALOG;
  if (!catalog || !catalog.length) return;

  function byIg(href) {
    if (!href) return null;
    const id = href.match(/instant-gaming\.com\/fr\/(\d+)/);
    if (!id) return null;
    const needle = "/fr/" + id[1] + "-";
    for (let i = 0; i < catalog.length; i++) {
      if (catalog[i].ig && catalog[i].ig.indexOf(needle) !== -1) return catalog[i];
    }
    return null;
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
    return html;
  }

  function disableBuy(btn) {
    if (!btn || btn.classList.contains("is-oos")) return;
    const span = document.createElement("span");
    span.className = "btn buy small is-oos";
    span.setAttribute("aria-disabled", "true");
    span.textContent = "Rupture";
    btn.replaceWith(span);
  }

  function enhanceCard(card) {
    const link = card.querySelector(".game-cover-link");
    if (!link || link.querySelector(".game-badges")) return;
    const game = byIg(link.getAttribute("href"));
    if (!game) return;

    const wrap = document.createElement("span");
    wrap.className = "game-badges";
    wrap.innerHTML = badgesHTML(game);
    if (wrap.childNodes.length) link.appendChild(wrap);

    if (game.stock === "out") {
      card.classList.add("is-oos");
      card.querySelectorAll('a.btn.buy').forEach(disableBuy);
    }
  }

  function enhanceHero() {
    const feature = document.querySelector(".hero-feature");
    if (!feature || feature.querySelector(".game-badges")) return;
    const game = byIg(feature.getAttribute("href"));
    if (!game) return;
    const wrap = document.createElement("span");
    wrap.className = "game-badges";
    wrap.innerHTML = badgesHTML(game);
    if (wrap.childNodes.length) feature.appendChild(wrap);
    if (game.stock === "out") {
      feature.classList.add("is-oos");
      document.querySelectorAll(".hero-actions a.btn.buy").forEach(function (btn) {
        if (byIg(btn.getAttribute("href")) === game) {
          const span = document.createElement("span");
          span.className = "btn buy is-oos";
          span.setAttribute("aria-disabled", "true");
          span.textContent = "WARDOGS — rupture";
          btn.replaceWith(span);
        }
      });
    }
  }

  document.querySelectorAll(".game-card").forEach(enhanceCard);
  enhanceHero();

  window.JEUXSTASH_priceBadge = badgesHTML;
  window.JEUXSTASH_formatPrice = formatPrice;
})();
