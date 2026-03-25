const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Handle electron-squirrel-startup
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // Module not installed, skip
}

let mainWindow;
let loadingWindow;
let serverProcess;

// Paths
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function getServerPath() {
  if (isDev) {
    return path.join(__dirname, '..', '.next', 'standalone', 'server.js');
  }
  return path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js');
}

function getDbPath() {
  if (isDev) {
    return path.join(__dirname, '..', 'db', 'custom.db');
  }
  return path.join(process.resourcesPath, 'app', 'db', 'custom.db');
}

// Create loading window
function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loadingWindow.loadURL(`data:text/html,
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          border-radius: 10px;
          overflow: hidden;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .logo span {
          color: #f59e0b;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .status {
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="logo">Auto<span>Parts</span> Stock</div>
      <div class="spinner"></div>
      <div class="status" id="status">Démarrage en cours...</div>
    </body>
    </html>
  `);

  loadingWindow.on('closed', () => {
    loadingWindow = null;
  });

  return loadingWindow;
}

// Update loading status
function updateLoadingStatus(status) {
  if (loadingWindow) {
    loadingWindow.webContents.executeJavaScript(
      `document.getElementById('status').textContent = '${status}'`
    );
  }
}

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'AutoParts Stock - Gestion de Stock',
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    if (loadingWindow) {
      loadingWindow.close();
    }
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    updateLoadingStatus(`Erreur: ${errorDescription}`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create menu
  const menuTemplate = [
    {
      label: 'Fichier',
      submenu: [
        { type: 'separator' },
        { role: 'quit', label: 'Quitter' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' },
        { type: 'separator' },
        {
          label: 'Outils de développement',
          click: () => mainWindow?.webContents.openDevTools()
        }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos',
              message: 'AutoParts Stock v1.0.0',
              detail: 'Application de gestion de stock de pièces automobiles.'
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

// Start Next.js server
function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath();
    
    console.log('Server path:', serverPath);
    console.log('Server exists:', fs.existsSync(serverPath));

    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server not found: ${serverPath}`));
      return;
    }

    updateLoadingStatus('Démarrage du serveur...');

    const env = {
      ...process.env,
      PORT: '3000',
      NODE_ENV: 'production',
      DATABASE_URL: 'file:./db/custom.db'
    };

    serverProcess = spawn('node', [serverPath], {
      cwd: path.dirname(serverPath),
      env: env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('Server:', data.toString());
      if (data.toString().includes('Ready') || 
          data.toString().includes('started') ||
          data.toString().includes('listening')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    // Timeout fallback
    setTimeout(() => {
      console.log('Server startup timeout, continuing...');
      resolve();
    }, 8000);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  console.log('=== AutoParts Stock Starting ===');
  console.log('isDev:', isDev);
  console.log('resourcesPath:', process.resourcesPath);

  // Show loading window
  createLoadingWindow();

  try {
    // Start server if not in development
    if (!isDev) {
      updateLoadingStatus('Initialisation...');
      await startServer();
      updateLoadingStatus('Chargement de l\'application...');
    }

    // Wait a bit for server to be ready
    await new Promise(r => setTimeout(r, 2000));

    // Create main window
    createMainWindow();

  } catch (error) {
    console.error('Startup error:', error);
    updateLoadingStatus(`Erreur: ${error.message}`);
    
    dialog.showErrorBox(
      'Erreur de démarrage',
      `L'application n'a pas pu démarrer:\n${error.message}\n\nConsultez la console pour plus de détails.`
    );
    
    setTimeout(() => app.quit(), 5000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
