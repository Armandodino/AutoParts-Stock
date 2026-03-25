const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup not installed, skip this step
  console.log('electron-squirrel-startup not found, skipping...');
}

let mainWindow;
let serverProcess;

// Path to the Next.js server
const serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
const dbPath = path.join(__dirname, '..', 'db', 'custom.db');

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'AutoParts Stock - Gestion de Stock',
    show: false, // Show when ready
  });

  // Load the Next.js app
  const startUrl = process.env.ELECTRON_START_URL || `http://localhost:3000`;
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  const menuTemplate = [
    {
      label: 'Fichier',
      submenu: [
        { 
          label: 'Sauvegarder la base de données',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Sauvegarder la base de données',
              defaultPath: `autoparts_backup_${Date.now()}.db`,
              filters: [{ name: 'Database', extensions: ['db'] }]
            });
            if (!result.canceled && result.filePath) {
              try {
                fs.copyFileSync(dbPath, result.filePath);
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Succès',
                  message: 'Sauvegarde créée avec succès !'
                });
              } catch (error) {
                dialog.showErrorBox('Erreur', `Erreur lors de la sauvegarde: ${error.message}`);
              }
            }
          }
        },
        { 
          label: 'Restaurer la base de données',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Restaurer la base de données',
              filters: [{ name: 'Database', extensions: ['db'] }],
              properties: ['openFile']
            });
            if (!result.canceled && result.filePaths.length > 0) {
              const confirm = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                title: 'Confirmation',
                message: 'Voulez-vous vraiment restaurer cette sauvegarde ? Les données actuelles seront remplacées.',
                buttons: ['Annuler', 'Restaurer'],
                defaultId: 0,
                cancelId: 0
              });
              if (confirm.response === 1) {
                try {
                  fs.copyFileSync(result.filePaths[0], dbPath);
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Succès',
                    message: 'Base de données restaurée. Veuillez redémarrer l\'application.'
                  });
                } catch (error) {
                  dialog.showErrorBox('Erreur', `Erreur lors de la restauration: ${error.message}`);
                }
              }
            }
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'Quitter' }
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
        { role: 'selectAll', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { role: 'forceReload', label: 'Forcer l\'actualisation' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Taille normale' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
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
              title: 'À propos d\'AutoParts Stock',
              message: 'AutoParts Stock v1.0.0',
              detail: 'Application de gestion de stock de pièces automobiles.\n\nDéveloppée avec Next.js et Electron.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// Start the Next.js server
function startServer() {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    
    // Start the Next.js server
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '3000' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('Ready')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    // Resolve after timeout if server doesn't output Ready
    setTimeout(resolve, 3000);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    // Start Next.js server in production
    if (process.env.NODE_ENV !== 'development') {
      await startServer();
    }
    
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// IPC handlers for database operations
ipcMain.handle('get-db-path', () => {
  return dbPath;
});

ipcMain.handle('backup-database', async (event, backupPath) => {
  try {
    fs.copyFileSync(dbPath, backupPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-database', async (event, restorePath) => {
  try {
    fs.copyFileSync(restorePath, dbPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
