fix(readme): chemins d'images relatifs (Galerie + 5 bannieres)

Toutes les balises <img> du README utilisaient un chemin absolu
(/public/.../X.{png,svg}). Le rendu README de GitHub ne resout
que les chemins relatifs au repo ; les chemins absolus echouent
en silence (cartouche vide, alt-text visible, image absente).

Suppression du slash initial sur 6 references : 4 captures
dans Galerie en action + 5 assets dans public/banner/ (banner
hero, sceau-capot, carte-monde, quest-chain, footer-flourish).

Fixes: user-reported "les images Galerie ne s'affichent plus"
