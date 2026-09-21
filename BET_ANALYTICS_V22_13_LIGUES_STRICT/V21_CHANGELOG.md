# V21 — 13 ligues visibles + filtre strict réparé

- Les 13 compétitions BET ANALYTICS sont désormais toujours visibles dans la barre des ligues, même avec 0 match le jour sélectionné.
- Correction d'un bug de parser : une compétition non autorisée pouvait hériter du nom de la compétition autorisée précédente.
- Les compétitions non autorisées réinitialisent désormais le contexte du parser et leurs matchs sont ignorés.
- Ajout/renforcement des alias Maçkolik pour Turquie, Danemark, Chine, Finlande, MLS et Ligue des champions.
- Exclusion renforcée : D2, Championship, 1. Lig, équipes jeunes/réserves et compétitions féminines.
- L'API `/api/football` renvoie aussi `leagueCounts` et `strictTop13: true`.
