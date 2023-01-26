import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

export async function getDiffForSingleCommit(params: {
  repoFolderPath: string;
  commitIsh: string;
}): Promise<Result<string>> {
  const dugiteResult = await runDugiteCommand(
    ['show', params.commitIsh, '-z', '--first-parent', `--format=%b`],
    params.repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  const splitResult = dugiteResult.stdout.split('\0');
  // The result may contain the diff AND a commit message. The commit message comes before the diff. Thus, we need to look at the last item.
  const diff = splitResult.at(-1);
  if (diff === undefined) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: diff,
  };
}
