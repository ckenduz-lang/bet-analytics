# V23 — Ligues hommes majeures dynamiques

- Suppression de la limite fixe des 13 ligues.
- Les compétitions sont lues avec leur nom Maçkolik en turc et affichées dynamiquement.
- Exclusion stricte : féminin/Kadın/(K), U21/U19/U18, réserves/(B), academy/youth.
- Exclusion des divisions inférieures connues : Azadegan Ligi, División Intermedia, Ligue 2, Serie B/C, Championship, 2. Bundesliga, etc.
- Les coupes nationales sont exclues de la vue « ligues majeures ».
- Les grandes compétitions continentales (Champions League, Europa League, Conference League, Libertadores, etc.) restent admises.
- Correction critique du parseur : chaque nouveau titre de compétition réinitialise le contexte, même si la compétition est rejetée. Un match iranien/paraguayen ne peut donc plus hériter du libellé « İngiltere Premier Lig ».
- Barre des ligues générée à partir des compétitions réellement présentes dans le programme Maçkolik du jour.
