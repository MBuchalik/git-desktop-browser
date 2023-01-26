import { runDugiteCommand } from '../ipc-bridge';

import { buildBlobOrTreeRef } from './common';

/**
 * Does the given blob or tree path exist for this particular CommitIsh?
 */
export async function doesPathExist(params: {
  repoFolderPath: string;
  commitIsh: string;
  itemPath: string[];
}): Promise<{ exists: boolean }> {
  // The root path always exists.
  if (params.itemPath.length < 1) {
    return {
      exists: true,
    };
  }

  const ref = buildBlobOrTreeRef(params.commitIsh, params.itemPath);

  const dugiteResult = await runDugiteCommand(
    ['show', ref],
    params.repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    // `git show` will return an error if the path does not exists. Technically, the error could be caused by something else, but that should be fine for now.
    return {
      exists: false,
    };
  }

  return {
    exists: true,
  };
}
