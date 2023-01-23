import { Box } from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import { TreeEntry, getTreeByPath } from '../../../ipc/git/tree';

import { TreeDetailsItem } from './tree-details-item';

interface Props {
  repoRootPath: string;
  branch: string;
  treePath: string[];

  selectChildTree: (childTreeName: string) => void;
  selectChildBlob: (childBlobName: string) => void;
}
export const TreeDetails: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      {controller.sortedTreeContent !== undefined && (
        <Box className={classNames('Box')}>
          {controller.sortedTreeContent.map((treeItem) => (
            <TreeDetailsItem
              key={`${treeItem.hash}-${treeItem.name}`}
              repoRootPath={props.repoRootPath}
              branch={props.branch}
              treeItem={treeItem}
              treeItemPath={[...props.treePath, treeItem.name]}
              onClick={(): void =>
                treeItem.type === 'blob'
                  ? props.selectChildBlob(treeItem.name)
                  : props.selectChildTree(treeItem.name)
              }
            />
          ))}
        </Box>
      )}
    </React.Fragment>
  );
};

interface State {
  treeContent: TreeEntry[] | undefined;
}
interface Controller {
  state: State;

  sortedTreeContent: TreeEntry[] | undefined;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    treeContent: undefined,
  });

  React.useEffect((): void => {
    void (async (): Promise<void> => {
      const treeFetchResult = await getTreeByPath({
        repoFolderPath: props.repoRootPath,
        commitIsh: props.branch,
        treePath: props.treePath,
      });
      if (!treeFetchResult.success) {
        return;
      }

      setState((state) => ({
        ...state,
        treeContent: treeFetchResult.data,
      }));
    })();
  }, [props.branch, props.repoRootPath, props.treePath]);

  const sortedTreeContent = React.useMemo((): TreeEntry[] | undefined => {
    if (!state.treeContent) {
      return undefined;
    }

    const treeContentCopy = [...state.treeContent];
    treeContentCopy.sort((a, b) => {
      if (a.type === 'tree' && b.type === 'blob') {
        return -1;
      }
      if (a.type === 'blob' && b.type === 'tree') {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });

    return treeContentCopy;
  }, [state.treeContent]);

  return {
    state: state,

    sortedTreeContent: sortedTreeContent,
  };
}
