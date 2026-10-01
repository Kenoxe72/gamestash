#!/usr/bin/env node
/**
 * Génère /jeu/{slug}/index.html pour chaque jeu du catalogue.
 * URLs propres (sans ?slug=) + meta SEO côté HTML pour Google.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "js", "catalog.js");
const templatePath = path.join(root, "jeu", "index.html");
const sitemapPath = path.join(root, "sitemap-jeux.xml");

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function loadCatalog() {
  const src = fs.readFileSync(catalogPath, "utf8");
  const sandbox = { window: {} };
  // eslint-disable-next-line no-new-func
  Function("window", src)(sandbox.window);
  const catalog = sandbox.window.JEUXSTASH_CATALOG;
  if (!Array.isArray(catalog) || !catalog.length) throw new Error("empty catalog");
  return catalog;
}

function coverOf(game) {
  if (game.cover) return game.cover;
  if (game.steam) {
    return "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.steam + "/header.jpg";
  }
  return "https://www.jeuxstash.fr/img/og-default.png";
}

function buildPage(template, game, slug) {
  const title = game.name + " — prix, résumé & config — JeuxStash";
  const desc =
    (game.blurb || "Fiche JeuxStash") +
    " Prix clé Instant Gaming, verdict, config PC si dispo.";
  const url = "https://www.jeuxstash.fr/jeu/" + slug + "/";
  const img = coverOf(game);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: game.name,
    description: game.blurb || desc,
    image: img,
    brand: { "@type": "Brand", name: "JeuxStash" },
    offers: game.price
      ? {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: String(game.price),
          availability:
            game.stock === "out"
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          url: url,
        }
      : undefined,
  };
  if (!jsonLd.offers) delete jsonLd.offers;

  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, "<title>" + esc(title) + "</title>");
  html = html.replace(
    /<meta id="meta-desc" name="description" content="[^"]*" \/>/,
    '<meta id="meta-desc" name="description" content="' + esc(desc) + '" />'
  );
  html = html.replace(
    /<link id="canonical" rel="canonical" href="[^"]*" \/>/,
    '<link id="canonical" rel="canonical" href="' + esc(url) + '" />'
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    '<meta property="og:image" content="' + esc(img) + '" />\n' +
      '  <meta property="og:title" content="' +
      esc(title) +
      '" />\n' +
      '  <meta property="og:url" content="' +
      esc(url) +
      '" />\n' +
      '  <meta property="og:description" content="' +
      esc(desc) +
      '" />'
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    '<meta name="twitter:image" content="' + esc(img) + '" />\n' +
      '  <meta name="twitter:title" content="' +
      esc(title) +
      '" />'
  );

  const noscript =
    '<noscript><article><h1>' +
    esc(game.name) +
    "</h1><p>" +
    esc(game.blurb || "") +
    '</p><p><a href="/deals">Voir le catalogue</a></p></article></noscript>\n  ';

  html = html.replace(
    '<div id="fiche-root" class="fiche-root">',
    noscript + '<div id="fiche-root" class="fiche-root" data-slug="' + esc(slug) + '">'
  );

  const ldTag =
    '<script type="application/ld+json">' +
    JSON.stringify(jsonLd) +
    "</script>\n</head>";
  html = html.replace("</head>", ldTag);

  // bump cache so nouvelles fiches prennent fiche/jeu SEO
  html = html.replace(/fiche\.js\?v=[^"]+/g, "fiche.js?v=20261001seo");
  html = html.replace(/jeu\.js\?v=[^"]+/g, "jeu.js?v=20261001seo");

  return html;
}

function writeSitemap(slugs, guidesXmlPath) {
  const today = new Date().toISOString().slice(0, 10);
  const origin = "https://www.jeuxstash.fr";
  const staticUrls = [
    "/",
    "/deals",
    "/pc-builder",
    "/mes-jeux",
    "/a-propos",
    "/mentions-legales",
    "/guides/",
  ];

  // keep existing guide URLs from current sitemap if present
  let guideLocs = [];
  if (fs.existsSync(guidesXmlPath)) {
    const prev = fs.readFileSync(guidesXmlPath, "utf8");
    const re = /<loc>(https:\/\/www\.jeuxstash\.fr\/guides\/[^<]+)<\/loc>/g;
    let m;
    while ((m = re.exec(prev))) guideLocs.push(m[1].replace(origin, ""));
  }
  guideLocs = Array.from(new Set(guideLocs));

  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  function add(loc) {
    lines.push(
      "  <url><loc>" +
        origin +
        loc +
        "</loc><lastmod>" +
        today +
        "</lastmod></url>"
    );
  }
  staticUrls.forEach(add);
  guideLocs.forEach(add);
  slugs.forEach(function (s) {
    add("/jeu/" + s + "/");
  });
  lines.push("</urlset>", "");
  fs.writeFileSync(guidesXmlPath, lines.join("\n"), "utf8");
}

function main() {
  const catalog = loadCatalog();
  const template = fs.readFileSync(templatePath, "utf8");
  const slugs = [];
  const seen = new Set();

  // purge old generated dirs (keep jeu/index.html)
  for (const ent of fs.readdirSync(path.join(root, "jeu"), { withFileTypes: true })) {
    if (ent.isDirectory()) {
      fs.rmSync(path.join(root, "jeu", ent.name), { recursive: true, force: true });
    }
  }

  for (const game of catalog) {
    const slug = slugify(game.name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
    const dir = path.join(root, "jeu", slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), buildPage(template, game, slug), "utf8");
  }

  writeSitemap(slugs, sitemapPath);
  console.log("Generated", slugs.length, "fiches under /jeu/{slug}/");
}

main();
