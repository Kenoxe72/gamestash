(function () {
  function amazonTag() {
    return (window.JEUXSTASH_AMAZON_TAG || "").trim();
  }

  function withTag(url) {
    var tag = amazonTag();
    if (!tag) return url;
    return url + (url.indexOf("?") >= 0 ? "&" : "?") + "tag=" + encodeURIComponent(tag);
  }

  /** Recherche pièces (DIY) */
  function amazonPartsUrl(query) {
    return withTag(
      "https://www.amazon.fr/s?k=" + encodeURIComponent(query) + "&i=computers"
    );
  }

  /**
   * PC déjà montés dans une fourchette de prix.
   * p_36 = prix en centimes d’euro (ex. 750€ → 75000).
   * Tri popularité pour remonter les meilleures ventes.
   */
  function amazonPrebuiltUrl(query, priceMinCents, priceMaxCents) {
    var rh = "p_36:" + priceMinCents + "-" + priceMaxCents;
    return withTag(
      "https://www.amazon.fr/s?k=" +
        encodeURIComponent(query) +
        "&i=computers&rh=" +
        encodeURIComponent(rh) +
        "&s=exact-aware-popularity-rank"
    );
  }

  var builds = {
    entry: {
      title: "Entrée · ~750–800 €",
      tagline: "Full HD fluide : esport + jeux récents en réglages moyens/élevés. Budget réaliste neuf en France.",
      target: "1080p · 60 FPS et plus",
      prebuilt: {
        query: "PC gamer RTX RX",
        priceMin: 70000,
        priceMax: 85000,
        label: "Meilleurs PC montés ~750–800 €",
        hint: "Tours prêtes dans ce budget, triées par popularité Amazon. Vérifie le GPU sur la fiche.",
      },
      parts: [
        {
          role: "GPU",
          name: "RX 7600 (ou RTX 4060 / 5050)",
          why: "La pièce qui compte le plus pour les FPS. La RX 7600 tient mieux le 700–800 €.",
          amazon: "RX 7600 carte graphique",
        },
        {
          role: "CPU",
          name: "Ryzen 5 5600",
          why: "Suffisant pour accompagner cette carte. Évite un vieux dual-core.",
          amazon: "AMD Ryzen 5 5600 processeur",
        },
        {
          role: "RAM",
          name: "16 Go DDR4 (2×8)",
          why: "8 Go, c’est trop juste aujourd’hui. Passe à 32 Go plus tard si besoin.",
          amazon: "kit mémoire DDR4 16Go 3200 DIMM 2x8",
        },
        {
          role: "Stockage",
          name: "SSD NVMe 1 To",
          why: "Les jeux s’installent et se lancent beaucoup plus vite qu’avec un disque dur.",
          amazon: "SSD M.2 NVMe 1To interne",
        },
        {
          role: "Carte mère",
          name: "B550 (AM4)",
          why: "Compatible avec le 5600, assez de ports USB / M.2. Pas besoin du haut de gamme.",
          amazon: "carte mère B550 AM4 ATX",
        },
        {
          role: "Alim",
          name: "550–650 W 80+ Bronze",
          why: "Prends une marque connue (Corsair, be quiet!, MSI…). Évite les no-name.",
          amazon: "alimentation PC 650W 80+ Bronze",
        },
        {
          role: "Boîtier",
          name: "Mid-tower avec bon airflow",
          why: "Priorité à la ventilation, pas aux LED. 2–3 ventilos suffisent.",
          amazon: "boîtier PC mid-tower ATX airflow",
        },
      ],
    },
    mid: {
      title: "Confort · ~1100–1200 €",
      tagline: "Quad HD agréable pendant plusieurs années. Le palier « je m’en sers sans regret ».",
      target: "1440p · 60–100 FPS",
      prebuilt: {
        query: "PC gamer RTX 4070 4060 Ti",
        priceMin: 105000,
        priceMax: 125000,
        label: "Meilleurs PC montés ~1100–1200 €",
        hint: "Tours prêtes dans ce budget, triées par popularité Amazon. Vérifie le GPU sur la fiche.",
      },
      parts: [
        {
          role: "GPU",
          name: "RTX 4070 / RX 7800 XT / RTX 5060 Ti",
          why: "Bon équilibre perf / prix pour du 1440p. Compare le prix du jour avant d’acheter.",
          amazon: "RTX 4070 carte graphique",
        },
        {
          role: "CPU",
          name: "Ryzen 5 7600 (AM5)",
          why: "Plateforme récente : tu pourras changer le processeur plus tard sans tout racheter.",
          amazon: "AMD Ryzen 5 7600 processeur",
        },
        {
          role: "RAM",
          name: "32 Go DDR5",
          why: "Chrome, Discord et mods en même temps sans ralentir.",
          amazon: "kit mémoire DDR5 32Go 6000 DIMM 2x16",
        },
        {
          role: "Stockage",
          name: "SSD NVMe 2 To",
          why: "Un gros jeu AAA prend souvent 100 Go et plus. 1 To se remplit vite.",
          amazon: "SSD M.2 NVMe 2To interne",
        },
        {
          role: "Carte mère",
          name: "B650 (Wi‑Fi si possible)",
          why: "Assez pour le GPU et le SSD rapide, Wi‑Fi pratique si pas de câble.",
          amazon: "carte mère B650 wifi AM5",
        },
        {
          role: "Alim",
          name: "750 W 80+ Gold",
          why: "De la marge si tu changes de carte graphique un jour.",
          amazon: "alimentation PC 750W 80+ Gold",
        },
        {
          role: "Boîtier",
          name: "Mid-tower mesh",
          why: "Avant grillagé = GPU plus au frais, moins de bruit.",
          amazon: "boîtier PC mid-tower mesh ATX",
        },
      ],
    },
    high: {
      title: "Haut · ~1600–1800 €",
      tagline: "1440p en ultra, début de 4K. Ray tracing et futurs jeux plus confortables.",
      target: "1440p ultra · 4K moyen",
      prebuilt: {
        query: "PC gamer RTX 4070 Ti 5070",
        priceMin: 155000,
        priceMax: 185000,
        label: "Meilleurs PC montés ~1600–1800 €",
        hint: "Tours prêtes dans ce budget, triées par popularité Amazon. Vérifie le GPU sur la fiche.",
      },
      parts: [
        {
          role: "GPU",
          name: "RTX 5070 / 4070 Ti Super",
          why: "Réserve de puissance pour 3–4 ans. Vérifie le prix neuf vs promo.",
          amazon: "RTX 5070 carte graphique",
        },
        {
          role: "CPU",
          name: "Ryzen 7 7700 / 9700X",
          why: "Utile si tu joues et streames en même temps.",
          amazon: "AMD Ryzen 7 7700 processeur",
        },
        {
          role: "RAM",
          name: "32 Go DDR5 ~6000",
          why: "Assez pour le gaming. 64 Go seulement si montage vidéo / 3D.",
          amazon: "kit mémoire DDR5 32Go 6000 DIMM",
        },
        {
          role: "Stockage",
          name: "SSD NVMe 2 To Gen4",
          why: "Jeux sur le SSD rapide. Un second disque pour les archives si besoin.",
          amazon: "SSD M.2 NVMe Gen4 2To",
        },
        {
          role: "Carte mère",
          name: "B650 / X670",
          why: "Alimentation CPU correcte, beaucoup de ports USB.",
          amazon: "carte mère B650 AM5 ATX",
        },
        {
          role: "Alim",
          name: "850 W Gold (ATX 3)",
          why: "Prête pour les cartes récentes avec câble 12VHPWR.",
          amazon: "alimentation PC 850W Gold ATX 3.0",
        },
        {
          role: "Cooling",
          name: "Ventirad tour correct",
          why: "Un bon air cooler suffit. Watercooling AIO = option, pas une obligation.",
          amazon: "ventirad CPU tour AM5 AM4",
        },
      ],
    },
  };

  var panel = document.getElementById("build-panel");
  var tabs = document.querySelector(".builder-tabs");
  if (!panel || !tabs) return;

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(key) {
    var b = builds[key] || builds.entry;
    var hasTag = !!amazonTag();
    var pb = b.prebuilt;
    var rows = b.parts
      .map(function (p) {
        var link = p.amazon
          ? '<a class="builder-amazon" href="' +
            esc(amazonPartsUrl(p.amazon)) +
            '" rel="sponsored noopener" target="_blank">Voir sur Amazon</a>'
          : "";
        return (
          "<tr><th>" +
          esc(p.role) +
          "</th><td><strong>" +
          esc(p.name) +
          "</strong><span>" +
          esc(p.why) +
          "</span>" +
          link +
          "</td></tr>"
        );
      })
      .join("");

    panel.innerHTML =
      '<div class="builder-card">' +
      "<h3>" +
      esc(b.title) +
      "</h3>" +
      '<p class="builder-tagline">' +
      esc(b.tagline) +
      "</p>" +
      '<p class="builder-target"><span>Cible</span> ' +
      esc(b.target) +
      "</p>" +
      '<div class="builder-prebuilt">' +
      "<p><strong>Pas envie de monter pièce par pièce&nbsp;?</strong> " +
      esc(pb.hint) +
      "</p>" +
      '<a class="btn buy" href="' +
      esc(amazonPrebuiltUrl(pb.query, pb.priceMin, pb.priceMax)) +
      '" rel="sponsored noopener" target="_blank">' +
      esc(pb.label) +
      "</a>" +
      "</div>" +
      '<h4 class="builder-diy-title">Ou monter toi-même</h4>' +
      '<table class="builder-table"><tbody>' +
      rows +
      "</tbody></table>" +
      '<div class="row">' +
      '<a class="btn ghost small" href="/deals.html?platform=pc">Voir les jeux PC</a>' +
      "</div>" +
      '<p class="fine">Budgets indicatifs neuf, tour seule. Vérifie GPU / RAM / alim sur la fiche Amazon avant d’acheter. Liens affiliés' +
      (hasTag ? "" : " (ID Partenaire à renseigner)") +
      " — En tant que Partenaire Amazon, JeuxStash réalise un bénéfice sur les achats éligibles.</p>" +
      "</div>";
  }

  tabs.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-build]");
    if (!btn) return;
    var key = btn.getAttribute("data-build");
    tabs.querySelectorAll("[data-build]").forEach(function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    render(key);
  });

  render("entry");
})();
