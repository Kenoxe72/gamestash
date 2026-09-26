#!/usr/bin/env python3
"""Rafraîchir price + stock Instant Gaming dans js/catalog.js"""
import json
import re
import subprocess
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "js" / "catalog.js"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def load_catalog():
    raw = subprocess.check_output(
        [
            "node",
            "-e",
            'const fs=require("fs");'
            'const t=fs.readFileSync("js/catalog.js","utf8");'
            "global.window=global;"
            "eval(t);"
            "console.log(JSON.stringify(global.JEUXSTASH_CATALOG));",
        ],
        cwd=ROOT,
        text=True,
    )
    return json.loads(raw)


def fetch(url: str) -> str:
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9"}
    )
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "ignore")


def scrape(url: str):
    html = fetch(url)
    avail = re.search(r'itemprop="availability"\s+content="([^"]+)"', html)
    # Priorité au prix produit (itemprop / data-price-eur), pas un "price" JSON aléatoire
    price = re.search(r'itemprop="price"\s+content="([0-9.]+)"', html)
    if not price:
        price = re.search(r'data-price-eur="([0-9.]+)"', html)
    if not price:
        price = re.search(r'data-price="([0-9.]+)"', html)
    stock = "ok"
    if avail:
        a = avail.group(1).lower()
        if "outofstock" in a or "out_of_stock" in a:
            stock = "out"
    elif re.search(r"Hors stock|out-of-stock", html, re.I):
        stock = "out"
    p = float(price.group(1)) if price else None
    if p == 0:
        p = None
    return p, stock


def main():
    games = load_catalog()
    for g in games:
        url = g.get("ig")
        if not url:
            continue
        try:
            price, stock = scrape(url)
            g["price"] = price
            g["stock"] = stock
            print(f"{g['name']}: {price} [{stock}]")
        except Exception as e:
            print(f"FAIL {g['name']}: {e}")
            g.setdefault("price", None)
            g["stock"] = "unknown"
        time.sleep(0.55)

    out = (
        "/* Catalogue JeuxStash — liens Instant Gaming affiliés (igr=gamer-47bd4c) */\n"
        "window.JEUXSTASH_CATALOG = "
        + json.dumps(games, ensure_ascii=False, indent=2)
        + ";\n"
        "window.JEUXSTASH_PRICES_UPDATED = "
        + json.dumps(__import__("datetime").date.today().isoformat())
        + ";\n"
    )
    CATALOG.write_text(out, encoding="utf-8")
    print(f"updated {len(games)} games → {CATALOG}")


if __name__ == "__main__":
    main()
