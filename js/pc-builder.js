(function () {
  var builds = {
    entry: {
      title: "Entrée · ~750–800 €",
      tagline: "Full HD fluide : esport + jeux récents en réglages moyens/élevés. Budget réaliste neuf en France.",
      target: "1080p · 60 FPS et plus",
      parts: [
        { role: "GPU", name: "RX 7600 (ou RTX 4060 / 5050)", why: "La pièce qui compte le plus pour les FPS. La RX 7600 tient mieux le 700–800 €." },
        { role: "CPU", name: "Ryzen 5 5600", why: "Suffisant pour accompagner cette carte. Évite un vieux dual-core." },
        { role: "RAM", name: "16 Go DDR4 (2×8)", why: "8 Go, c’est trop juste aujourd’hui. Passe à 32 Go plus tard si besoin." },
        { role: "Stockage", name: "SSD NVMe 1 To", why: "Les jeux s’installent et se lancent beaucoup plus vite qu’avec un disque dur." },
        { role: "Carte mère", name: "B550 (AM4)", why: "Compatible avec le 5600, assez de ports USB / M.2. Pas besoin du haut de gamme." },
        { role: "Alim", name: "550–650 W 80+ Bronze", why: "Prends une marque connue (Corsair, be quiet!, MSI…). Évite les no-name." },
        { role: "Boîtier", name: "Mid-tower avec bon airflow", why: "Priorité à la ventilation, pas aux LED. 2–3 ventilos suffisent." },
      ],
      shop: "https://www.google.com/search?q=config+PC+gamer+RX+7600+800€",
      materiel: "https://www.materiel.net/configurateur-pc-gamer/",
    },
    mid: {
      title: "Confort · ~1100–1200 €",
      tagline: "Quad HD agréable pendant plusieurs années. Le palier « je m’en sers sans regret ».",
      target: "1440p · 60–100 FPS",
      parts: [
        { role: "GPU", name: "RTX 4070 / RX 7800 XT / RTX 5060 Ti", why: "Bon équilibre perf / prix pour du 1440p. Compare le prix du jour avant d’acheter." },
        { role: "CPU", name: "Ryzen 5 7600 (AM5)", why: "Plateforme récente : tu pourras changer le processeur plus tard sans tout racheter." },
        { role: "RAM", name: "32 Go DDR5", why: "Chrome, Discord et mods en même temps sans ralentir." },
        { role: "Stockage", name: "SSD NVMe 2 To", why: "Un gros jeu AAA prend souvent 100 Go et plus. 1 To se remplit vite." },
        { role: "Carte mère", name: "B650 (Wi‑Fi si possible)", why: "Assez pour le GPU et le SSD rapide, Wi‑Fi pratique si pas de câble." },
        { role: "Alim", name: "750 W 80+ Gold", why: "De la marge si tu changes de carte graphique un jour." },
        { role: "Boîtier", name: "Mid-tower mesh", why: "Avant grillagé = GPU plus au frais, moins de bruit." },
      ],
      shop: "https://www.google.com/search?q=config+PC+gamer+RTX+4070+1200€",
      materiel: "https://www.materiel.net/configurateur-pc-gamer/",
    },
    high: {
      title: "Haut · ~1600–1800 €",
      tagline: "1440p en ultra, début de 4K. Ray tracing et futurs jeux plus confortables.",
      target: "1440p ultra · 4K moyen",
      parts: [
        { role: "GPU", name: "RTX 5070 / 4070 Ti Super", why: "Réserve de puissance pour 3–4 ans. Vérifie le prix neuf vs promo." },
        { role: "CPU", name: "Ryzen 7 7700 / 9700X", why: "Utile si tu joues et streames en même temps." },
        { role: "RAM", name: "32 Go DDR5 ~6000", why: "Assez pour le gaming. 64 Go seulement si montage vidéo / 3D." },
        { role: "Stockage", name: "SSD NVMe 2 To Gen4", why: "Jeux sur le SSD rapide. Un second disque pour les archives si besoin." },
        { role: "Carte mère", name: "B650 / X670", why: "Alimentation CPU correcte, beaucoup de ports USB." },
        { role: "Alim", name: "850 W Gold (ATX 3)", why: "Prête pour les cartes récentes avec câble 12VHPWR." },
        { role: "Cooling", name: "Ventirad tour correct", why: "Un bon air cooler suffit. Watercooling AIO = option, pas une obligation." },
      ],
      shop: "https://www.google.com/search?q=config+PC+gamer+RTX+5070+1700€",
      materiel: "https://www.materiel.net/configurateur-pc-gamer/",
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
    var rows = b.parts
      .map(function (p) {
        return (
          "<tr><th>" +
          esc(p.role) +
          "</th><td><strong>" +
          esc(p.name) +
          "</strong><span>" +
          esc(p.why) +
          "</span></td></tr>"
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
      '<table class="builder-table"><tbody>' +
      rows +
      "</tbody></table>" +
      '<div class="row">' +
      '<a class="btn buy small" href="' +
      esc(b.materiel) +
      '" rel="noopener" target="_blank">Configurer sur Materiel.net</a>' +
      '<a class="btn ghost small" href="' +
      esc(b.shop) +
      '" rel="noopener" target="_blank">Chercher des prix</a>' +
      '<a class="btn ghost small" href="/deals.html?platform=pc">Remplir le disque</a>' +
      "</div>" +
      '<p class="fine">Budgets indicatifs neuf, tour seule (sans écran / clavier). Les prix bougent — compare 2–3 boutiques avant d’acheter.</p>' +
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
