#!/bin/zsh
# Entretien manuel (si tu veux forcer hors planning GitHub Actions)
# Automatique : .github/workflows/refresh-prices.yml (lun + jeu)
set -e
cd "$(dirname "$0")/.."
echo "→ refresh prix/stock IG…"
python3 scripts/refresh-ig-prices.py
echo "→ deploy…"
./deploy.sh
echo "✓ OK"
