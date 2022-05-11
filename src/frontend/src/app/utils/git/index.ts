import { Result } from '../../models/result';
import { runDugiteCommand } from '../ipc-bridge';

async function isBareRepo(folderPath: string): Promise<Result<boolean>> {
  const dugiteResult = await runDugiteCommand(
    ['rev-parse', '--is-bare-repository'],
    folderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  if (dugiteResult.stdout.trim() === 'true') {
    return {
      success: true,
      data: true,
    };
  }

  if (dugiteResult.stdout.trim() === 'false') {
    return {
      success: true,
      data: false,
    };
  }

  return {
    success: false,
  };
}

async function getRepoRootPathOfNonBareRepo(
  folderPath: string,
): Promise<Result<string>> {
  const dugiteResult = await runDugiteCommand(
    ['rev-parse', '--show-toplevel'],
    folderPath,
  );

  if (dugiteResult.exitCode !== 0 || dugiteResult.stdout.length < 1) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: dugiteResult.stdout,
  };
}

export async function getRepoRootPath(
  folderPath: string,
): Promise<Result<string>> {
  const isBareFetchResult = await isBareRepo(folderPath);
  if (!isBareFetchResult.success) {
    return {
      success: false,
    };
  }
  if (isBareFetchResult.data === true) {
    return {
      success: true,
      data: folderPath,
    };
  }

  return getRepoRootPathOfNonBareRepo(folderPath);
}
