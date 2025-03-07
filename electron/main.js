
const { app, BrowserWindow, session, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV !== 'production';

// Gérer les erreurs non attrapées
process.on('uncaughtException', (error) => {
  console.error('Erreur non attrapée dans le processus principal:', error);
  dialog.showErrorBox(
    'Erreur Application',
    `Une erreur s'est produite: ${error.message}\n\nL'application va continuer à fonctionner.`
  );
});

let mainWindow;

function createWindow() {
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      sandbox: true,
    },
    icon: path.join(__dirname, '../public/club-logo.png')
  });

  // Configurer le Content Security Policy avant le chargement de la page
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "font-src 'self'; " +
          "connect-src 'self' https: wss:;"
        ]
      }
    });
  });

  // Charger l'application
  if (isDev) {
    console.log('Chargement en mode développement:', 'http://localhost:8080');
    mainWindow.loadURL('http://localhost:8080');
    // Ouvrir les outils de développement
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Chargement en mode production:', indexPath);
    // Vérifier que le fichier existe avant de le charger
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error('Le fichier index.html n\'existe pas:', indexPath);
      dialog.showErrorBox(
        'Erreur de chargement',
        `Le fichier index.html n'a pas été trouvé à l'emplacement: ${indexPath}`
      );
    }
  }

  // Gérer les erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Échec du chargement: ${errorCode} - ${errorDescription}`);
    
    const errorHtml = `
      <html>
        <head>
          <title>Erreur de chargement</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; text-align: center; padding: 50px; }
            h1 { color: #d32f2f; }
            button { background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Erreur de chargement de l'application</h1>
          <p>L'application n'a pas pu être chargée. Erreur: ${errorDescription} (${errorCode})</p>
          <button onclick="window.location.reload()">Réessayer</button>
        </body>
      </html>
    `;
    
    mainWindow.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
    
    if (isDev) {
      console.log('Tentative de rechargement dans 5 secondes...');
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL('http://localhost:8080');
        }
      }, 5000);
    }
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Créer la fenêtre lorsque Electron est prêt
app.whenReady().then(() => {
  createWindow();
});

// Quitter lorsque toutes les fenêtres sont fermées
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
