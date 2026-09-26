(function () {
  function amazonUrl(query) {
    var tag = (window.JEUXSTASH_AMAZON_TAG || "").trim();
    var url =
      "https://www.amazon.fr/s?k=" +
      encodeURIComponent(query) +
      "&i=computers&rh=n%3A340858031";
    if (tag) url += "&tag=" + encodeURIComponent(tag);
    return url;
  }

  var builds = {
    entry: {
      title: "Entrée · ~750–800 €",
      tagline: "Full HD fluide : esport + jeux récents en réglages moyens/élevés. Budget réaliste neuf en France.",
      target: "1080p · 60 FPS et plus",
      parts: [
        {
          role: "GPU",
          name: "RX 7600 (ou RTX 4060 / 5050)",
          why: "La pièce qui compte le plus pour les FPS. La RX 7600 tient mieux le 700–800 €.",
          amazon: "RX 7600",
        },
        {
          role: "CPU",
          name: "Ryzen 5 5600",
          why: "Suffisant pour accompagner cette carte. Évite un vieux dual-core.",
          amazon: "AMD Ryzen 5 5600",
        },
        {
          role: "RAM",
          name: "16 Go DDR4 (2×8)",
          why: "8 Go, c’est trop juste aujourd’hui. Passe à 32 Go plus tard si besoin.",
          amazon: "16Go DDR4 3200 2x8",
        },
        {
          role: "Stockage",
          name: "SSD NVMe 1 To",
          why: "Les jeux s’installent et se lancent beaucoup plus vite qu’avec un disque dur.",
          amazon: "SSD NVMe 1To",
        },
        {
          role: "Carte mère",
          name: "B550 (AM4)",
          why: "Compatible avec le 5600, assez de ports USB / M.2. Pas besoin du haut de gamme.",
          amazon: "carte mere B550 AM4",
        },
        {
          role: "Alim",
          name: "550–650 W 80+ Bronze",
          why: "Prends une marque connue (Corsair, be quiet!, MSI…). Évite les no-name.",
          amazon: "alimentation 650W 80+ Bronze",
        },
        {
          role: "Boîtier",
          name: "Mid-tower avec bon airflow",
          why: "Priorité à la ventilation, pas aux LED. 2–3 ventilos suffisent.",
          amazon: "boitier PC mid tower airflow",
        },
      ],
    },
    mid: {
      title: "Confort · ~1100–1200 €",
      tagline: "Quad HD agréable pendant plusieurs années. Le palier « je m’en sers sans regret ».",
      target: "1440p · 60–100 FPS",
      parts: [
        {
          role: "GPU",
          name: "RTX 4070 / RX 7800 XT / RTX 5060 Ti",
          why: "Bon équilibre perf / prix pour du 1440p. Compare le prix du jour avant d’acheter.",
          amazon: "RTX 4070",
        },
        {
          role: "CPU",
          name: "Ryzen 5 7600 (AM5)",
          why: "Plateforme récente : tu pourras changer le processeur plus tard sans tout racheter.",
          amazon: "AMD Ryzen 5 7600",
        },
        {
          role: "RAM",
          name: "32 Go DDR5",
          why: "Chrome, Discord et mods en même temps sans ralentir.",
          amazon: "32Go DDR5 6000 2x16",
        },
        {
          role: "Stockage",
          name: "SSD NVMe 2 To",
          why: "Un gros jeu AAA prend souvent 100 Go et plus. 1 To se remplit vite.",
          amazon: "SSD NVMe 2To",
        },
        {
          role: "Carte mère",
          name: "B650 (Wi‑Fi si possible)",
          why: "Assez pour le GPU et le SSD rapide, Wi‑Fi pratique si pas de câble.",
          amazon: "carte mere B650 wifi",
        },
        {
          role: "Alim",
          name: "750 W 80+ Gold",
          why: "De la marge si tu changes de carte graphique un jour.",
          amazon: "alimentation 750W 80+ Gold",
        },
        {
          role: "Boîtier",
          name: "Mid-tower mesh",
          why: "Avant grillagé = GPU plus au frais, moins de bruit.",
          amazon: "boitier PC mesh mid tower",
        },
      ],
    },
    high: {
      title: "Haut · ~1600–1800 €",
      tagline: "1440p en ultra, début de 4K. Ray tracing et futurs jeux plus confortables.",
      target: "1440p ultra · 4K moyen",
      parts: [
        {
          role: "GPU",
          name: "RTX 5070 / 4070 Ti Super",
          why: "Réserve de puissance pour 3–4 ans. Vérifie le prix neuf vs promo.",
          amazon: "RTX 5070",
        },
        {
          role: "CPU",
          name: "Ryzen 7 7700 / 9700X",
          why: "Utile si tu joues et streames en même temps.",
          amazon: "AMD Ryzen 7 7700",
        },
        {
          role: "RAM",
          name: "32 Go DDR5 ~6000",
          why: "Assez pour le gaming. 64 Go seulement si montage vidéo / 3D.",
          amazon: "32Go DDR5 6000 CL30",
        },
        {
          role: "Stockage",
          name: "SSD NVMe 2 To Gen4",
          why: "Jeux sur le SSD rapide. Un second disque pour les archives si besoin.",
          amazon: "SSD NVMe Gen4 2To",
        },
        {
          role: "Carte mère",
          name: "B650 / X670",
          why: "Alimentation CPU correcte, beaucoup de ports USB.",
          amazon: "carte mere B650",
        },
        {
          role: "Alim",
          name: "850 W Gold (ATX 3)",
          why: "Prête pour les cartes récentes avec câble 12VHPWR.",
          amazon: "alimentation 850W Gold ATX 3.0",
        },
        {
          role: "Cooling",
          name: "Ventirad tour correct",
          why: "Un bon air cooler suffit. Watercooling AIO = option, pas une obligation.",
          amazon: "ventirad CPU tour",
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
    var hasTag = !!(window.JEUXSTASH_AMAZON_TAG || "").trim();
    var rows = b.parts
      .map(function (p) {
        var link = p.amazon
          ? '<a class="builder-amazon" href="' +
            esc(amazonUrl(p.amazon)) +
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

    var kitQuery =
      key === "mid"
        ? "RTX 4070 PC gamer"
        : key === "high"
          ? "RTX 5070 PC gamer"
          : "RX 7600 PC gamer";

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
      '<table class="builder-table"><tbody>' +
      rows +
      "</tbody></table>" +
      '<div class="row">' +
      '<a class="btn buy small" href="' +
      esc(amazonUrl(kitQuery)) +
      '" rel="sponsored noopener" target="_blank">Tout chercher sur Amazon</a>' +
      '<a class="btn ghost small" href="/deals.html?platform=pc">Remplir le disque</a>' +
      "</div>" +
      '<p class="fine">Budgets indicatifs neuf, tour seule. Liens Amazon affiliés' +
      (hasTag ? "" : " (ID Partenaire à renseigner dans la config)") +
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
