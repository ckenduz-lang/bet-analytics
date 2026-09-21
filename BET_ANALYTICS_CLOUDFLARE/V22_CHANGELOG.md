# V22

- Affiche toujours les 13 ligues, y compris celles avec 0 match.
- Barre des ligues en retour à la ligne : plus de ligues cachées horizontalement.
- Corrige le parseur Maçkolik : les en-têtes `Pays - Ligue` avec tiret sont maintenant reconnus.
- Toute compétition non autorisée remet le contexte à zéro pour éviter l'héritage de la ligue précédente.
- Rejette aussi les équipes Uxx, réserves, academy, youth et `(B)`.
- Ajoute `parserVersion: 22.0.0` à `/api/football`.
- En-tête visuel V22 pour vérifier immédiatement que la bonne version est en ligne.
