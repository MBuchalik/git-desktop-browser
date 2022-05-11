import { Result } from '../../models/result';
import { runDugiteCommand } from '../ipc-bridge';

export async function parseRef(
  repoFolderPath: string,
  ref: string,
): Promise<Result<string>> {
  const dugiteResult = await runDugiteCommand(
    ['rev-parse', ref],
    repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0 || dugiteResult.stdout.length < 1) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: dugiteResult.stdout.trim(),
  };
}
