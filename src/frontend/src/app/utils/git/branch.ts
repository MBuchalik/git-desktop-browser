import { Result } from '../../models/result';
import { runDugiteCommand } from '../ipc-bridge';

export async function getAllBranches(
  repoFolderPath: string,
): Promise<Result<string[]>> {
  const dugiteResult = await runDugiteCommand(
    ['branch', '--format=%(refname:short)'],
    repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  const branches: string[] = [];

  const lines = dugiteResult.stdout.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length < 1) {
      continue;
    }

    branches.push(trimmedLine);
  }

  return {
    success: true,
    data: branches,
  };
}
