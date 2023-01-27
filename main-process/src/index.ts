import path from 'path';

import { GitProcess, IGitExecutionOptions } from 'dugite';
import {
  BrowserWindow,
  OpenDialogOptions,
  app,
  dialog,
  ipcMain,
} from 'electron';

/*
  Handle startup events by Squirrel.
  This is for instance necessary so that an application shortcut is created on the first run,
  or to properly handle uninstalls.
*/
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (require('electron-squirrel-startup')) {
  process.exit();
}

const DEV_MODE = !app.isPackaged;

let mainWindow: BrowserWindow | undefined;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#24292f',
      symbolColor: '#ffffff',
    },
  });

  mainWindow.maximize();

  if (DEV_MODE) {
    void mainWindow.loadURL('http://localhost:3000');
  } else {
    void mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }
};

app.setName('Git Desktop Browser');

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
