import { Result } from 'micro-result';

import { runDugiteCommand } from '../ipc-bridge';

import { buildBlobOrTreeRef } from './common';

export interface TreeEntry {
  type: 'tree' | 'blob';
  hash: string;
  name: string;
}

export async function getTreeByPath(params: {
  repoFolderPath: string;
  commitIsh: string;
  treePath: string[];
}): Promise<Result<TreeEntry[]>> {
  const treeRef = buildBlobOrTreeRef(params.commitIsh, params.treePath);

  const dugiteResult = await runDugiteCommand(
    ['ls-tree', treeRef, '-z'],
    params.repoFolderPath,
  );

  if (dugiteResult.exitCode !== 0) {
    return {
      success: false,
    };
  }

  const result: TreeEntry[] = [];

  const lines = dugiteResult.stdout.split('\0');

  for (const line of lines) {
    const [mode, type, hash, ...rest] = line.split(new RegExp('\\s'));

    if (
      mode === undefined ||
      type === undefined ||
      hash === undefined ||
      rest.length < 1
    ) {
      continue;
    }

    if (type !== 'blob' && type !== 'tree') {
      continue;
    }

    const name = rest.join(' ');

    result.push({
      type: type,
      hash: hash,
      name: name,
    });
  }

  return {
    success: true,
    data: result,
  };
}
