import type { GitProcess } from 'dugite';
import { OpenDialogOptions, dialog, ipcRenderer } from 'electron';

export async function runDugiteCommand(
  ...args: Parameters<typeof GitProcess.exec>
): ReturnType<typeof GitProcess.exec> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await ipcRenderer.invoke('dugite-execute', ...args);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}

export async function showOpenDialog(
  options: OpenDialogOptions,
): ReturnType<typeof dialog.showOpenDialog> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const result = await ipcRenderer.invoke('show-open-dialog', options);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}
