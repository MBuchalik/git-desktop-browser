import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

import { buildBlobOrTreeRef } from './common';

export async function getBlob(params: {
  repoFolderPath: string;
  commitIsh: string;
  blobPath: string[];
}): Promise<Result<string>> {
  const blobRef = buildBlobOrTreeRef(params.commitIsh, params.blobPath);

  const dugiteResult = await runDugiteCommand(
    ['show', blobRef],
    params.repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: dugiteResult.stdout,
  };
}
