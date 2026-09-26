(function () {
  var builds = {
    entry: {
      title: "Entry · ~700 €",
      tagline: "1080p fluide, esports + AAA medium. Le meilleur rapport qualité/prix pour démarrer.",
      target: "1080p · 60+ FPS",
      parts: [
        { role: "GPU", name: "RX 7600 / RTX 4060", why: "C’est elle qui joue — 80 % du feeling." },
        { role: "CPU", name: "Ryzen 5 5600 / 7600", why: "Assez pour ne pas bridger le GPU." },
        { role: "RAM", name: "16 Go DDR4/DDR5", why: "Moins = galère en 2026." },
        { role: "Stockage", name: "SSD NVMe 1 To", why: "Chargements humains." },
        { role: "Carte mère", name: "B550 / B650 entrée", why: "Ports OK, pas de RGB tax." },
        { role: "Alim", name: "550–650 W 80+ Bronze", why: "Marque connue, câbles solides." },
        { role: "Boîtier", name: "Airflow correct", why: "3 ventilateurs > LED partout." },
      ],
      shop: "https://www.google.com/search?q=config+PC+gaming+RX+7600+700€",
      materiel: "https://www.materiel.net/configurateur-pc-gamer/",
    },
    mid: {
      title: "Sweet spot · ~1100 €",
      tagline: "1440p confortable. La config « je m’en sers 4 ans sans regret ».",
      target: "1440p · 60–100 FPS",
      parts: [
        { role: "GPU", name: "RTX 4070 / RX 7800 XT", why: "Sweet spot perf / prix 2026." },
        { role: "CPU", name: "Ryzen 5 7600 / 9600X", why: "AM5 = upgrade CPU plus tard." },
        { role: "RAM", name: "32 Go DDR5", why: "Mods, Chrome, Discord en parallèle." },
        { role: "Stockage", name: "SSD NVMe 2 To", why: "AAA = 100–150 Go chacun." },
        { role: "Carte mère", name: "B650 wifi", why: "Assez de lanes PCIe, Wi‑Fi 6." },
        { role: "Alim", name: "750 W Gold", why: "Marge pour upgrade GPU." },
        { role: "Boîtier", name: "Mesh mid-tower", why: "Silence + fraîcheur GPU." },
      ],
      shop: "https://www.google.com/search?q=config+PC+gaming+RTX+4070+1100€",
      materiel: "https://www.materiel.net/configurateur-pc-gamer/",
    },
    high: {
      title: "High · ~1600 €",
      tagline: "1440p ultra / entrée 4K. Ray tracing OK, futurs jeux tranquilles.",
      target: "1440p ultra · 4K medium",
      parts: [
        { role: "GPU", name: "RTX 5070 / 4070 Ti Super", why: "Headroom pour 3–4 ans." },
        { role: "CPU", name: "Ryzen 7 7700 / 9700X", why: "Streaming + jeu en même temps." },
        { role: "RAM", name: "32 Go DDR5 6000", why: "Fast kits, pas besoin de 64 Go." },
        { role: "Stockage", name: "SSD 2 To Gen4 + HDD option", why: "Jeux sur NVMe, archives ailleurs." },
        { role: "Carte mère", name: "B650 / X670", why: "VRM solides, plein de USB." },
        { role: "Alim", name: "850 W Gold ATX 3", why: "Prêt câble 12VHPWR." },
        { role: "Cooling", name: "Air tower 240 mm", why: "AIO seulement si tu aimes le silence RGB." },
      ],
      shop: "https://www.google.com/search?q=config+PC+gaming+RTX+5070+1600€",
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
      '<p class="fine">Références indicatives — les modèles exacts bougent. Compare 2–3 boutiques avant de cliquer.</p>' +
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
