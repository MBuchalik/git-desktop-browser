import { Result } from '../../models/result';
import { runDugiteCommand } from '../ipc-bridge';

export interface TreeEntry {
  type: 'tree' | 'blob';
  hash: string;
  name: string;
}

function buildTreeRef(
  commitIsh: string,
  treePath: ReadonlyArray<string>,
): string {
  if (treePath.length < 1) {
    return commitIsh;
  }

  const treePathAsString = treePath.join('/');

  return `${commitIsh}:${treePathAsString}`;
}

export async function getTreeByPath(params: {
  repoFolderPath: string;
  commitIsh: string;
  treePath: ReadonlyArray<string>;
}): Promise<Result<TreeEntry[]>> {
  const treeRef = buildTreeRef(params.commitIsh, params.treePath);

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
