import { GitProcess, IGitExecutionOptions } from 'dugite';
import {
  BrowserWindow,
  OpenDialogOptions,
  app,
  dialog,
  ipcMain,
} from 'electron';

let mainWindow: BrowserWindow | undefined;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#24292f',
      symbolColor: '#ffffff',
    },
  });

  mainWindow.maximize();

  void mainWindow.loadURL('http://localhost:3000');
};

void app.whenReady().then(() => {
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

ipcMain.handle(
  'dugite-execute',
  async (
    _event,
    args: string[],
    path: string,
    options?: IGitExecutionOptions,
  ) => {
    const result = await GitProcess.exec(args, path, options);

    return result;
  },
);

ipcMain.handle(
  'show-open-dialog',
  async (_event, options: OpenDialogOptions) => {
    if (!mainWindow) {
      return undefined;
    }

    const result = await dialog.showOpenDialog(mainWindow, options);

    return result;
  },
);
