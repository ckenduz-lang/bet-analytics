# BET ANALYTICS V27 — PRONOSOFT ONLY

Version Cloudflare simplifiée avec Pronosoft comme source football principale.

Source : page publique Pronosoft ParionsSport 1N2 en HTML.
- compétitions
- horaires
- équipes
- cotes 1/N/2 lorsqu'elles sont publiées

Filtrage : premières divisions masculines + grandes compétitions continentales. D2, féminin, jeunes, réserves et coupes nationales sont exclus.

Endpoints :
- `/api/version`
- `/api/football?debug=1`
- `/api/leagues`

Avant déploiement : `npm run test` puis `npm run build`.
