/* SEO léger : JSON-LD WebSite / FAQ / Article / Collection */
(function () {
  function addJsonLd(data) {
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  var origin = "https://www.jeuxstash.fr";
  var path = location.pathname || "/";

  addJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JeuxStash",
    url: origin + "/",
    description: "Choisir un jeu vite et le payer moins cher. Idées + prix Instant Gaming + comparaison.",
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: origin + "/deals?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  });

  function injectFaq(root) {
    if (!root) return;
    var items = [];
    root.querySelectorAll("details").forEach(function (d) {
      var q = d.querySelector("summary");
      var a = d.querySelector(".faq-a");
      if (!q || !a) return;
      items.push({
        "@type": "Question",
        name: q.textContent.trim(),
        acceptedAnswer: { "@type": "Answer", text: a.textContent.trim() },
      });
    });
    if (items.length) {
      addJsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items,
      });
    }
  }

  if (path === "/" || path === "/index" || path.indexOf("deals") !== -1) {
    injectFaq(document.getElementById("faq"));
  }

  if (path.indexOf("deals") !== -1) {
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Jeux & bons plans — JeuxStash",
      url: origin + "/deals",
      description: "Catalogue jeux avec prix Instant Gaming et comparaison.",
      isPartOf: { "@type": "WebSite", name: "JeuxStash", url: origin + "/" },
    });
  }

  var article = document.querySelector("article.article h1");
  if (article && path.indexOf("/guides/") === 0 && path.indexOf("/guides/index") === -1) {
    var desc = document.querySelector('meta[name="description"]');
    addJsonLd({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.textContent.trim(),
      description: desc ? desc.getAttribute("content") : "",
      inLanguage: "fr-FR",
      author: { "@type": "Organization", name: "JeuxStash" },
      publisher: {
        "@type": "Organization",
        name: "JeuxStash",
        url: origin + "/",
        logo: { "@type": "ImageObject", url: origin + "/img/og-default.png" },
      },
      image: origin + "/img/og-default.png",
      mainEntityOfPage: origin + path,
      dateModified: document.lastModified || undefined,
    });
  }
})();
