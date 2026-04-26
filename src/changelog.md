# Nouveautés

## v0.2.0-2 — 25 avril 2026

### Ajouté

- **Palette de commandes** (Ctrl+K / ⌘K) — rechercher un projet, un fichier ou une commande depuis l'Accueil.
- **Menu contextuel** sur la section Projets récents — clic droit pour créer un nouveau projet ou lancer une recherche.
- **Logo pixel-perfect** — le logo WeCode correspond maintenant exactement au design original dans toutes ses variantes.
- Bannière et carte Open Graph pour le repo GitHub.

### Amélioré

- L'app ne plante plus si le dossier du dernier projet a été supprimé pendant qu'elle était fermée.
- Un toast d'erreur apparaît si la sauvegarde automatique échoue (disque plein, permissions, etc.).
- Renommer un projet avec un nom déjà pris par un autre est maintenant interdit.
- Les onglets de l'ancien projet sont vidés quand tu passes à un autre.
- Le bouton « Ouvrir le dossier » fonctionne sur Windows (utilise `revealItemInDir` au lieu de `openPath`).
- L'animation d'apparition des cartes projets est plus rapide.
- Les items de navigation du rail sont maintenant accessibles au clavier.
- Le focus clavier est visible sur les onglets de l'éditeur.

### Corrigé

- Le contour orange parasite ne s'affiche plus sur les boutons de template ni sur le menu contextuel.
- Le menu natif du navigateur (Retour, Actualiser, Inspecter) est bloqué partout dans l'app.

---

## v0.2.0-1 — 23 avril 2026

### Ajouté

- **Page d'accueil** — vue par défaut avec la liste des projets récents, la section « Continue le parcours » et les modèles de projet.
- **Projets sur disque** — chaque projet est un vrai dossier sous `~/Documents/WeCode/`.
- Créer un projet depuis un modèle (Dossier vierge ou HTML + CSS) avec un sélecteur de dossier natif.
- Renommer et supprimer un projet (avec option de suppression du dossier sur le disque).
- Menu contextuel sur les cartes projets : Ouvrir, Ouvrir le dossier, Renommer, Supprimer.
- Rechargement automatique quand un éditeur externe modifie les fichiers du projet actif.
- Aperçu mobile / desktop dans le preview.
- Infobulles sur les mots-clés HTML et CSS dans l'éditeur.
- Notifications toast et boîtes de confirmation.
- Raccourcis clavier : `Ctrl+N` (nouveau fichier), `Ctrl+W` (fermer l'onglet), `Ctrl+Tab` / `Ctrl+Shift+Tab` (naviguer entre les onglets).
- Barre de statut avec sauvegarde auto, latence preview, langue, encodage, ligne:colonne.
- Refonte visuelle basée sur un design system oklch (Geist + JetBrains Mono).

### Amélioré

- Latence preview réduite de ~1 s à ~100 ms.

### Corrigé

- Fuites de listeners lors des recharges HMR.
- Le panneau d'aperçu ne reste plus blanc sans mises à jour.

---

## v0.1.0 — 20 avril 2026

### Ajouté

- Première version : shell Tauri v2, éditeur trois panneaux (arborescence, éditeur CodeMirror 6, aperçu live) avec un système de fichiers virtuel en mémoire.
