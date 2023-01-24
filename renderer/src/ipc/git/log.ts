import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

import { createFormatter } from './util/formatter';

export interface ShortCommitDetails {
  longCommitHash: string;
  authorDate: number;
  authorEmail: string;
  subject: string;
}

export async function getCommitHistory(params: {
  repoFolderPath: string;
  startCommitIsh: string;
  itemPath: string[];
  limit?: number;
}): Promise<Result<ShortCommitDetails[]>> {
  const formatter = createFormatter({
    longCommitHash: '%H',
    authorDate: '%at',
    authorEmail: '%ae',
    subject: '%s',
  });

  let limitParams: string[] = [];
  if (params.limit !== undefined) {
    limitParams = ['-n', params.limit.toString()];
  }

  const dugiteResult = await runDugiteCommand(
    [
      'log',
      params.startCommitIsh,
      ...limitParams,
      ...formatter.formatParams,

      ...buildPathArguments(params.itemPath),
    ],
    params.repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  const formatterResult = formatter.format(dugiteResult.stdout);
  const resultData: ShortCommitDetails[] = [];

  for (const formatterResultItem of formatterResult) {
    resultData.push({
      ...formatterResultItem,
      authorDate: Number.parseInt(formatterResultItem.authorDate, 10),
    });
  }

  return {
    success: true,
    data: resultData,
  };
}

export async function getLastAffectingCommit(params: {
  repoFolderPath: string;
  startCommitIsh: string;
  itemPath: string[];
}): Promise<Result<ShortCommitDetails>> {
  const historyFetchResult = await getCommitHistory({ ...params, limit: 1 });
  if (!historyFetchResult.success) {
    return historyFetchResult;
  }

  if (!historyFetchResult.data[0]) {
    return {
      success: false,
    };
  }

  return {
    success: true,
    data: historyFetchResult.data[0],
  };
}

function buildPathArguments(itemPath: string[]): string[] {
  if (itemPath.length < 1) {
    return [];
  }

  const joinedPath = itemPath.join('/');

  return [
    /*
        Use a separator between the commands and the path to avoid the following error:
        
        fatal: ambiguous argument '<the-path-here>': unknown revision or path not in the working tree.
        Use '--' to separate paths from revisions, like this:
        'git <command> [<revision>...] -- [<file>...]'
      */
    '--',
    joinedPath,
  ];
}
