# BET ANALYTICS V29 — Pronosoft + commentaires + Buteurs Premium

## Ce qui change
- Pronosoft reste la source du programme et des cotes 1N2.
- Filtre strict des grandes ligues masculines conservé.
- Chaque match possède maintenant un **Commentaire BET ANALYTICS** original.
- Sans clé API-Football, le commentaire utilise uniquement le marché Pronosoft et l'indique clairement.
- Avec `API_FOOTBALL_KEY`, le commentaire est enrichi par les 5 derniers matchs, les blessures/suspensions, les XI disponibles et la prédiction externe API-Football.
- Le module **Buteur Premium** utilise API-Football pour les joueurs, minutes, titularisations, forme récente, blessures, XI et cotes buteur quand disponibles.
- Aucune donnée absente n'est remplacée par une estimation inventée.

## Secret Cloudflare nécessaire pour l'enrichissement joueurs
Dans Cloudflare > Worker `bet-analytics` > Bindings / Variables and Secrets, ajouter un secret :

`API_FOOTBALL_KEY = <votre clé API-Sports>`

Ne jamais mettre cette clé dans `src/main.jsx` ni dans un fichier public.

## Routes
- `/api/version`
- `/api/football?date=YYYY-MM-DD&debug=1`
- `/api/leagues`
- `/api/match-commentary?home=...&away=...&date=YYYY-MM-DD&oh=...&od=...&oa=...`
- `/api/match-analysis?homeName=...&awayName=...&date=YYYY-MM-DD`
- `/api/scorer-premium?home=...&away=...&date=YYYY-MM-DD`

## Tests effectués
- parser Pronosoft strict : OK
- syntaxe Worker / modules : OK
- syntaxe JSX vérifiée avec TypeScript parser : OK
