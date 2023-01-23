import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

function buildBlobRef(commitIsh: string, blobPath: string[]): string {
  if (blobPath.length < 1) {
    return commitIsh;
  }

  const blobPathAsString = blobPath.join('/');

  return `${commitIsh}:${blobPathAsString}`;
}

export async function getBlob(params: {
  repoFolderPath: string;
  commitIsh: string;
  blobPath: string[];
}): Promise<Result<string>> {
  const blobRef = buildBlobRef(params.commitIsh, params.blobPath);

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
