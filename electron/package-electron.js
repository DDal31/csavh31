
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's path and directory in a way that works with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build the path to package.json in a more reliable way
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');

console.log('Reading package.json from:', packageJsonPath);

try {
  // Lire le fichier package.json existant
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  // Ajouter les scripts Electron
  packageJson.scripts = {
    ...packageJson.scripts,
    "electron:dev": "concurrently \"cross-env ELECTRON=true vite dev\" \"electron electron/main.js\"",
    "electron:build": "vite build && electron-builder",
    "electron:build:mac": "vite build && electron-builder --mac",
    "electron:build:win": "vite build && electron-builder --win",
    "electron:build:linux": "vite build && electron-builder --linux"
  };

  // Ajouter la propriété main pour Electron
  packageJson.main = "electron/main.js";

  // Écrire le fichier package.json mis à jour
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log("Scripts Electron ajoutés au fichier package.json avec succès.");
} catch (error) {
  console.error("Erreur lors de la mise à jour du package.json:", error.message);
  console.error("Chemin complet:", packageJsonPath);
  console.error("Répertoire actuel:", process.cwd());
  process.exit(1);
}
