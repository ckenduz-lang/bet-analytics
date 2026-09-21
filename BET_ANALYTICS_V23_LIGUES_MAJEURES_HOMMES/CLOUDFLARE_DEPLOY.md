# Déploiement Cloudflare — BET ANALYTICS

Projet converti pour Cloudflare Workers + Static Assets.

## Première publication
1. Décompresser le ZIP.
2. Ouvrir un Terminal dans ce dossier.
3. `npm install`
4. `npx wrangler login`
5. `npm run deploy:cloudflare`

Cloudflare fournit ensuite l'adresse `*.workers.dev`.

## Clé football-data.org
Après la première publication :
`npx wrangler secret put FOOTBALL_DATA_TOKEN`
Coller la clé gratuite, puis relancer :
`npm run deploy:cloudflare`

Sans cette clé, Maçkolik et Pronosoft continuent de fonctionner et football-data.org est simplement désactivé.

## Architecture
- React/Vite -> `dist/`
- Worker -> `cloudflare/worker.mjs`
- API -> `/api/football`, `/api/pronosoft-list`, `/api/football-data`, `/api/form-history`, `/api/match-analysis`
- Assets SPA servis par Cloudflare Workers Static Assets.
