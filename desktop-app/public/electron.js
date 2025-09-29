const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === '1';
const Store = require('electron-store');
const Database = require('./database/database');

// Initialize electron store for settings
const store = new Store();

// Initialize database
const db = new Database();

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Stream',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-stream');
          }
        },
        {
          label: 'Import Data',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'CSV Files', extensions: ['csv'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-import-data', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Export Data',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              defaultPath: 'aurelius-data.json',
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'CSV Files', extensions: ['csv'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-export-data', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          }
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Aurelius',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Aurelius',
              message: 'Aurelius Desktop',
              detail: 'Your Personal IMVU Modeling Assistant\n\nVersion 1.0.0\n\n❧ "In the gentle guidance of structure, creativity finds its truest expression." ❧'
            });
          }
        },
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal('https://github.com/aurelius-bot/docs');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            require('electron').shell.openExternal('https://github.com/aurelius-bot/desktop/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for database operations
ipcMain.handle('db-get-streams', async () => {
  try {
    return await db.getStreams();
  } catch (error) {
    console.error('Error getting streams:', error);
    throw error;
  }
});

ipcMain.handle('db-create-stream', async (event, streamData) => {
  try {
    return await db.createStream(streamData);
  } catch (error) {
    console.error('Error creating stream:', error);
    throw error;
  }
});

ipcMain.handle('db-update-stream', async (event, id, updates) => {
  try {
    return await db.updateStream(id, updates);
  } catch (error) {
    console.error('Error updating stream:', error);
    throw error;
  }
});

ipcMain.handle('db-delete-stream', async (event, id) => {
  try {
    return await db.deleteStream(id);
  } catch (error) {
    console.error('Error deleting stream:', error);
    throw error;
  }
});

ipcMain.handle('db-get-settings', async () => {
  try {
    return store.store;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
});

ipcMain.handle('db-set-settings', async (event, settings) => {
  try {
    store.set(settings);
    return true;
  } catch (error) {
    console.error('Error setting settings:', error);
    throw error;
  }
});

ipcMain.handle('db-export-data', async () => {
  try {
    const streams = await db.getStreams();
    const settings = store.store;
    return {
      streams,
      settings,
      exportDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
});

ipcMain.handle('db-import-data', async (event, data) => {
  try {
    if (data.streams) {
      await db.importStreams(data.streams);
    }
    if (data.settings) {
      store.set(data.settings);
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
});

// Handle app protocol for deep linking
app.setAsDefaultProtocolClient('aurelius');

// Handle protocol URLs
app.on('open-url', (event, url) => {
  event.preventDefault();
  // Handle deep link URL
  console.log('Deep link received:', url);
});
