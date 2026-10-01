#!/bin/zsh
# Deploy JeuxStash to Cloudflare Pages (production)
set -e
cd "$(dirname "$0")"
node scripts/generate-fiches.js
npx --yes wrangler@4 pages deploy . --project-name=jeuxstash --branch=main --commit-dirty=true
echo "Live: https://jeuxstash.pages.dev"
