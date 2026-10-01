/* Helpers fiche jeu — slug + URL */
(function () {
  function slugify(name) {
    return String(name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function ficheUrl(gameOrName) {
    var name = typeof gameOrName === "string" ? gameOrName : gameOrName && gameOrName.name;
    if (!name) return "/deals";
    return "/jeu/" + slugify(name) + "/";
  }

  function findBySlug(catalog, slug) {
    if (!catalog || !slug) return null;
    var want = String(slug).toLowerCase();
    for (var i = 0; i < catalog.length; i++) {
      if (slugify(catalog[i].name) === want) return catalog[i];
    }
    return null;
  }

  window.JEUXSTASH_FICHE = {
    slugify: slugify,
    url: ficheUrl,
    findBySlug: findBySlug,
  };
})();
