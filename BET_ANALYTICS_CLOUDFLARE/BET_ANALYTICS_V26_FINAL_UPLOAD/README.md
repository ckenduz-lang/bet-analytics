# BET ANALYTICS V26 — CLEAN BUILD

Cette version repart d'une structure minimale et stable pour Cloudflare Workers.

## Pourquoi V26
- plus de dépendance `cloudflare/worker.mjs -> netlify/functions/football.mjs` : le parser est directement dans `cloudflare/football.mjs`;
- aucun fichier V20/V24/V25 requis;
- build statique simple, sans React/Vite;
- API versionnée `/api/version`;
- parser Maçkolik version `26.0.0`;
- cache désactivé pendant la stabilisation pour éviter d'afficher une ancienne version;
- femmes, jeunes, réserves, divisions inférieures et coupes domestiques exclus;
- large catalogue de premières divisions masculines + compétitions continentales majeures.

## Test local
```bash
npm install
npm run check
```
`npm run check` exécute les tests du parser, construit `dist/`, puis lance un `wrangler deploy --dry-run`.

## Déploiement Cloudflare
Le root directory Cloudflare doit rester :
`BET_ANALYTICS_CLOUDFLARE`

Build command :
`npm install && npm run build`

Deploy command :
`npx wrangler deploy`

Après déploiement :
- `/api/version` doit renvoyer `26.0.0`
- `/api/football?date=YYYY-MM-DD&debug=1` doit renvoyer `parserVersion: 26.0.0`

## Important
Aucune probabilité de modèle n'est inventée. Les cotes 1X2 peuvent être transformées en probabilités de marché sans marge. Les probabilités de modèle et buteurs Premium restent désactivées tant que les données nécessaires ne sont pas réellement disponibles.
