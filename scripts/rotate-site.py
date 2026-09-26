#!/usr/bin/env python3
"""Aperçu / orchestration de la rotation saisonnière JeuxStash.

Usage:
  python3 scripts/rotate-site.py           # affiche le plan du mois
  python3 scripts/rotate-site.py --prices  # + refresh prix IG
  python3 scripts/rotate-site.py --deploy  # prices + deploy.sh

Ne supprime jamais les fichiers guides (SEO).
La rotation live est faite côté navigateur (js/season.js + home.js + guides-list.js).
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def season_of(d: date) -> str:
    m = d.month
    if m == 12 or m <= 2:
        return "hiver"
    if m <= 5:
        return "printemps"
    if m <= 8:
        return "ete"
    return "automne"


PLANS = {
    "hiver": {
        "label": "Hiver",
        "hero": ["Baldur's Gate 3", "Cyberpunk 2077", "Red Dead Redemption 2"],
        "guides": ["game-pass-vs-acheter", "cyberpunk-pas-cher", "elden-ring-pas-cher"],
    },
    "printemps": {
        "label": "Printemps",
        "hero": ["It Takes Two", "Deep Rock Galactic", "Sea of Thieves"],
        "guides": ["meilleurs-jeux-coop-2026", "jeux-ce-soir-pas-cher"],
    },
    "ete": {
        "label": "Été",
        "hero": ["Forza Horizon 5", "Overcooked 2", "GTA V Enhanced"],
        "guides": ["meilleurs-jeux-sport-2026", "jeux-ce-soir-pas-cher"],
    },
    "automne": {
        "label": "Automne",
        "hero": ["WARDOGS", "Elden Ring", "Baldur's Gate 3"],
        "guides": ["elden-ring-pas-cher", "cyberpunk-pas-cher", "instant-gaming-fiable"],
    },
}


def main() -> int:
    ap = argparse.ArgumentParser(description="Rotation saisonnière JeuxStash")
    ap.add_argument("--prices", action="store_true", help="Rafraîchir prix/stock IG")
    ap.add_argument("--deploy", action="store_true", help="Refresh prix puis deploy Cloudflare")
    args = ap.parse_args()

    today = date.today()
    key = season_of(today)
    plan = PLANS[key]
    print(f"Date     : {today.isoformat()}")
    print(f"Saison   : {plan['label']} ({key})")
    print(f"Hero     : {', '.join(plan['hero'])}")
    print(f"Guides ↑ : {', '.join(plan['guides'])}")
    print("Note     : fichiers guides conservés (SEO) — ordre/à-la-une via JS")

    if args.prices or args.deploy:
        print("\n→ refresh prix IG…")
        subprocess.check_call([sys.executable, str(ROOT / "scripts" / "refresh-ig-prices.py")], cwd=ROOT)

    if args.deploy:
        print("\n→ deploy…")
        subprocess.check_call(["zsh", str(ROOT / "deploy.sh")], cwd=ROOT)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
