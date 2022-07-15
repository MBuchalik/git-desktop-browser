import { IGitExecutionOptions, IGitResult } from 'dugite';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';

/*
  A trick that allows to use the Electron APIs without having to change the webpack config.
  See https://medium.com/free-code-camp/building-an-electron-application-with-create-react-app-97945861647c
  If, at some point, we also need to use the file system, then according to the article we can do that using the following: 
  const fs = electron.remote.require('fs');
*/
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export async function runDugiteCommand(
  args: string[],
  path: string,
  options?: IGitExecutionOptions,
): Promise<IGitResult> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await ipcRenderer.invoke(
    'dugite-execute',
    args,
    path,
    options,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}

export async function showOpenDialog(
  options: OpenDialogOptions,
): Promise<OpenDialogReturnValue> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await ipcRenderer.invoke('show-open-dialog', options);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}
