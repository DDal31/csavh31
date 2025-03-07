
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../public/club-logo.png')
  });

  // Charger l'URL de l'application
  const startUrl = isDev
    ? 'http://localhost:8080' // URL de développement
    : url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
      });

  mainWindow.loadURL(startUrl);

  // Ouvrir les outils de développement en mode développement
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Quand la fenêtre est fermée
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Créer un menu pour l'application
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'delete', label: 'Supprimer' },
        { role: 'selectall', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { role: 'toggledevtools', label: 'Outils développeur' },
        { type: 'separator' },
        { role: 'resetzoom', label: 'Zoom normal' },
        { role: 'zoomin', label: 'Zoom avant' },
        { role: 'zoomout', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Quand Electron a fini de s'initialiser
app.whenReady().then(createWindow);

// Quitter l'application quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  // Sur macOS, les applications continuent typiquement de s'exécuter 
  // jusqu'à ce que l'utilisateur quitte explicitement avec Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Sur macOS, il est courant de recréer une fenêtre dans l'application 
  // quand l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes
  if (mainWindow === null) {
    createWindow();
  }
});
