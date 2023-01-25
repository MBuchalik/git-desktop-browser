import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

import { buildBlobOrTreeRef } from './common';
import { ShortCommitDetails } from './log';
import { createFormatter } from './util/formatter';

export interface CommitDetailsWithBody extends ShortCommitDetails {
  body: string;
}

export async function getCommitDetails(params: {
  repoFolderPath: string;
  commitIsh: string;
}): Promise<Result<CommitDetailsWithBody>> {
  const formatter = createFormatter({
    longCommitHash: '%H',
    authorDate: '%at',
    authorEmail: '%ae',
    subject: '%s',
    body: '%b',
  });

  const dugiteResult = await runDugiteCommand(
    ['show', params.commitIsh, ...formatter.formatParams],
    params.repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  // For some reason, the result includes two consecutive null characters to divide the body.
  const cleanedUpStdout = dugiteResult.stdout.replace('\0\0', '\0');

  const formatterResult = formatter.format(cleanedUpStdout);

  const resultItem = formatterResult[0];
  if (formatterResult.length !== 1 || !resultItem) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: {
      ...resultItem,
      authorDate: Number.parseInt(resultItem.authorDate, 10),
    },
  };
}

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
