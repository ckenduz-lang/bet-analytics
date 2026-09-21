# BET ANALYTICS V20 — Buteurs indispensables

Version Cloudflare du tableau de bord avec un module **Buteur Premium** plus transparent.

## Ce qui change

- vue dédiée **⭐ Buteurs indispensables**
- aucun joueur forcé : le résultat peut être **AUCUN PREMIUM**
- score interne **Indispensable /100** distinct d'une probabilité de but
- score **Forme & contexte /100**
- forme des 5 derniers matchs
- split des 5 derniers domicile / extérieur
- titularisations, minutes moyennes et sorties avant la 70e
- risque de rotation / concurrence effective
- part des buts de l'équipe et rôle penalty quand la source permet de l'identifier
- défense adverse dans le bon contexte domicile / extérieur
- blessures / indisponibilités
- **XI officiel obligatoire** pour la validation Premium
- cote buteur actuelle si le marché est trouvé dans la source
- opening / closing laissés vides tant qu'aucun historique de snapshots n'existe
- journal local des signaux suivis

## Données

Le nouveau endpoint `/api/scorer-premium` utilise API-Football/API-Sports quand `API_FOOTBALL_KEY` est configurée. Si la clé manque ou qu'un champ n'est pas fourni, l'interface affiche `—` ou un message d'indisponibilité. Elle ne fabrique pas la donnée.

Le moteur rapproche le match Maçkolik avec API-Football, récupère les statistiques saison, les derniers matchs, les statistiques individuelles des fixtures, les blessures, les lineups et les odds disponibles.

## Important sur les notes

`Indispensable /100` et `Forme & contexte /100` sont des **scores de filtrage internes**. Ce ne sont pas des probabilités de marquer.

La concurrence directe poste-pour-poste ne peut pas toujours être prouvée par la source. La V20 utilise donc un indicateur transparent de **rotation effective** : fréquence de titularisation, titularisations récentes, minutes et sorties précoces.

## Variables Cloudflare

Configurer le secret :

```bash
npx wrangler secret put API_FOOTBALL_KEY
```

Puis :

```bash
npm install
npm run build
npx wrangler deploy
```

## Marché / historique

La cote actuelle peut être lue lorsqu'un marché buteur est exposé. Pour obtenir **opening → current → closing** de façon fiable, la prochaine couche doit enregistrer des snapshots de cotes dans Cloudflare D1 ou utiliser un fournisseur qui livre directement l'historique.
