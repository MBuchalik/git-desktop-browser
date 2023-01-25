import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

export async function getAllTags(
  repoFolderPath: string,
): Promise<Result<string[]>> {
  const dugiteResult = await runDugiteCommand(
    ['tag', '--format=%(refname:short)'],
    repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  const tags: string[] = [];

  const lines = dugiteResult.stdout.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length < 1) {
      continue;
    }

    tags.push(trimmedLine);
  }

  return {
    success: true,
    data: tags,
  };
}
