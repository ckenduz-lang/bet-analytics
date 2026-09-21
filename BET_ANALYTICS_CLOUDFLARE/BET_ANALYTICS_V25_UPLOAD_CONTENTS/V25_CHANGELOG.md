# V25 — Parser Maçkolik réel + encodage turc

- Corrige la cause du 0 match observé dans le diagnostic V24.
- Lit les noms de compétitions dans les attributs `alt` / `title` des images Maçkolik.
- Décode automatiquement UTF-8 / Windows-1254 / ISO-8859-9 pour éviter `TÃ¼rkiye`, `Åžampiyonlar`, etc.
- Conserve le filtre grandes ligues hommes et rejette féminin, jeunes, réserves et divisions inférieures.
- Ajoute au mode `debug=1` l’encodage détecté, la taille de la page, le nombre de headings et de fixtures par source.
- Force `application/json; charset=utf-8`.
