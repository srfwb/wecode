# Nouveautés

## v0.3.0 — 27 avril 2026

### Ajouté

- **Système de leçons** — des leçons guidées pas à pas avec validation en temps réel. L'app vérifie ton code à chaque modification et coche les objectifs au fur et à mesure.
- **Système de challenges** — des défis libres où tu dois atteindre un objectif sans instructions détaillées. Tu peux créer et supprimer des fichiers.
- **Navigation par onglets dans l'Accueil** — le rail gauche est maintenant un routeur : clique sur Leçons ou Challenges pour voir la liste complète avec ton avancement.
- **Compteur de progression** — le rail affiche combien de leçons tu as terminées (ex : `1 / 2`).
- **Carte « Reprends »** — si tu as une leçon en cours, la carte de reprise la montre en priorité sur les projets.
- **Première leçon** : « La structure d'une page HTML » — apprends `<head>`, `<body>`, `<title>`, `<h1>`, `<p>` avec 5 checkpoints.
- **Premier challenge** : « Crée une page simple » — un titre, un paragraphe et une couleur de fond.
- **Modale changelog** — clique sur « Nouveautés de la vX.Y.Z » dans le rail pour voir l'historique des mises à jour.

### Amélioré

- Les raccourcis clavier (Ctrl+Tab, Ctrl+W) fonctionnent en mode leçon. Ctrl+N est bloqué (pas de création de fichier en leçon).
- Le dock leçon est un vrai `<button>` accessible au clavier (avec `aria-expanded`).
- Le menu « Ouvrir » en clic droit sur un fichier fonctionne en mode leçon.
- La barre de statut affiche la progression des checkpoints au lieu de la version en mode leçon.

### Corrigé

- Le dock se replie correctement (le contenu ne déborde plus sous le header).
- Le contour ambre ne s'affiche plus sur les boutons de sélection de template.
- La propriété CSS dans les règles de validation est correctement échappée (pas de faux match avec des caractères spéciaux).

---

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
