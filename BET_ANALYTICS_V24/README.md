# BET ANALYTICS V24 — Major Men's Leagues + Calibration

Version Cloudflare de BET ANALYTICS.

## Ce que V24 change
1. Le parseur Maçkolik ne garde plus la ligue précédente quand il rencontre une section rejetée.
2. Le programme fusionne deux pages publiques Maçkolik puis déduplique les rencontres.
3. Les matchs sont filtrés sur leur vraie date détectée dans la source.
4. Toutes les principales premières divisions hommes reconnues sont acceptées, pas seulement 13 ligues.
5. Féminin, jeunes, réserves, D2 et amicaux sont rejetés.
6. L'interface ajoute un tableau Calibration : réussite, Brier, log loss et bins de probabilité.
7. Le journal enregistre le signal avant le résultat et permet d'ajouter la closing odd.

## Diagnostic ligues
Ouvrir :
`/api/football?date=YYYY-MM-DD&debug=1`

La réponse contient :
- `acceptedCompetitions`
- `rejectedCompetitions`
- la raison du rejet
- les dates réellement présentes dans la source

## Déploiement Cloudflare
Root directory : `BET_ANALYTICS_CLOUDFLARE` (si ce dossier reste celui configuré dans Cloudflare)
Build command : `npm install && npm run build`
Deploy command : `npx wrangler deploy`

Le projet n'exige pas D1 pour démarrer : le journal/calibrage fonctionne en `localStorage`.
Le fichier `data/schema.sql` prépare la migration ultérieure vers D1 pour un historique persistant multi-appareils.
