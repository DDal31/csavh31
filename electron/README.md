
# CSAVH31 - Application de bureau

Ce dossier contient les fichiers nécessaires pour construire l'application de bureau CSAVH31 avec Electron.

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn

## Installation

Exécutez ces commandes à la racine du projet:

```bash
# Installer les dépendances
npm install

# Ajouter les scripts Electron à package.json
node electron/package-electron.js
```

## Utilisation

### Développement

Pour lancer l'application en mode développement:

```bash
npm run electron:dev
```

### Construction

Pour construire l'application pour toutes les plateformes:

```bash
npm run electron:build
```

Pour construire l'application pour une plateforme spécifique:

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

Les fichiers générés se trouveront dans le dossier `dist_electron`.

## Notes

- Sur macOS, vous aurez besoin d'un certificat de développeur Apple pour signer l'application
- Sur Windows, vous n'avez pas besoin de certificat mais pour la distribution, un certificat EV (Extended Validation) est recommandé
