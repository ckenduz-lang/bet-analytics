# V20 changelog

- nouvelle vue `⭐ Buteurs indispensables`
- interface de carte transparente inspirée des trackers modernes : facteurs visibles, score interne, complétude des données, marché et journal
- nouvel endpoint `/api/scorer-premium`
- matching Maçkolik -> API-Football par date + noms d'équipes
- récupération saison + derniers matchs + stats individuelles + blessures + lineups + odds disponibles
- Premium bloqué tant que le XI officiel n'est pas confirmé
- aucun faux xG : champ laissé indisponible si la source ne l'expose pas
- aucun faux opening/closing : schéma D1 fourni pour les snapshots historiques
- journal local des signaux Premium dans le navigateur
- logique explicite `PREMIUM / À SURVEILLER / REJETÉ`
- possibilité réelle de retourner `AUCUN PREMIUM`
