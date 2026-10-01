/* Liste « Surveiller » — localStorage, sans compte */
(function () {
  if (window.JEUXSTASH_WATCH) return;

  var KEY = "jeuxstash_watch";
  var MAX = 40;

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (x) {
        return typeof x === "string" && x.length;
      });
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    } catch (e) {}
  }

  function has(name) {
    return load().indexOf(name) !== -1;
  }

  function toggle(name) {
    if (!name) return false;
    var list = load();
    var i = list.indexOf(name);
    var on;
    if (i === -1) {
      list.unshift(name);
      on = true;
    } else {
      list.splice(i, 1);
      on = false;
    }
    save(list);
    syncUI();
    return on;
  }

  function remove(name) {
    var list = load().filter(function (n) {
      return n !== name;
    });
    save(list);
    syncUI();
  }

  function btnHTML(name) {
    var on = has(name);
    return (
      '<button type="button" class="watch-btn js-watch' +
      (on ? " is-on" : "") +
      '" data-name="' +
      esc(name) +
      '" aria-pressed="' +
      (on ? "true" : "false") +
      '" title="' +
      (on ? "Retirer de Mes jeux" : "Surveiller ce jeu") +
      '">' +
      (on ? "★" : "☆") +
      '<span class="sr-only">' +
      (on ? "Retirer de Mes jeux" : "Surveiller") +
      "</span></button>"
    );
  }

  function syncUI() {
    var list = load();
    document.querySelectorAll(".js-watch").forEach(function (btn) {
      var name = btn.getAttribute("data-name");
      var on = list.indexOf(name) !== -1;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("title", on ? "Retirer de Mes jeux" : "Surveiller ce jeu");
      var label = btn.querySelector(".sr-only");
      if (label) label.textContent = on ? "Retirer de Mes jeux" : "Surveiller";
      var star = on ? "★" : "☆";
      var first = btn.firstChild;
      if (first && first.nodeType === 3) first.textContent = star;
      else if (!label) btn.textContent = star;
    });
    var badge = document.getElementById("watch-nav-count");
    if (badge) {
      if (list.length) {
        badge.textContent = String(list.length);
        badge.hidden = false;
      } else {
        badge.textContent = "";
        badge.hidden = true;
      }
    }
    try {
      document.dispatchEvent(new CustomEvent("jeuxstash:watch", { detail: { list: list } }));
    } catch (e) {}
  }

  function bind() {
    if (document.documentElement.getAttribute("data-watch-bound") === "1") return;
    document.documentElement.setAttribute("data-watch-bound", "1");
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-watch");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var name = btn.getAttribute("data-name");
      if (!name) return;
      var on = toggle(name);
      if (window.JEUXSTASH_toast) {
        window.JEUXSTASH_toast(on ? "Ajouté à Mes jeux" : "Retiré de Mes jeux");
      }
    });
  }

  function mountNav() {
    var nav = document.querySelector(".site-header nav");
    if (!nav || document.getElementById("nav-watch")) return;
    var a = document.createElement("a");
    a.id = "nav-watch";
    a.href = "/mes-jeux";
    a.innerHTML =
      'Mes jeux <span id="watch-nav-count" class="watch-nav-count" hidden></span>';
    if (location.pathname.replace(/\/$/, "") === "/mes-jeux") {
      a.setAttribute("aria-current", "page");
      a.className = "nav-current";
    }
    var before =
      document.getElementById("theme-toggle") || nav.querySelector(".nav-cta");
    if (before) nav.insertBefore(a, before);
    else nav.appendChild(a);
    syncUI();
  }

  function boot() {
    bind();
    mountNav();
    syncUI();
  }

  window.JEUXSTASH_WATCH = {
    load: load,
    has: has,
    toggle: toggle,
    remove: remove,
    btnHTML: btnHTML,
    syncUI: syncUI,
    bind: bind,
    mountNav: mountNav,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
