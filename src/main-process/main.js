const { app, BrowserWindow, dialog, ipcMain } = require('electron');

const { GitProcess } = require('dugite');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:4200');
};

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

ipcMain.handle('dugite-execute', async (_event, ...args) => {
  const result = await GitProcess.exec(...args);

  return result;
});

ipcMain.handle('show-open-dialog', async (_event, options) => {
  if (!mainWindow) {
    return undefined;
  }

  const result = await dialog.showOpenDialog(mainWindow, options);

  return result;
});
