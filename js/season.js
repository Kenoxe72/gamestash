/* Saisons + rotation mensuelle JeuxStash */
window.JEUXSTASH_SEASON = (function () {
  function monthOf(d) {
    return (d || new Date()).getMonth() + 1;
  }

  function seasonOf(d) {
    const m = monthOf(d);
    if (m === 12 || m <= 2) return "hiver";
    if (m <= 5) return "printemps";
    if (m <= 8) return "ete";
    return "automne";
  }

  /** Seed stable sur le mois → même ordre tout le mois, change au 1er */
  function monthSeed(d) {
    const x = d || new Date();
    return x.getFullYear() * 12 + x.getMonth();
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, seed) {
    const a = arr.slice();
    const rand = mulberry32(seed >>> 0);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  const plans = {
    hiver: {
      label: "Hiver",
      eyebrow: "Soldes & soirées canapé",
      blurb: "Gros solo, chill, et promos de fin d’année.",
      heroPrefer: ["Baldur's Gate 3", "Cyberpunk 2077", "Red Dead Redemption 2", "Hades", "Stardew Valley"],
      boost: ["chill", "hot"],
      guideBoost: ["game-pass-vs-acheter", "cyberpunk-pas-cher", "elden-ring-pas-cher", "acheter-jeux-pas-cher"],
    },
    printemps: {
      label: "Printemps",
      eyebrow: "Sessions à deux",
      blurb: "Coop, party, soirées Discord.",
      heroPrefer: ["It Takes Two", "Deep Rock Galactic", "Sea of Thieves", "Risk of Rain 2", "PlateUp!"],
      boost: ["coop"],
      guideBoost: ["meilleurs-jeux-coop-2026", "jeux-ce-soir-pas-cher", "instant-gaming-fiable"],
    },
    ete: {
      label: "Été",
      eyebrow: "Sessions courtes & course",
      blurb: "Parties rapides, sport, conduite.",
      heroPrefer: ["Forza Horizon 5", "Overcooked 2", "GTA V Enhanced", "Helldivers 2", "EA Sports FC"],
      boost: ["sport", "coop"],
      guideBoost: ["meilleurs-jeux-sport-2026", "jeux-ce-soir-pas-cher", "pc-gaming-petit-budget"],
    },
    automne: {
      label: "Automne",
      eyebrow: "Rentrée gaming",
      blurb: "Nouveautés, RPG, gros titres en promo.",
      heroPrefer: ["WARDOGS", "Elden Ring", "Baldur's Gate 3", "Helldivers 2", "Hogwarts Legacy"],
      boost: ["hot", "action"],
      guideBoost: ["elden-ring-pas-cher", "cyberpunk-pas-cher", "baldurs-gate-3-pas-cher", "cle-steam-pas-cher", "instant-gaming-fiable"],
    },
  };

  function current(d) {
    const key = seasonOf(d);
    return Object.assign({ key: key, month: monthOf(d), seed: monthSeed(d) }, plans[key]);
  }

  return { seasonOf: seasonOf, monthSeed: monthSeed, shuffle: shuffle, plans: plans, current: current };
})();
