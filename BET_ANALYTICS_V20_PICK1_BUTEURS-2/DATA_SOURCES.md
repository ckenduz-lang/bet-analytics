# Sources V19

## Actives sans clé
- Maçkolik : programme/cotes quand la page publique les expose.
- Pronosoft : liste publique, utilisée indépendamment.

## Nouvelle source structurée
- football-data.org v4 : fixtures/résultats et historique récent pour les compétitions disponibles sur le plan gratuit.
- Variable à ajouter plus tard sur l'hébergeur : `FOOTBALL_DATA_TOKEN`.
- Sans cette variable, le site continue de fonctionner avec Maçkolik + Pronosoft : la nouvelle source renvoie simplement `configured:false`.

## Compétitions football-data.org branchées
Premier League, LaLiga, Serie A, Bundesliga, Ligue 1, Eredivisie, UEFA Champions League.

## Forme réelle
`/api/form-history?league=...&team=...` calcule sur les 10 derniers matchs terminés :
PPG, buts marqués/match, buts encaissés/match, Over 2.5 et BTTS.

## Règle
Aucune donnée manquante n'est remplacée par une statistique inventée. Les autres ligues restent alimentées par les sources existantes jusqu'à ajout d'une source gratuite vérifiée.
