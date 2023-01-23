import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

export interface ShortCommitDetails {
  authorDate: number;
  authorEmail: string;
  subject: string;
}

export async function getLastAffectingCommit(params: {
  repoFolderPath: string;
  startCommitIsh: string;
  itemPath: string[];
}): Promise<Result<ShortCommitDetails>> {
  const path = params.itemPath.join('/');

  const dugiteResult = await runDugiteCommand(
    [
      'log',
      params.startCommitIsh,
      '-n',
      '1',
      '--format=%at%x00%ae%x00%s',
      path,
    ],
    params.repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  const [authorDate, authorEmail, subject, ...rest] =
    dugiteResult.stdout.split('\0');

  if (
    authorDate === undefined ||
    authorEmail === undefined ||
    subject === undefined ||
    rest.length > 0
  ) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: {
      authorDate: Number.parseInt(authorDate, 10),
      authorEmail: authorEmail,
      subject: subject,
    },
  };
}
