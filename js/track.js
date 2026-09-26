/* Tracking clics affiliés Instant Gaming + GG.deals */
(function () {
  var cfg = window.JEUXSTASH_ANALYTICS || {};

  function injectCfBeacon(token) {
    if (!token || document.querySelector("script[data-cf-beacon]")) return;
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: token }));
    document.head.appendChild(s);
  }

  function injectGa4(id) {
    if (!id || window.gtag) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true, send_page_view: true });
  }

  injectCfBeacon(cfg.cfBeacon);
  injectGa4(cfg.ga4);

  function labelFor(a) {
    var t = (a.textContent || "").trim().replace(/\s+/g, " ");
    if (t.length > 60) t = t.slice(0, 57) + "…";
    return t || "lien";
  }

  function pathHint(href) {
    try {
      var u = new URL(href);
      return u.pathname.slice(0, 80);
    } catch (e) {
      return "";
    }
  }

  function track(name, params) {
    params = params || {};
    if (typeof window.gtag === "function" && cfg.ga4) {
      window.gtag("event", name, params);
    }
    try {
      var key = "jeuxstash_clicks";
      var arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push({
        t: Date.now(),
        e: name,
        l: params.link_label || "",
        h: params.link_path || "",
        p: location.pathname,
      });
      if (arr.length > 200) arr = arr.slice(-200);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {}
  }

  document.addEventListener(
    "click",
    function (ev) {
      var a = ev.target.closest && ev.target.closest("a[href]");
      if (!a) return;
      var href = a.href || "";
      if (/instant-gaming\.com/i.test(href)) {
        track("ig_click", {
          link_label: labelFor(a),
          link_path: pathHint(href),
          transport_type: "beacon",
        });
      } else if (/gg\.deals/i.test(href)) {
        track("compare_click", {
          link_label: labelFor(a),
          link_path: pathHint(href),
          transport_type: "beacon",
        });
      }
    },
    true
  );

  window.JEUXSTASH_clickStats = function () {
    try {
      return JSON.parse(localStorage.getItem("jeuxstash_clicks") || "[]");
    } catch (e) {
      return [];
    }
  };
})();
