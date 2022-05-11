import { Result } from '../../models/result';
import { runDugiteCommand } from '../ipc-bridge';

import { parseRef } from './rev';

export interface TreeEntry {
  type: 'tree' | 'blob';
  hash: string;
  name: string;
}

function buildTreeIsh(
  commitIsh: string,
  treePath: ReadonlyArray<string>,
): string {
  if (treePath.length < 1) {
    return commitIsh;
  }

  const treePathAsString = treePath.join('/');

  return `${commitIsh}:${treePathAsString}`;
}

export async function getTreeByPath(
  repoFolderPath: string,
  commitIsh: string,
  treePath: ReadonlyArray<string>,
): Promise<Result<TreeEntry[]>> {
  const treeIsh = buildTreeIsh(commitIsh, treePath);

  const refParseResult = parseRef(repoFolderPath, treeIsh);
  if (!(await refParseResult).success) {
    return {
      success: false,
    };
  }

  const dugiteResult = await runDugiteCommand(
    ['ls-tree', treeIsh, '-z'],
    repoFolderPath,
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
