/* Verdict Acheter / Attendre / Game Pass + comparaison IG vs boutique */
window.JEUXSTASH_VERDICT = (function () {
  /** Prix boutique indicatifs (EU) + présence Game Pass fréquente — métrique éditoriale, pas un scraper live */
  var HINTS = {
    "It Takes Two": { store: 39.99 },
    "Stardew Valley": { store: 13.99 },
    "Forza Horizon 5": { store: 59.99, pass: true },
    "Deep Rock Galactic": { store: 29.99 },
    "Overcooked 2": { store: 22.99 },
    "PlateUp!": { store: 19.99 },
    "Elden Ring": { store: 59.99 },
    "Cyberpunk 2077": { store: 59.99 },
    "Baldur's Gate 3": { store: 69.99 },
    "Sea of Thieves": { store: 39.99, pass: true },
    "Minecraft": { store: 26.95, pass: true },
    "Hades": { store: 24.99 },
    "Hades II": { store: 29.99 },
    "Risk of Rain 2": { store: 24.99 },
    "Monster Hunter Wilds": { store: 69.99 },
    "Warhammer 40,000: Space Marine 2": { store: 59.99 },
    "Black Myth: Wukong": { store: 59.99 },
    "Call of Duty: Black Ops 7": { store: 79.99 },
    "Call of Duty: Modern Warfare 4": { store: 79.99 },
    "Resident Evil Requiem": { store: 69.99 },
    "Crimson Desert Enhanced": { store: 69.99 },
    "Pragmata": { store: 69.99 },
    "Mafia: The Old Country": { store: 59.99 },
    "Ghost of Yōtei": { store: 79.99 },
    "The Witcher 4": { store: 69.99 },
    "EA Sports FC 27": { store: 69.99 },
    "Grand Theft Auto VI": { store: 79.99 },
    "Grand Theft Auto V Enhanced": { store: 29.99 },
    "The Witcher 3": { store: 29.99 },
    "Resident Evil 4": { store: 39.99 },
    "Far Cry 6": { store: 59.99, pass: true },
    "Watch Dogs Legion": { store: 49.99, pass: true },
    "Watch Dogs": { store: 29.99 },
    "Helldivers 2": { store: 39.99 },
    "Clair Obscur: Expedition 33": { store: 49.99 },
    "Super Smash Bros. Ultimate": { store: 64.99 },
    "Red Dead Redemption 2": { store: 59.99 },
    "Hollow Knight": { store: 14.79 },
    "Hollow Knight: Silksong": { store: 19.5 },
    "Balatro": { store: 14.99 },
    "Vampire Survivors": { store: 4.99 },
    "Celeste": { store: 19.99 },
    "Dead Cells": { store: 24.99 },
    "Outer Wilds": { store: 22.99 },
    "No Man's Sky": { store: 59.99 },
    "Disco Elysium": { store: 39.99 },
    "The Elder Scrolls V: Skyrim Special Edition": { store: 39.99, pass: true },
    "Borderlands 4": { store: 69.99 },
    "Arc Raiders": { store: 39.99 },
    "R.E.P.O.": { store: 9.99 },
    "Content Warning": { store: 7.99 },
    "Remnant II": { store: 49.99 },
    "Death Stranding 2": { store: 69.99 },
    "PEAK": { store: 7.99 },
  };

  var WAIT_ALWAYS = {
    "Grand Theft Auto VI": true,
    "Call of Duty: Black Ops 7": true,
    "Call of Duty: Modern Warfare 4": true,
    "The Witcher 4": true,
    "Resident Evil Requiem": true,
    "Crimson Desert Enhanced": true,
    "EA Sports FC 27": true,
    "Borderlands 4": true,
    "Death Stranding 2": true,
    "Hollow Knight: Silksong": true,
  };

  function hintFor(game) {
    if (!game) return null;
    if (HINTS[game.name]) return HINTS[game.name];
    if (game.store || game.pass) {
      return { store: game.store, pass: !!game.pass };
    }
    return null;
  }

  function savePct(ig, store) {
    if (ig == null || store == null || store <= 0 || ig > store) return null;
    return Math.round(((store - ig) / store) * 100);
  }

  function euro(n) {
    if (n == null || Number.isNaN(n)) return null;
    return (
      Number(n).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + "\u00a0€"
    );
  }

  function verdictFor(game) {
    var hint = hintFor(game) || {};
    var ig = game.price;
    var store = hint.store != null ? hint.store : null;
    var pass = !!hint.pass;
    var pct = savePct(ig, store);
    var out = game.stock === "out";
    var kind = "buy";
    var label = "Acheter";
    var title = "Bon rapport qualité / prix pour une clé maintenant.";

    if (WAIT_ALWAYS[game.name] && (out || ig == null || ig >= 55)) {
      kind = "wait";
      label = "Attendre";
      title = "Sortie récente ou plein tarif : mieux vaut comparer et attendre une baisse.";
    } else if (out) {
      kind = "wait";
      label = "Attendre";
      title = "Clé en rupture ou précommande — surveillez le prix ou comparez ailleurs.";
    } else if (pass && (ig == null || ig > 18) && (pct == null || pct < 45)) {
      kind = "abo";
      label = "Game Pass";
      title = "Souvent sur Game Pass : l’abo peut battre l’achat si vous testez beaucoup.";
    } else if (pct != null && pct >= 35) {
      kind = "buy";
      label = "Acheter";
      title = "Écart net vs le prix boutique — bon moment pour une clé.";
    } else if (pct != null && pct < 15 && ig >= 40) {
      kind = "wait";
      label = "Attendre";
      title = "Peu d’écart avec la boutique : une promo store ou une baisse IG peut arriver.";
    } else if (ig != null && ig <= 15) {
      kind = "buy";
      label = "Acheter";
      title = "Petit prix : peu de risque à prendre maintenant.";
    } else if (ig != null && ig >= 55) {
      kind = "wait";
      label = "Attendre";
      title = "Prix encore élevé — comparez et surveillez les soldes.";
    }

    var compare = null;
    if (store != null && pct != null && pct > 0) {
      compare = "Boutique ≈ " + euro(store) + " (−" + pct + "\u00a0%)";
    } else if (store != null) {
      compare = "Boutique ≈ " + euro(store);
    } else if (pass) {
      compare = "Souvent dispo sur Game Pass";
    }

    return {
      kind: kind,
      label: label,
      title: title,
      store: store,
      pass: pass,
      savePct: pct,
      compare: compare,
    };
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function chipHTML(game) {
    var v = verdictFor(game);
    return (
      '<span class="verdict verdict--' +
      v.kind +
      '" title="' +
      esc(v.title) +
      '">' +
      esc(v.label) +
      "</span>"
    );
  }

  function compareHTML(game) {
    var v = verdictFor(game);
    if (!v.compare) return "";
    return '<p class="price-compare" title="' + esc(v.title) + '">' + esc(v.compare) + "</p>";
  }

  return {
    for: verdictFor,
    chipHTML: chipHTML,
    compareHTML: compareHTML,
    hints: HINTS,
  };
})();
