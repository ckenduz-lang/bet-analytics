# BET ANALYTICS V24

## Ligues majeures hommes — correctif structurel
- double lecture Maçkolik : `Iddaa-Programi` + ancien `Program.aspx` ;
- recherche du titre de compétition dans tout le HTML, pas seulement dans la ligne du match ;
- toute section D2/féminine/jeune/réserve remet le contexte à zéro ;
- chaque match conserve sa vraie date trouvée dans la source ;
- refus d'attribuer artificiellement la date demandée à un match d'une autre journée ;
- catalogue large de premières divisions hommes + grandes compétitions continentales ;
- exclusions : femmes, Uxx, réserves/B/II, amicaux, amateurs et divisions inférieures ;
- `?debug=1` sur `/api/football` expose les compétitions acceptées/rejetées et la raison.

## Modèle + calibration
- comparaison Modèle équipe / Marché sans marge ;
- simulation Monte Carlo 10 000 tirages à partir des λ Poisson, explicitement marquée comme contrôle et non source indépendante ;
- contrôle XI/joueurs séparé lorsqu'une source joueur est disponible ;
- journal local des prédictions enregistrées avant règlement ;
- règlement GAGNÉ/PERDU ;
- saisie de la closing odd ;
- taux de réussite, score de Brier, log loss et calibration par tranches de 5 points ;
- avertissement automatique pour petit échantillon ;
- Buteurs Premium séparés : taux de réussite oui, Brier non tant qu'une vraie probabilité buteur calibrée n'existe pas.

## Principe
Aucune valeur manquante n'est remplacée par une estimation silencieuse. Une note interne /100 n'est jamais présentée comme une probabilité.
